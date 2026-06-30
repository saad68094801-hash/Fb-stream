import streamManager from '../ffmpeg.js';
import config from '../config.js';

export default {
    name: 'fbstream',
    description: 'بدء بث M3U8 إلى فيسبوك',
    async execute(sock, m, args) {
        if (args.length === 0) {
            return await sock.sendMessage(m.key.remoteJid, { text: 'يرجى إدخال رابط M3U8. مثال: .fbstream http://example.com/live.m3u8' }, { quoted: m });
        }

        const m3u8Url = args[0];
        
        // التحقق من صحة الرابط بشكل بسيط
        if (!m3u8Url.startsWith('http')) {
            return await sock.sendMessage(m.key.remoteJid, { text: '❌ رابط M3U8 غير صالح.' }, { quoted: m });
        }

        await sock.sendMessage(m.key.remoteJid, { text: config.wait }, { quoted: m });

        try {
            await streamManager.start(m3u8Url);
            await sock.sendMessage(m.key.remoteJid, { text: '🚀 بدأ البث بنجاح على فيسبوك!' }, { quoted: m });
        } catch (error) {
            await sock.sendMessage(m.key.remoteJid, { text: `❌ فشل بدء البث: ${error.message}` }, { quoted: m });
        }
    }
};
