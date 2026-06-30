import { 
    makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore,
    Browsers
} from '@whiskeysockets/baileys';
import pino from 'pino';
import { Boom } from '@hapi/boom';
import chalk from 'chalk';
import config from './config.js';
import storage from './storage.js';
import streamManager from './ffmpeg.js';
import { loadCommands } from './lib/commandHandler.js';

async function startBot() {
    await storage.init();
    const commands = await loadCommands();
    console.log(chalk.green(`[System] تم تحميل ${commands.size} أمر بنجاح.`));

    const { state, saveCreds } = await useMultiFileAuthState(config.sessionName);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: !config.usePairingCode,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        browser: Browsers.macOS('Desktop'),
        syncFullHistory: false
    });

    // إعداد Pairing Code إذا كان مفعلاً
    if (config.usePairingCode && !sock.authState.creds.registered) {
        if (!config.pairingNumber) {
            console.log(chalk.red('[Error] PAIRING_NUMBER مطلوب عندما يكون USE_PAIRING_CODE مفعلاً.'));
            process.exit(1);
        }
        setTimeout(async () => {
            let code = await sock.requestPairingCode(config.pairingNumber);
            console.log(chalk.black.bgGreen(`[Pairing Code] كود الربط الخاص بك هو: ${code}`));
        }, 3000);
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(chalk.yellow(`[Connection] تم إغلاق الاتصال. السبب: ${lastDisconnect.error}. إعادة الاتصال: ${shouldReconnect}`));
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log(chalk.green('[Connection] تم فتح الاتصال بنجاح! البوت جاهز الآن.'));
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;

        const remoteJid = m.key.remoteJid;
        const messageText = m.message.conversation || m.message.extendedTextMessage?.text || '';
        
        if (!messageText.startsWith(config.prefix)) return;

        // التحقق من الصلاحية
        const isAuthorized = await storage.isAuthorized(remoteJid);
        if (!isAuthorized) {
            return await sock.sendMessage(remoteJid, { text: '❌ عذراً، أنت غير مصرح لك باستخدام هذا البوت.' }, { quoted: m });
        }

        const args = messageText.slice(config.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = commands.get(commandName);
        if (!command) return;

        try {
            await command.execute(sock, m, args);
        } catch (error) {
            console.error(chalk.red(`[Error] خطأ في تنفيذ الأمر ${commandName}:`), error);
            await sock.sendMessage(remoteJid, { text: config.error }, { quoted: m });
        }
    });

    // مراقبة توقف البث لإرسال إشعار
    streamManager.setOnStop(async (code) => {
        if (code !== 0 && code !== null) {
            const ownerJid = `${config.owner}@s.whatsapp.net`;
            await sock.sendMessage(ownerJid, { text: `⚠️ تنبيه: توقفت عملية FFmpeg فجأة بالكود (${code}). يرجى التحقق من رابط البث.` });
        }
    });
}

startBot().catch(err => console.error(chalk.red('[Fatal Error]'), err));
