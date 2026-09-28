const mongoose = require("mongoose");

const donorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        age: {
            type: Number,
            required: true,
            min: 18
        },

        gender: {
            type: String,
            required: true,
            enum: ["Male", "Female", "Other"]
        },

        weight: {
            type: Number,
            required: true,
            min: 1
        },

        bloodGroup: {
            type: String,
            required: true,
            enum: [
                "A+",
                "A-",
                "B+",
                "B-",
                "AB+",
                "AB-",
                "O+",
                "O-"
            ]
        },

        mobile: {
            type: String,
            required: true
        },

        contactConsent: {
            type: Boolean,
            required: true
        },

        city: {
            type: String,
            required: true,
            trim: true
        },

        district: {
            type: String,
            required: true,
            trim: true
        },

        state: {
            type: String,
            required: true,
            trim: true
        },

        firstTimeDonor: {
            type: Boolean,
            required: true
        },

        lastDonationDate: {
            type: Date,
            default: null
        },

        availability: {
            type: String,
            required: true,
            enum: ["Available", "Not Available"]
        }
    },
    {
        timestamps: true
    }
);

const Donor = mongoose.model("Donor", donorSchema);

module.exports = Donor;