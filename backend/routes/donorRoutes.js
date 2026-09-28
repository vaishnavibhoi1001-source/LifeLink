const express = require("express");
const router = express.Router();

const Donor = require("../models/Donor");


// ==========================================
// REGISTER DONOR
// ==========================================

router.post("/register", async (req, res) => {

    try {

        const {
            name,
            age,
            gender,
            weight,
            bloodGroup,
            mobile,
            contactConsent,
            city,
            district,
            state,
            firstTimeDonor,
            lastDonationDate,
            availability
        } = req.body;


        // Required fields
        if (
            !name ||
            !age ||
            !gender ||
            !weight ||
            !bloodGroup ||
            !mobile ||
            !city ||
            !district ||
            !state ||
            !availability
        ) {
            return res.status(400).json({
                message: "Please fill all required fields."
            });
        }


        // Age validation
        if (Number(age) < 18) {

            return res.status(400).json({
                message: "Age must be 18 or above."
            });
        }


        // Gender validation
        if (!["Male", "Female", "Other"].includes(gender)) {

            return res.status(400).json({
                message: "Invalid gender."
            });
        }


        // Weight validation
        if (Number(weight) <= 0) {

            return res.status(400).json({
                message: "Please enter a valid weight."
            });
        }


        // Contact consent
        if (contactConsent !== true) {

            return res.status(400).json({
                message:
                    "Please agree to share your contact number for blood donation requests."
            });
        }


        // Mobile validation
        if (!/^[0-9]{10}$/.test(mobile)) {

            return res.status(400).json({
                message: "Please enter a valid 10-digit mobile number."
            });
        }


        // Blood group validation
        const validBloodGroups = [
            "A+",
            "A-",
            "B+",
            "B-",
            "AB+",
            "AB-",
            "O+",
            "O-"
        ];

        if (!validBloodGroups.includes(bloodGroup)) {

            return res.status(400).json({
                message: "Invalid blood group."
            });
        }


        // Availability validation
        if (!["Available", "Not Available"].includes(availability)) {

            return res.status(400).json({
                message: "Invalid availability."
            });
        }


        const donor = new Donor({

            name,
            age,
            gender,
            weight,
            bloodGroup,
            mobile,

            contactConsent: true,

            city,
            district,
            state,

            firstTimeDonor,

            lastDonationDate:
                firstTimeDonor === true
                    ? lastDonationDate || null
                    : null,

            availability
        });


        const savedDonor = await donor.save();


        res.status(201).json({

            message: "Donor registered successfully!",

            donorId: savedDonor._id

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Donor registration failed."
        });
    }
});



// ==========================================
// SEARCH DONORS
// ==========================================

router.get("/search", async (req, res) => {

    try {

        const {
            bloodGroup,
            city,
            district,
            state
        } = req.query;


        if (!bloodGroup) {

            return res.status(400).json({
                message: "Blood group is required."
            });
        }


        const baseQuery = {

            bloodGroup,

            availability: "Available"
        };


        // CITY MATCH
        if (city) {

            const cityDonors = await Donor.find({

                ...baseQuery,

                city: {
                    $regex: `^${city}$`,
                    $options: "i"
                }

            }).sort({ createdAt: -1 });


            if (cityDonors.length > 0) {

                return res.json(
                    cityDonors.map(donor => ({

                        ...donor.toObject(),

                        matchLevel: "City Match",

                        mobile:
                            donor.contactConsent
                                ? donor.mobile
                                : null

                    }))
                );
            }
        }


        // DISTRICT MATCH
        if (district) {

            const districtDonors = await Donor.find({

                ...baseQuery,

                district: {
                    $regex: `^${district}$`,
                    $options: "i"
                }

            }).sort({ createdAt: -1 });


            if (districtDonors.length > 0) {

                return res.json(
                    districtDonors.map(donor => ({

                        ...donor.toObject(),

                        matchLevel: "District Match",

                        mobile:
                            donor.contactConsent
                                ? donor.mobile
                                : null

                    }))
                );
            }
        }


        // STATE MATCH
        if (state) {

            const stateDonors = await Donor.find({

                ...baseQuery,

                state: {
                    $regex: `^${state}$`,
                    $options: "i"
                }

            }).sort({ createdAt: -1 });


            if (stateDonors.length > 0) {

                return res.json(
                    stateDonors.map(donor => ({

                        ...donor.toObject(),

                        matchLevel: "State Match",

                        mobile:
                            donor.contactConsent
                                ? donor.mobile
                                : null

                    }))
                );
            }
        }


        // NO DONOR FOUND
        return res.json([]);


    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Unable to search donors."
        });
    }
});



