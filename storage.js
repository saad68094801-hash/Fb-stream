import { JSONFilePreset } from 'lowdb/node';
import config from './config.js';

const defaultData = {
    settings: {
        streamKey: '',
        rtmpUrl: 'rtmps://live-api-s.facebook.com:443/rtmp/',
        lastM3u8: '',
        isStreaming: false,
        startTime: null
    },
    authorizedUsers: [config.owner]
};

class Storage {
    constructor() {
        this.db = null;
    }

    async init() {
        this.db = await JSONFilePreset(config.databasePath, defaultData);
        await this.db.write();
    }

    async getSettings() {
        return this.db.data.settings;
    }

    async updateSettings(newData) {
        this.db.data.settings = { ...this.db.data.settings, ...newData };
        await this.db.write();
    }

    async isAuthorized(remoteJid) {
        const number = remoteJid.split('@')[0];
        return this.db.data.authorizedUsers.includes(number) || number === config.owner;
    }
}

const storage = new Storage();
export default storage;
