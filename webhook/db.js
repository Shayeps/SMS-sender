const mongoose = require("mongoose");
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URI,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    );

    db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error: "));
    db.once("open", function () {
        console.log("Connected successfully");
    });
};

module.exports = connectDB;