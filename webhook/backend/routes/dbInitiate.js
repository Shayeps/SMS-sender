const mongoose = require("mongoose");
const dotenv = require('dotenv');
const loggingFunc = require('../utils/logging.js');

dotenv.config();

const connectDB = async (type) => {
    try {
        let connectionString = type === 'PROD' ? process.env.MONGO_URI : process.env.MONGO_URI_DEV;
        const conn = await mongoose.connect(connectionString, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        })

        return loggingFunc(`MongoDB connected: ${conn.connection.host} -- ${type}`, 'success')
    } catch (error) {
        return loggingFunc(`${error.message}`, 'error');
    }
};

module.exports = connectDB;