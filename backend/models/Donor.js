const mongoose = require("mongoose");

const donorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        age: {
            type: Number,
            required: true,
            min: 18
        },

        bloodGroup: {
            type: String,
            required: true
        },

        mobile: {
            type: String,
            required: true
        },

        city: {
            type: String,
            required: true
        },

        district: {
            type: String,
            required: true
        },

        state: {
            type: String,
            required: true
        },

        availability: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Donor = mongoose.model("Donor", donorSchema);

module.exports = Donor;