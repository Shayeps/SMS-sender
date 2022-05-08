const mongoose = require('mongoose');
const dotenv = require('dotenv');

const FullAdModel = require('./models/full_ad_model.js');
const ShalowAdModel = require('./models/shallow_ad_model.js');
const User = require('./models/user_model.js');

const connectDB = require('./routes/dbInitiate.js');

const users = require('../clients.js');
const ads = require('../ads.js');

dotenv.config();

let type = process.argv[3] === '-prod' ? 'PROD' : 'DEV';

connectDB(type);

const detroyData = async () => {
    try {
        await FullAdModel.deleteMany();
        await ShalowAdModel.deleteMany();
        await User.deleteMany();

        console.log('Data Destroyed!')
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

const importData = async () => {
    try {
        await FullAdModel.deleteMany();
        await ShalowAdModel.deleteMany();
        await User.deleteMany();

        await User.insertMany(users);

        console.log('Data Imported!')
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    detroyData()
} else if (process.argv[2] === '-b') {
    importData();
} else {
    console.log('No arguments were found. Use -b to build the database or -d to destroy it')
    process.exit(0);
}