const express = require("express");
const Donor = require("../models/Donor");

const router = express.Router();


// ===============================
// Register New Donor
// ===============================

router.post("/register", async (req, res) => {
    try {
        const donor = new Donor(req.body);

        await donor.save();

        res.status(201).json({
            message: "Donor registered successfully!",
            donor: donor
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Donor registration failed.",
            error: error.message
        });
    }
});


// ===============================
// Search Donors
// City → District → State
// ===============================

router.get("/search", async (req, res) => {

    try {

        const {
            bloodGroup,
            city,
            district,
            state
        } = req.query;


        // 1. CITY MATCH
        let donors = await Donor.find({
            bloodGroup: bloodGroup,
            city: new RegExp(`^${city}$`, "i"),
            availability: "Available"
        });

        if (donors.length > 0) {

            donors = donors.map(donor => ({
                _id: donor._id,
                name: donor.name,
                age: donor.age,
                bloodGroup: donor.bloodGroup,
                mobile: donor.mobile,
                city: donor.city,
                district: donor.district,
                state: donor.state,
                availability: donor.availability,
                matchLevel: "City Match"
            }));

        }


        // 2. DISTRICT MATCH
        if (donors.length === 0) {

            donors = await Donor.find({
                bloodGroup: bloodGroup,
                district: new RegExp(`^${district}$`, "i"),
                availability: "Available"
            });

            donors = donors.map(donor => ({
                _id: donor._id,
                name: donor.name,
                age: donor.age,
                bloodGroup: donor.bloodGroup,
                mobile: donor.mobile,
                city: donor.city,
                district: donor.district,
                state: donor.state,
                availability: donor.availability,
                matchLevel: "District Match"
            }));

        }


        // 3. STATE MATCH
        if (donors.length === 0) {

            donors = await Donor.find({
                bloodGroup: bloodGroup,
                state: new RegExp(`^${state}$`, "i"),
                availability: "Available"
            });

            donors = donors.map(donor => ({
                _id: donor._id,
                name: donor.name,
                age: donor.age,
                bloodGroup: donor.bloodGroup,
                mobile: donor.mobile,
                city: donor.city,
                district: donor.district,
                state: donor.state,
                availability: donor.availability,
                matchLevel: "State Match"
            }));

        }


        res.status(200).json(donors);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Search failed.",
            error: error.message
        });

    }

});


module.exports = router;