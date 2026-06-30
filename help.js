import config from '../config.js';

export default {
    name: 'help',
    description: 'عرض قائمة الأوامر',
    async execute(sock, m, args) {
        const helpText = `
*📱 قائمة أوامر البوت:*

*⚙️ الإعدادات:*
- \`${config.prefix}setfb STREAM_KEY\` : حفظ مفتاح البث.
- \`${config.prefix}setrtmp URL\` : تغيير رابط RTMP.

*🎥 البث المباشر:*
- \`${config.prefix}fbstream M3U8_URL\` : بدء البث المباشر.
- \`${config.prefix}stopfb\` : إيقاف البث.
- \`${config.prefix}fbstatus\` : حالة البث الحالية.

*❓ أخرى:*
- \`${config.prefix}help\` : عرض هذه القائمة.

_بواسطة: ${config.author}_
        `;
        await sock.sendMessage(m.key.remoteJid, { text: helpText.trim() }, { quoted: m });
    }
};
