import storage from '../storage.js';

export default {
    name: 'setfb',
    description: 'حفظ مفتاح بث فيسبوك',
    async execute(sock, m, args) {
        if (args.length === 0) {
            return await sock.sendMessage(m.key.remoteJid, { text: 'يرجى إدخال مفتاح البث. مثال: .setfb 123456789' }, { quoted: m });
        }

        const streamKey = args[0];
        await storage.updateSettings({ streamKey });
        
        await sock.sendMessage(m.key.remoteJid, { text: '✅ تم حفظ مفتاح البث بنجاح.' }, { quoted: m });
    }
};
