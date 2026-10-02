const express = require("express");
const router = express.Router();
const crypto = require("crypto");

const Donor = require("../models/Donor");


// ==========================================
// SECURITY SETTINGS
// ==========================================

const PROFILE_SECURITY_SECRET =
    process.env.PROFILE_SECURITY_SECRET ||
    "lifelink-profile-security-secret";

const VERIFICATION_TOKEN_EXPIRY = 10 * 60 * 1000;


// ==========================================
// PIN SECURITY HELPERS
// ==========================================

// Create secure PIN hash
function hashPin(pin) {

    const salt = crypto.randomBytes(16).toString("hex");

    const hash = crypto
        .scryptSync(pin, salt, 64)
        .toString("hex");

    return `${salt}:${hash}`;
}


// Compare entered PIN with stored hash
function verifyPin(pin, storedHash) {

    if (!storedHash) {
        return false;
    }

    const parts = storedHash.split(":");

    if (parts.length !== 2) {
        return false;
    }

    const salt = parts[0];
    const originalHash = parts[1];

    const newHash = crypto
        .scryptSync(pin, salt, 64)
        .toString("hex");

    const originalBuffer =
        Buffer.from(originalHash, "hex");

    const newBuffer =
        Buffer.from(newHash, "hex");

    if (originalBuffer.length !== newBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(
        originalBuffer,
        newBuffer
    );
}


// ==========================================
// CREATE PROFILE VERIFICATION TOKEN
// ==========================================

function createVerificationToken(donorId) {

    const payload = {

        id: String(donorId),

        exp:
            Date.now() +
            VERIFICATION_TOKEN_EXPIRY

    };

    const payloadString =
        JSON.stringify(payload);

    const encodedPayload =
        Buffer.from(payloadString)
            .toString("base64url");

    const signature =
        crypto
            .createHmac(
                "sha256",
                PROFILE_SECURITY_SECRET
            )
            .update(encodedPayload)
            .digest("base64url");

    return `${encodedPayload}.${signature}`;
}


// ==========================================
// VERIFY PROFILE VERIFICATION TOKEN
// ==========================================

function verifyVerificationToken(token, donorId) {

    try {

        if (!token) {
            return false;
        }

        const parts = token.split(".");

        if (parts.length !== 2) {
            return false;
        }

        const encodedPayload = parts[0];
        const receivedSignature = parts[1];

        const expectedSignature =
            crypto
                .createHmac(
                    "sha256",
                    PROFILE_SECURITY_SECRET
                )
                .update(encodedPayload)
                .digest("base64url");

        const receivedBuffer =
            Buffer.from(receivedSignature);

        const expectedBuffer =
            Buffer.from(expectedSignature);

        if (
            receivedBuffer.length !==
            expectedBuffer.length
        ) {
            return false;
        }

        if (
            !crypto.timingSafeEqual(
                receivedBuffer,
                expectedBuffer
            )
        ) {
            return false;
        }

        const payload =
            JSON.parse(
                Buffer.from(
                    encodedPayload,
                    "base64url"
                ).toString("utf8")
            );

        if (
            payload.id !== String(donorId)
        ) {
            return false;
        }

        if (
            Date.now() > payload.exp
        ) {
            return false;
        }

        return true;

    } catch (error) {

        return false;
    }
}


// ==========================================
// PIN ATTEMPT LIMIT
// ==========================================

const pinAttempts = new Map();

function isPinRateLimited(key) {

    const now = Date.now();

    const record = pinAttempts.get(key);

    if (!record) {
        return false;
    }

    if (now > record.resetAt) {

        pinAttempts.delete(key);

        return false;
    }

    return record.failedAttempts >= 5;
}


function recordFailedPinAttempt(key) {

    const now = Date.now();

    let record = pinAttempts.get(key);

    if (!record || now > record.resetAt) {

        record = {

            failedAttempts: 0,

            resetAt:
                now + 10 * 60 * 1000

        };
    }

    record.failedAttempts++;

    pinAttempts.set(key, record);
}


function clearPinAttempts(key) {

    pinAttempts.delete(key);
}



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
            availability,
            pin
        } = req.body;
const existingDonor = await Donor.findOne({ mobile });

