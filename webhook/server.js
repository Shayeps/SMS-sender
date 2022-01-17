const express = require('express');
const schedule = require('node-schedule');

const connectDB = require('./routes/dbInitiate.js');
const initiateWebhook = require('./routes/webhookInitiate');
const webhookRoutes = require('./routes/webhookRoutes.js');

let type = process.argv[2] === '-prod' ? 'PROD' : 'DEV';

initiateWebhook();
connectDB(type);

const app = express();

app.use('/webhook', webhookRoutes.router);

// CRON JOB - REGULAR INITIATION
const job = schedule.scheduleJob('0,30 8-20 * * *', () => {
    webhookRoutes.initiateForAll();
});

//INITIATION FOR TESTING
// setTimeout(() => {
//     webhookRoutes.initiateForAll();
// }, 45e3);

app.listen(3050);