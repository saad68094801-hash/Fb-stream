import dotenv from 'dotenv';
dotenv.config();

const config = {
    owner: process.env.OWNER || '212642753962', // رقم المالك مع رمز الدولة
    botName: 'FB Stream Bot',
    author: 'Manus',
    prefix: '.',
    pairingNumber: process.env.PAIRING_NUMBER || '212606813028', // الرقم الذي سيتم استخدامه لـ Pairing Code
    usePairingCode: process.env.USE_PAIRING_CODE === 'true',
    sessionName: 'session',
    footer: '© 2026 FB Stream Bot',
    wait: 'جاري التنفيذ، يرجى الانتظار...',
    error: 'حدث خطأ ما، يرجى المحاولة لاحقاً.',
    databasePath: './database/db.json',
    ffmpegPath: 'ffmpeg' // تأكد من تثبيت ffmpeg في النظام
};

export default config;
