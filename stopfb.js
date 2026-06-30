import streamManager from '../ffmpeg.js';

export default {
    name: 'stopfb',
    description: 'إيقاف البث المباشر',
    async execute(sock, m, args) {
        const stopped = streamManager.stop();
        if (stopped) {
            await sock.sendMessage(m.key.remoteJid, { text: '⏹️ تم إيقاف البث المباشر.' }, { quoted: m });
        } else {
            await sock.sendMessage(m.key.remoteJid, { text: '⚠️ لا يوجد بث يعمل حالياً لإيقافه.' }, { quoted: m });
        }
    }
};