if (existingDonor) {
    return res.status(400).json({
        message: "This mobile number is already registered with LifeLink."
    });
}

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
                message:
                    "Please fill all required fields."
            });
        }


        if (Number(age) < 18) {

            return res.status(400).json({
                message:
                    "Age must be 18 or above."
            });
        }


        if (
            !["Male", "Female", "Other"]
                .includes(gender)
        ) {

            return res.status(400).json({
                message: "Invalid gender."
            });
        }


        if (Number(weight) <= 0) {

            return res.status(400).json({
                message:
                    "Please enter a valid weight."
            });
        }


        if (contactConsent !== true) {

            return res.status(400).json({
                message:
                    "Please agree to share your contact number for blood donation requests."
            });
        }


        if (!/^[0-9]{10}$/.test(mobile)) {

            return res.status(400).json({
                message:
                    "Please enter a valid 10-digit mobile number."
            });
        }


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
                message:
                    "Invalid blood group."
            });
        }


        if (
            !["Available", "Not Available"]
                .includes(availability)
        ) {

            return res.status(400).json({
                message:
                    "Invalid availability."
            });
        }


        // PIN is optional for now
        // Existing registration will continue working
        let pinHash = null;

        if (
            pin !== undefined &&
            pin !== null &&
            pin !== ""
        ) {

            if (
                !/^[0-9]{6}$/.test(
                    String(pin)
                )
            ) {

                return res.status(400).json({
                    message:
                        "PIN must be exactly 6 digits."
                });
            }

            pinHash =
                hashPin(String(pin));
        }


        const donor = new Donor({

            name,

            age,

            gender,

            weight,

            bloodGroup,

            mobile,

            pinHash,

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


        const savedDonor =
            await donor.save();


        res.status(201).json({

            message:
                "Donor registered successfully!",

            donorId:
                savedDonor._id

        });


    } catch (error) {
    console.error("Registration Error:", error);

    if (error.code === 11000) {
        return res.status(400).json({
            message: "This mobile number is already registered with LifeLink."
        });
    }

    res.status(500).json({
        message: "Failed to register donor."
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
                message:
                    "Blood group is required."
            });
        }


        const baseQuery = {

            bloodGroup,

            availability:
                "Available"

        };


        // CITY MATCH
        if (city) {

            const cityDonors =
                await Donor.find({

                    ...baseQuery,

                    city: {
                        $regex:
                            `^${city}$`,
                        $options: "i"
                    }

                }).sort({
                    createdAt: -1
                });


            if (cityDonors.length > 0) {

                return res.json(
                    cityDonors.map(
                        donor => ({

                            ...donor.toObject(),

                            matchLevel:
                                "City Match",

                            mobile:
                                donor.contactConsent
                                    ? donor.mobile
                                    : null

                        })
                    )
                );
            }
        }


        // DISTRICT MATCH
        if (district) {

            const districtDonors =
                await Donor.find({

                    ...baseQuery,

                    district: {
                        $regex:
                            `^${district}$`,
                        $options: "i"
                    }

                }).sort({
                    createdAt: -1
                });


            if (districtDonors.length > 0) {

                return res.json(
                    districtDonors.map(
                        donor => ({

                            ...donor.toObject(),

                            matchLevel:
                                "District Match",

                            mobile:
                                donor.contactConsent
                                    ? donor.mobile
                                    : null

                        })
                    )
                );
            }
        }


        // STATE MATCH
        if (state) {

            const stateDonors =
                await Donor.find({

                    ...baseQuery,

                    state: {
                        $regex:
                            `^${state}$`,
                        $options: "i"
                    }

                }).sort({
                    createdAt: -1
                });


            if (stateDonors.length > 0) {

                return res.json(
                    stateDonors.map(
                        donor => ({

                            ...donor.toObject(),

                            matchLevel:
                                "State Match",

                            mobile:
                                donor.contactConsent
                                    ? donor.mobile
                                    : null

                        })
                    )
                );
            }
        }


        return res.json([]);


    } catch (error) {

        console.error(error);

        res.status(500).json({
            message:
                "Unable to search donors."
        });
    }
});



// ==========================================
// GET DONOR PROFILE BY MOBILE
// ==========================================

router.get(
    "/profile/mobile/:mobile",
    async (req, res) => {

        try {

            const mobile =
                req.params.mobile;


            if (!/^[0-9]{10}$/.test(mobile)) {

                return res.status(400).json({
                    message:
                        "Please enter a valid 10-digit mobile number."
                });
            }


            const donor =
                await Donor.findOne({
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

                bloodGroup:
                    donor.bloodGroup,

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
                    donor.availability,

                hasPin:
                    Boolean(donor.pinHash)

            });


        } catch (error) {

            console.error(error);

            res.status(500).json({
                message:
                    "Unable to load donor profile."
            });
        }
    }
);



// ==========================================
// GET DONOR PROFILE BY ID
// ==========================================

router.get(
    "/profile/:id",
    async (req, res) => {

        try {

            const donor =
                await Donor.findById(
                    req.params.id
                );


            if (!donor) {

                return res.status(404).json({
                    message:
                        "Donor profile not found."
                });
            }


            res.json({

                id: donor._id,

                name: donor.name,

                age: donor.age,

                gender: donor.gender,

                weight: donor.weight,

                bloodGroup:
                    donor.bloodGroup,

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
                    donor.availability,

                hasPin:
                    Boolean(donor.pinHash)

            });


        } catch (error) {

            console.error(error);

            res.status(500).json({
                message:
                    "Unable to load donor profile."
            });
        }
    }
);



// ==========================================
// SET / CREATE PROFILE PIN
// ==========================================

