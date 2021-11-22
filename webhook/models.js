const mongoose = require("mongoose");

const AdSchema = new mongoose.Schema({
    id: {
        type: String
    },
    model: {
        type: String
    },
    variant: {
        type: String
    },
    hand: {
        type: String
    },
    price: {
        type: String
    },
    year: {
        type: String
    },
    location: {
        type: String
    },
    image: {
        type: String
    },
    mileage: {
        type: String
    },
    transmission: {
        type: String
    },
    engine_size: {
        type: String
    },
    details: {
        type: String
    },
    seller_name: {
        type: String
    },
    seller_phone: {
        type: String
    },
    more_detals: mongoose.Schema.Types.Mixed,
    url: {
        type: String
    },
    dealership: {
        type: Boolean
    },
});

const AdModel = mongoose.model("Ad", AdSchema);

module.exports = AdModel;