const request = require('request-promise');
const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const loggingFunc = require('../utils/logging.js');

const AdSchema = require('../models/shallow_ad_model.js');
const UserModel = require('../models/user_model.js');

const accountSid = process.env.ACCOUNT_SMS_SID;
const authToken = process.env.ACCOUNT_SMS_TOKEN;
const client = require('twilio')(accountSid, authToken);

dotenv.config();
let clients = [];

const initiateForAll = async () => {
    clients = await UserModel.find({});

    if (!clients) return loggingFunc(`Error while pulling customers from DB`, 'error');

    clients.forEach(async (client) => {
        let { name, srch_urls, funds } = client;
        client.req_id = [];
        if (!funds) {
            loggingFunc(`No funds for user ${name}`, 'error');
        } else {
            let requests = buildRequest(srch_urls);
            if (requests) {
                try {
                    let res = await Promise.allSettled(requests);
                    res.forEach(r => client.req_id.push(JSON.parse(r.value).collection_id))
                } catch (error) {
                    loggingFunc(`${error}`, 'error');
                }
            }
        }
    })
};

// @desc    Get results from webhook, arrange in DB and message users
// @route   POST /webhook/result
// @access  public
router.post('/result', async (req, res) => {
    let target_path = req.get('dca-collection-id');
    if (!target_path.includes('test')) {
        let usr = clients.find(client => client.req_id[0] === target_path);
        const result = await streamToString(req);
        //console.log('RESULT: ', result);
        //await insertToMongo(result, usr);
    }

    // -------------- pushing the response into mongo and send SMS
    async function insertToMongo(results, usr) {
        try {
            let filtered_results = JSON.parse(results).filter(r => r.id);
            let uniqueResults = [];

            if (filtered_results.length && !usr.frst_run) {
                loggingFunc(`RESULTS LENGTH ------>>>>>>> ${filtered_results.length}`, 'success');
                const mongo_res = await AdSchema.findOne({ user: usr._id });
                loggingFunc(`MONGO_RES LENGTH ------>>>>>>> ${mongo_res?.ads.length || 0}`, 'success');

                uniqueResults = filtered_results.filter(obj => {
                    return !mongo_res.ads.some(obj2 => {
                        return obj.id == obj2.id;
                    });
                });
                loggingFunc(`RESULT LENGTH AFTER FILTERING ------>>>>>>> ${uniqueResults.length}`, 'success');

                if (uniqueResults.length) {
                    await AdSchema.updateOne(
                        { user: usr._id },
                        {
                            $push: {
                                ads: {
                                    $each: uniqueResults,
                                }
                            }
                        }
                    );
                    loggingFunc(`RESULTS UPDATED IN DB for ${usr.name}`, 'success');
                    sendSMS(uniqueResults, usr);
                } else {
                    loggingFunc(`No new ads were found for ${usr.name}`, 'success');
                }
            } else if (filtered_results.length && usr.frst_run) {
                uniqueResults = filtered_results;
                loggingFunc(`RESULT FOR DB ------>>>>>>> ${uniqueResults.length}`, 'success');
                await AdSchema.create(
                    {
                        user: usr._id,
                        ads: uniqueResults,
                    });
                loggingFunc(`RESULTS CREATED IN DB for ${usr.name}`, 'success');
                await UserModel.updateOne({ _id: usr._id }, { $set: { frst_run: false } });
            }
        } catch (e) {
            loggingFunc(`${e}`, 'error')
        }
    };
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

function sendSMS(results, usr) {
    try {
        let body = '';
        if (results.length > 0 && results.length < 10) {
            body = 'new ads on yad2: \n';
            for (ad of results) {
                if (usr.search_for === 'cars')
                    body += `${ad.model} - ${ad.url} \n`
                else
                    body += `${ad.url} \n`
            }
        } else if (results.length >= 10) {
            body = `There are 10 or more new ads`
        }

        let numbersToMessage = [usr.phone]
        numbersToMessage.forEach(function (number) {
            var message = client.messages.create({
                body,
                from: process.env.FROM_NUM,
                to: number
            })
                .then(message => loggingFunc(`${message.status} - message sent.`, 'success'))
                .done();
        });
    } catch (e) {
        loggingFunc(`${e}`, 'error')
    }
};

function buildRequest(srch_urls) {
    let nadlan_data = [], cars_data = [], requests = [];
    srch_urls.forEach(item => {
        let type;
        let { url, frst_run } = item;
        type = url.includes('vehicles') ? type = 'cars' : url.includes('realestate') ? type = 'nadlan' : null;

        if (!type) return loggingFunc(`Wrong input URL ${url}`, 'error');

        if (type === 'cars') {
            cars_data.push(Object.assign({ url, frst_run }));
                 } 
            //     else {
            //         if (JSON.parse(frst_run)) {
            //             nadlan_data.push(Object.assign({ url, num_of_pages: "999", days_back: 10, include_mediator: true }));
            //         } else {
            //             nadlan_data.push(Object.assign({ url, num_of_pages: "1", days_back: 0, include_mediator: true }))
            //         }
            //     }
             })

            if (nadlan_data.length) {
                options = {
                    method: 'POST',
                    url: buildRequestUrl('nadlan'),
                    body: JSON.stringify(nadlan_data),
                    headers: {
                        'Authorization': `Bearer ${process.env.PROXY_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                };

                requests.push(request(options));
            }

            if (cars_data.length) {
                options = {
                    method: 'POST',
                    url: buildRequestUrl('cars'),
                    body: JSON.stringify(cars_data),
                    headers: {
                        'Authorization': `Bearer ${process.env.PROXY_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                }
                requests.push(request(options))
            }

            if (requests.length)
                return requests;
            else
                return loggingFunc('No valid URLs were found', 'error');
        }

        function buildRequestUrl(type) {
            let collector_IDs = { cars: `c_kx8lhpn3wotk7fazg`, nadlan: `c_kwkqodm0x23zwxb6` };
            let rand_queue = uuidv4().split('-')[0];
            return `https://api.luminati.io/dca/trigger?collector=${collector_IDs[type]}&queue_next=1&queue=${rand_queue}`;
        }

        module.exports = {
            router,
            initiateForAll,
        }