router.post(
    "/profile/:id/set-pin",
    async (req, res) => {

        try {

            const { pin } =
                req.body;


            if (
                !pin ||
                !/^[0-9]{6}$/.test(
                    String(pin)
                )
            ) {

                return res.status(400).json({
                    message:
                        "PIN must be exactly 6 digits."
                });
            }


            const donor =
                await Donor.findById(
                    req.params.id
                );


            if (!donor) {

                return res.status(404).json({
                    message:
                        "Donor profile not found."
                });
            }


            if (donor.pinHash) {

                return res.status(400).json({
                    message:
                        "Profile PIN already exists. Please verify the existing PIN."
                });
            }


            donor.pinHash =
                hashPin(String(pin));


            await donor.save();


            res.json({

                success: true,

                message:
                    "Profile PIN created successfully."

            });


        } catch (error) {

            console.error(error);

            res.status(500).json({
                message:
                    "Unable to create profile PIN."
            });
        }
    }
);



// ==========================================
// VERIFY PROFILE PIN
// ==========================================

router.post(
    "/profile/:id/verify-pin",
    async (req, res) => {

        try {

            const { pin } =
                req.body;


            if (
                !pin ||
                !/^[0-9]{6}$/.test(
                    String(pin)
                )
            ) {

                return res.status(400).json({
                    message:
                        "Please enter a valid 6-digit PIN."
                });
            }


            const donor =
                await Donor.findById(
                    req.params.id
                );


            if (!donor) {

                return res.status(404).json({
                    message:
                        "Donor profile not found."
                });
            }


            if (!donor.pinHash) {

                return res.status(400).json({
                    message:
                        "Profile PIN has not been created yet."
                });
            }


            const attemptKey =
                `${req.ip}:${donor._id}`;


            if (
                isPinRateLimited(
                    attemptKey
                )
            ) {

                return res.status(429).json({
                    message:
                        "Too many incorrect PIN attempts. Please try again after 10 minutes."
                });
            }


            const isValid =
                verifyPin(
                    String(pin),
                    donor.pinHash
                );


            if (!isValid) {

                recordFailedPinAttempt(
                    attemptKey
                );

                return res.status(401).json({

                    success: false,

                    message:
                        "Incorrect PIN."

                });
            }


            clearPinAttempts(
                attemptKey
            );


            const verificationToken =
                createVerificationToken(
                    donor._id
                );


            res.json({

                success: true,

                message:
                    "Profile verification successful.",

                verificationToken

            });


        } catch (error) {

            console.error(error);

            res.status(500).json({
                message:
                    "Unable to verify profile PIN."
            });
        }
    }
);



// ==========================================
// EDIT DONOR PROFILE
// ==========================================

router.put(
    "/profile/:id",
    async (req, res) => {

        try {

            // ======================================
            // VERIFY SECURITY TOKEN
            // ======================================

            const authHeader =
                req.headers.authorization;

            if (
                !authHeader ||
                !authHeader.startsWith(
                    "Bearer "
                )
            ) {

                return res.status(401).json({
                    message:
                        "Profile verification required before editing."
                });
            }


            const verificationToken =
                authHeader.substring(7);


            const tokenValid =
                verifyVerificationToken(
                    verificationToken,
                    req.params.id
                );


            if (!tokenValid) {

                return res.status(401).json({
                    message:
                        "Verification expired. Please verify your PIN again."
                });
            }


            // ======================================
            // GET DONOR
            // ======================================

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
                    message:
                        "Donor profile not found."
                });
            }


            // ======================================
            // VALIDATION
            // ======================================

            if (
                age !== undefined &&
                Number(age) < 18
            ) {

                return res.status(400).json({
                    message:
                        "Age must be 18 or above."
                });
            }


            if (
                gender !== undefined &&
                ![
                    "Male",
                    "Female",
                    "Other"
                ].includes(gender)
            ) {

                return res.status(400).json({
                    message:
                        "Invalid gender."
                });
            }


            if (
                weight !== undefined &&
                Number(weight) <= 0
            ) {

                return res.status(400).json({
                    message:
                        "Please enter a valid weight."
                });
            }


            if (
                availability !== undefined &&
                ![
                    "Available",
                    "Not Available"
                ].includes(availability)
            ) {

                return res.status(400).json({
                    message:
                        "Invalid availability."
                });
            }


            // ======================================
            // UPDATE FIELDS
            // ======================================

            if (name !== undefined)
                donor.name =
                    name.trim();

            if (age !== undefined)
                donor.age =
                    Number(age);

            if (gender !== undefined)
                donor.gender =
                    gender;

            if (weight !== undefined)
                donor.weight =
                    Number(weight);

            if (city !== undefined)
                donor.city =
                    city.trim();

            if (district !== undefined)
                donor.district =
                    district.trim();

            if (state !== undefined)
                donor.state =
                    state.trim();

            if (availability !== undefined)
                donor.availability =
                    availability;

            if (
                lastDonationDate !==
                undefined
            ) {

                donor.lastDonationDate =
                    lastDonationDate || null;
            }


            await donor.save();


            res.json({

                message:
                    "Donor profile updated successfully!"

            });


        } catch (error) {

            console.error(error);

            res.status(500).json({
                message:
                    "Unable to update donor profile."
            });
        }
    }
);



// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;