import storage from '../storage.js';

export default {
    name: 'setrtmp',
    description: 'تغيير رابط RTMP',
    async execute(sock, m, args) {
        if (args.length === 0) {
            return await sock.sendMessage(m.key.remoteJid, { text: 'يرجى إدخال رابط RTMP. مثال: .setrtmp rtmps://live-api-s.facebook.com:443/rtmp/' }, { quoted: m });
        }

        const rtmpUrl = args[0];
        await storage.updateSettings({ rtmpUrl });
        
        await sock.sendMessage(m.key.remoteJid, { text: '✅ تم تحديث رابط RTMP بنجاح.' }, { quoted: m });
    }
};
