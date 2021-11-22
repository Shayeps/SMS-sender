const ngrok = require('ngrok');
const dotenv = require('dotenv');
const express = require('express');
const connectDB = require('./db.js');

const accountSid = process.env.ACCOUNT_SMS_SID;
const authToken = process.env.ACCOUNT_SMS_TOKEN;
const client = require('twilio')(accountSid, authToken);

const AdSchema = require('./models');

dotenv.config();

connectDB();

// -------------- initiating webhook
(async function () {
    try {
        const url = await ngrok.connect({ port: process.env.NGROK_PORT, authtoken: process.env.NGROK_AUTH_TOKEN });
        logItem(`${url}/result`, 'success');
    } catch (e) {
        logItem(e, 'error')
    }
})();

const app = express();

app.post('/result', async (req, res) => {
    //console.log(req)
    let target_path = './' + req.get('dca-filename');
    if (!target_path.includes('test')) {
        const result = await streamToString(req)
        await insertToMongo(result);
    }
    res.send('ok')
});

// -------------- function to get response from stream
function streamToString(stream) {
    const chunks = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    })
};


// -------------- pushing the response into mongo and send SMS
async function insertToMongo(results) {
    try {
        let result = JSON.parse(results);
        result = result.filter(r => !r.message);
        logItem(`RESULTS LENGTH ------>>>>>>> ${result.length}`, 'success')
        const mongo_res = await AdSchema.find();
        logItem(`MONGO_RES LENGTH ------>>>>>>> ${mongo_res.length}`, 'success')

        var uniqueResults = result.filter(obj => {
            return !mongo_res.some(obj2 => {
                return obj.id == obj2.id;
            });
        });
        logItem(`RESULT LENGTH AFTER FILTERING ------>>>>>>> ${uniqueResults.length}`, 'success')


        if (uniqueResults.length === 0) {
            logItem(`No new ads were found`, 'success');
        } else {
            await AdSchema.insertMany(uniqueResults);

            logItem(`Collection is done. You got ${uniqueResults.length} new ads`, 'success');
            logItem(`IDS - - - - -`, 'success');
            for (const item of uniqueResults)
                logItem(`${item.url}`, 'success');

            let body = '';
            if (uniqueResults.length > 0 && uniqueResults.length < 10) {
                body = 'new ads on yad2: \n';
                for (ad of uniqueResults) {
                    body += `${ad.model} - ${ad.url} \n`
                }
            } else if (uniqueResults.length > 10) {
                body = `There are more than 10 new ads`
            }

            let numbersToMessage = [process.env.RECIPIENT1, process.env.RECIPIENT2]
            numbersToMessage.forEach(function (number) {
                var message = client.messages.create({
                    body,
                    from: process.env.FROM_NUM,
                    to: number
                })
                    .then(message => logItem(`${message.status} - message sent. ${message.sid}`, 'success'))
                    .done();
            });
        };
    } catch (e) {
        logItem(`${e}`, 'error')
    }
};


function logItem(item, type) {
    if (type === 'success') {
        console.log(`[${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}] ${item}`)
    } else {
        console.error(`[${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}] ${item}`)
    }
};

app.listen(3050);