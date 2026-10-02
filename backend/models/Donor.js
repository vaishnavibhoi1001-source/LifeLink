const mongoose = require("mongoose");

const donorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    age: {
      type: Number,
      required: true,
      min: 18,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    weight: {
      type: Number,
      required: true,
      min: 1,
    },

    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: true,
    },

    mobile: { type: String, required: true, unique: true },
    

    // Used later for secure profile verification
    // Existing donors will automatically have null here
    pinHash: {
      type: String,
      default: null,
    },

    contactConsent: {
      type: Boolean,
      required: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    district: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    firstTimeDonor: {
      type: Boolean,
      required: true,
    },

    lastDonationDate: {
      type: Date,
      default: null,
    },

    availability: {
      type: String,
      enum: ["Available", "Not Available"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Donor", donorSchema);