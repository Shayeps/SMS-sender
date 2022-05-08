const mongoose = require('mongoose');
const dotenv = require('dotenv');

const FullAdModel = require('./models/full_ad_model.js');
const ShalowAdModel = require('./models/shallow_ad_model.js');
const UserModel = require('./models/user_model.js');

const connectDB = require('./routes/dbInitiate.js');

dotenv.config();

let id = process.argv[3];
let type = process.argv[4] === '-prod' ? 'PROD' : 'DEV';

connectDB(type);

const updateQuery = async () => {
    try {
        let client = await UserModel.findById(id)
        console.log(client)

        await UserModel.updateOne({ _id: client._id },
            { $set: { "srch_urls.$[element].frst_run": false } },
            { arrayFilters: [{ "element.frst_run": { $ne: false } }] });

        console.log('Process done')
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

const checkTrue = async () => {
    try {
        let client = await UserModel.findById(id)
        console.log(client)

        let frst_run_exist = client.srch_urls.findIndex(item => item.frst_run == 'true');
        console.log(typeof frst_run_exist)

        console.log('Process done')
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

if (process.argv[2] === '-u') {
    updateQuery()
} else if (process.argv[2] === '-c') {
    checkTrue()
} else {
    console.log('No arguments were found. Use -b to build the database or -d to destroy it')
    process.exit(0);
}