const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: {
        type: String
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String
    },
    password: {
        type: String,
        select: false
    },
    srch_urls: [
        {
            url: {
                type: String,
            },
            type: {
                type: String,
            },
            frst_run: {
                type: String,
            }
        }
    ],
    funds: {
        type: Number
    }
}, {
    timestamps: true
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;