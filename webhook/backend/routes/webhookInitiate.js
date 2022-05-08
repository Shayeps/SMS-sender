const ngrok = require('ngrok');
const dotenv = require('dotenv');
const loggingFunc = require('../utils/logging.js')

dotenv.config();

const initiateWebhook = async () => {
    try {
        const url = await ngrok.connect({ port: process.env.NGROK_PORT, authtoken: process.env.NGROK_AUTH_TOKEN });
        return loggingFunc(`${url}/webhook/result`, 'success');
    } catch (e) {
        return loggingFunc(e, 'error');
    }
};


module.exports = initiateWebhook;