// ==========================================
// GET DONOR PROFILE BY MOBILE
// ==========================================

router.get("/profile/mobile/:mobile", async (req, res) => {

    try {

        const mobile = req.params.mobile;


        // Mobile validation
        if (!/^[0-9]{10}$/.test(mobile)) {

            return res.status(400).json({
                message: "Please enter a valid 10-digit mobile number."
            });
        }


        const donor = await Donor.findOne({
            mobile: mobile
        });


        if (!donor) {

            return res.status(404).json({
                message:
                    "No donor profile found with this mobile number."
            });
        }


        res.json({

            id: donor._id,

            name: donor.name,

            age: donor.age,

            gender: donor.gender,

            weight: donor.weight,

            bloodGroup: donor.bloodGroup,

            mobile:
                donor.contactConsent
                    ? donor.mobile
                    : null,

            contactConsent:
                donor.contactConsent,

            city: donor.city,

            district: donor.district,

            state: donor.state,

            firstTimeDonor:
                donor.firstTimeDonor,

            lastDonationDate:
                donor.lastDonationDate,

            availability:
                donor.availability

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Unable to load donor profile."
        });
    }
});



// ==========================================
// GET DONOR PROFILE BY ID
// ==========================================

router.get("/profile/:id", async (req, res) => {

    try {

        const donor = await Donor.findById(
            req.params.id
        );


        if (!donor) {

            return res.status(404).json({
                message: "Donor profile not found."
            });
        }


        res.json({

            id: donor._id,

            name: donor.name,

            age: donor.age,

            gender: donor.gender,

            weight: donor.weight,

            bloodGroup: donor.bloodGroup,

            mobile:
                donor.contactConsent
                    ? donor.mobile
                    : null,

            contactConsent:
                donor.contactConsent,

            city: donor.city,

            district: donor.district,

            state: donor.state,

            firstTimeDonor:
                donor.firstTimeDonor,

            lastDonationDate:
                donor.lastDonationDate,

            availability:
                donor.availability

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Unable to load donor profile."
        });
    }
});



// ==========================================
// EDIT DONOR PROFILE
// ==========================================

router.put("/profile/:id", async (req, res) => {

    try {

        const {
            name,
            age,
            gender,
            weight,
            city,
            district,
            state,
            availability,
            lastDonationDate
        } = req.body;


        const donor =
            await Donor.findById(
                req.params.id
            );


        if (!donor) {

            return res.status(404).json({
                message: "Donor profile not found."
            });
        }


        // Age validation
        if (age !== undefined && Number(age) < 18) {

            return res.status(400).json({
                message: "Age must be 18 or above."
            });
        }


        // Gender validation
        if (
            gender !== undefined &&
            !["Male", "Female", "Other"].includes(gender)
        ) {

            return res.status(400).json({
                message: "Invalid gender."
            });
        }


        // Weight validation
        if (weight !== undefined && Number(weight) <= 0) {

            return res.status(400).json({
                message: "Please enter a valid weight."
            });
        }


        // Availability validation
        if (
            availability !== undefined &&
            !["Available", "Not Available"].includes(availability)
        ) {

            return res.status(400).json({
                message: "Invalid availability."
            });
        }


        // Update fields
        if (name !== undefined)
            donor.name = name.trim();

        if (age !== undefined)
            donor.age = Number(age);

        if (gender !== undefined)
            donor.gender = gender;

        if (weight !== undefined)
            donor.weight = Number(weight);

        if (city !== undefined)
            donor.city = city.trim();

        if (district !== undefined)
            donor.district = district.trim();

        if (state !== undefined)
            donor.state = state.trim();

        if (availability !== undefined)
            donor.availability = availability;

        if (lastDonationDate !== undefined)
            donor.lastDonationDate =
                lastDonationDate || null;


        await donor.save();


        res.json({

            message:
                "Donor profile updated successfully!"

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Unable to update donor profile."
        });
    }
});



// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;