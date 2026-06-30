import { spawn } from 'child_process';
import storage from './storage.js';
import chalk from 'chalk';

class StreamManager {
    constructor() {
        this.process = null;
        this.startTime = null;
        this.currentUrl = null;
        this.onStopCallback = null;
    }

    setOnStop(callback) {
        this.onStopCallback = callback;
    }

    async start(m3u8Url) {
        if (this.process) {
            throw new Error('البث يعمل بالفعل، يرجى إيقافه أولاً.');
        }

        const settings = await storage.getSettings();
        if (!settings.streamKey) {
            throw new Error('لم يتم تعيين مفتاح البث (Stream Key). استخدم .setfb أولاً.');
        }

        const rtmpTarget = `${settings.rtmpUrl}${settings.streamKey}`;
        
        // إعدادات FFmpeg للبث المباشر
        const args = [
            '-re',
            '-i', m3u8Url,
            '-c:v', 'libx264',
            '-preset', 'veryfast',
            '-maxrate', '3000k',
            '-bufsize', '6000k',
            '-pix_fmt', 'yuv420p',
            '-g', '50',
            '-c:a', 'aac',
            '-b:a', '128k',
            '-ar', '44100',
            '-f', 'flv',
            rtmpTarget
        ];

        this.process = spawn('ffmpeg', args);
        this.startTime = Date.now();
        this.currentUrl = m3u8Url;

        await storage.updateSettings({
            isStreaming: true,
            lastM3u8: m3u8Url,
            startTime: this.startTime
        });

        this.process.stdout.on('data', (data) => {
            console.log(chalk.blue(`[FFmpeg STDOUT]: ${data}`));
        });

        this.process.stderr.on('data', (data) => {
            console.error(chalk.red(`[FFmpeg STDERR]: ${data}`));
        });

        this.process.on('close', async (code) => {
            console.log(chalk.yellow(`[FFmpeg] تم إغلاق العملية بالكود: ${code}`));
            this.process = null;
            this.startTime = null;
            
            await storage.updateSettings({
                isStreaming: false,
                startTime: null
            });

            if (this.onStopCallback) {
                this.onStopCallback(code);
            }
        });

        return true;
    }

    stop() {
        if (this.process) {
            this.process.kill('SIGINT');
            this.process = null;
            return true;
        }
        return false;
    }

    getStatus() {
        return {
            isStreaming: !!this.process,
            startTime: this.startTime,
            currentUrl: this.currentUrl,
            uptime: this.startTime ? Math.floor((Date.now() - this.startTime) / 1000) : 0
        };
    }
}

const streamManager = new StreamManager();
export default streamManager;
