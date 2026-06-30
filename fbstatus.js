import streamManager from '../ffmpeg.js';
import storage from '../storage.js';

export default {
    name: 'fbstatus',
    description: 'عرض حالة البث الحالية',
    async execute(sock, m, args) {
        const status = streamManager.getStatus();
        const settings = await storage.getSettings();
        
        const formatTime = (seconds) => {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            const s = seconds % 60;
            return `${h}h ${m}m ${s}s`;
        };

        const statusText = `
*📊 حالة البث الحالية:*

- *الحالة:* ${status.isStreaming ? '🟢 يعمل' : '🔴 متوقف'}
- *وقت التشغيل:* ${status.isStreaming ? formatTime(status.uptime) : '0s'}
- *الرابط الحالي:* ${status.currentUrl || settings.lastM3u8 || 'لا يوجد'}
- *رابط RTMP:* ${settings.rtmpUrl}
- *مفتاح البث:* ${settings.streamKey ? '✅ محفوظ' : '❌ غير مضبوط'}
        `;
        
        await sock.sendMessage(m.key.remoteJid, { text: statusText.trim() }, { quoted: m });
    }
};
