const mongoose = require("mongoose");

const AdSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    ads: [{
        id: String,
        model: {
            type: String,
            default: ''
        },
        url: String,
        mediator: {
            type: Boolean,
            default: false
        },
        date: {
            type: Date,
            default: Date.now(),
        }
    }],
}, {
    timestamps: true
});

const AdModel = mongoose.model("Ad", AdSchema);

module.exports = AdModel;