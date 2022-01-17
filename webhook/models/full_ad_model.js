const mongoose = require("mongoose");

const AdSchemaFull = new mongoose.Schema({
    ad: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Ad'
    },
    model: {
        type: String
    },
    url: {
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
    dealership: {
        type: Boolean
    },
}, {
    timestamps: true
});

const AdModelFull = mongoose.model("Full_Ad", AdSchemaFull);

module.exports = AdModelFull;