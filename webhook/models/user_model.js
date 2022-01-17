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
    search_for: {
        type: String,
        default: 'cars'
    },
    srch_urls: {
        type: Array,
        required: true
    },
    frst_run: {
        type: Boolean,
        default: true
    },
    funds: {
        type: Number
    }
}, {
    timestamps: true
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;