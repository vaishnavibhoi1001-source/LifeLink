// =====================================================
// LIFELINK - DONOR REGISTRATION
// PART 1 OF 4
// =====================================================

const donorForm = document.getElementById("donorForm");

if (donorForm) {

    const message = document.getElementById("message");

    const lastDonationDate =
        document.getElementById("lastDonationDate");

    const nextEligibleDate =
        document.getElementById("nextEligibleDate");

    const firstTimeDonor =
        document.getElementById("firstTimeDonor");


    function calculateNextEligibleDate() {

        if (
            !lastDonationDate.value ||
            firstTimeDonor.value !== "true"
        ) {
            nextEligibleDate.value = "";
            return;
        }

        const lastDate =
            new Date(lastDonationDate.value);

        if (isNaN(lastDate.getTime())) {
            nextEligibleDate.value = "";
            return;
        }

        const nextDate = new Date(lastDate);

        nextDate.setDate(
            nextDate.getDate() + 90
        );

        const year =
            nextDate.getFullYear();

        const month =
            String(nextDate.getMonth() + 1)
                .padStart(2, "0");

        const day =
            String(nextDate.getDate())
                .padStart(2, "0");

        nextEligibleDate.value =
            `${day}-${month}-${year}`;
    }


    firstTimeDonor.addEventListener(
        "change",
        calculateNextEligibleDate
    );


    lastDonationDate.addEventListener(
        "change",
        calculateNextEligibleDate
    );


    donorForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            message.textContent =
                "Registering donor...";


            const data = {

                name:
                    document.getElementById("name")
                        .value.trim(),

                age:
                    Number(
                        document.getElementById("age")
                            .value
                    ),

                gender:
                    document.getElementById("gender")
                        .value,

                weight:
                    Number(
                        document.getElementById("weight")
                            .value
                    ),

                bloodGroup:
                    document.getElementById("bloodGroup")
                        .value,

                mobile:
                    document.getElementById("mobile")
                        .value.trim(),

                contactConsent:
                    document.getElementById("contactConsent")
                        .checked,

                city:
                    document.getElementById("city")
                        .value.trim(),

                district:
                    document.getElementById("district")
                        .value.trim(),

                state:
                    document.getElementById("state")
                        .value.trim(),

                firstTimeDonor:
                    document.getElementById("firstTimeDonor")
                        .value === "true",

                lastDonationDate:
                    document.getElementById("lastDonationDate")
                        .value || null,

                availability:
                    document.getElementById("availability")
                        .value
            };
// =====================================================
// PART 2 OF 4
// REGISTRATION CONTINUED + FIND BLOOD
// =====================================================


            // Registration PIN
            const registrationPin =
                document.getElementById("registrationPin");

            if (registrationPin) {

                const pin =
                    registrationPin.value.trim();

                if (!/^[0-9]{6}$/.test(pin)) {

                    message.textContent =
                        "Please enter a valid 6-digit PIN.";

                    return;
                }

                data.pin = pin;
            }


            // Validation

            if (!/^[0-9]{10}$/.test(data.mobile)) {

                message.textContent =
                    "Please enter a valid 10-digit mobile number.";

                return;
            }


            if (!data.contactConsent) {

                message.textContent =
                    "Please agree to share your contact number.";

                return;
            }


            if (data.age < 18) {

                message.textContent =
                    "Age must be 18 or above.";

                return;
            }


            if (data.weight <= 0) {

                message.textContent =
                    "Please enter a valid weight.";

                return;
            }


            // Send registration data

            try {

                const response =
                    await fetch(
                        "/api/donors/register",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(data)
                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    message.textContent =
                        result.message ||
                        "Donor registration failed.";

                    message.style.color =
                        "red";

                    return;
                }


                // Success message

                message.innerHTML = `
                    <strong>Thank You! ❤️</strong><br>
                    You are registered successfully.<br>
                    Your small help can make a very big change in someone's life.<br>
                    It takes courage to become a blood donor. Thank you for taking the step.
                `;

                message.style.color =
                    "green";


                donorForm.reset();

                nextEligibleDate.value = "";


            } catch (error) {

                console.error(error);

                message.textContent =
                    "Unable to connect to LifeLink server.";

                message.style.color =
                    "red";
            }
        }
    );
}


// =====================================================
// FIND BLOOD
// =====================================================

const searchForm =
    document.getElementById("searchForm");

if (searchForm) {

    const results =
        document.getElementById("results");


    searchForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const bloodGroup =
                document.getElementById(
                    "searchBloodGroup"
                ).value;

            const city =
                document.getElementById(
                    "searchCity"
                ).value.trim();

            const district =
                document.getElementById(
                    "searchDistrict"
                ).value.trim();

            const state =
                document.getElementById(
                    "searchState"
                ).value.trim();


            results.innerHTML =
                "<p>Searching for donors...</p>";


            try {

                const params =
                    new URLSearchParams({

                        bloodGroup: bloodGroup,
                        city: city,
                        district: district,
                        state: state

                    });


                const response =
                    await fetch(
                        `/api/donors/search?${params.toString()}`
                    );


                const donors =
                    await response.json();


                if (!response.ok) {

                    results.innerHTML =
                        `<p>${donors.message ||
                        "Unable to search donors."}</p>`;

                    return;
                }


                if (donors.length === 0) {

                    results.innerHTML = `
                        <div class="no-results">

                            <h3>
                                No matching donor found
                            </h3>

                            <p>
                                No available donor was found
                                in the selected location.
                            </p>

                        </div>
                    `;

                    return;
                }


                results.innerHTML = "";


                donors.forEach(
                    function (donor) {

                        const donorCard =
                            document.createElement("div");

                        donorCard.className =
                            "donor-card";


                        const contactText =
                            donor.mobile
                                ? donor.mobile
                                : "Contact not shared";


                        donorCard.innerHTML = `

                            <div class="donor-card-content">

                                <h3>
                                    ${donor.name}
                                </h3>

                                <p>
                                    <strong>
                                        Blood Group:
                                    </strong>
                                    ${donor.bloodGroup}
                                </p>

                                <p>
                                    <strong>
                                        Location:
                                    </strong>
                                    ${donor.city},
                                    ${donor.district},
                                    ${donor.state}
                                </p>

                                <p>
                                    <strong>
                                        Match:
                                    </strong>
                                    ${donor.matchLevel}
                                </p>

                                <p>
                                    <strong>
                                        Availability:
                                    </strong>
                                    ${donor.availability}
                                </p>

                                <p>
                                    <strong>
                                        Contact:
                                    </strong>
                                    ${contactText}
                                </p>

                            </div>
                        `;


                        results.appendChild(
                            donorCard
                        );
                    }
                );


            } catch (error) {

                console.error(
                    "Search error:",
                    error
                );

                results.innerHTML = `
                    <p>
                        Unable to connect to LifeLink server.
                    </p>
                `;
            }
        }
    );
}
// =====================================================
// PART 3 + PART 4
// MY PROFILE + PIN SECURITY + EDIT PROFILE
// =====================================================

const profileSearchForm =
    document.getElementById("profileSearchForm");

if (profileSearchForm) {

    let currentDonorId = null;
    let profileHasPin = false;
    let profileVerified = false;
    let profileVerificationToken = null;

    const profileMessage =
        document.getElementById("profileMessage");

    const profileDetails =
        document.getElementById("profileDetails");

    const editProfileSection =
        document.getElementById("editProfileSection");

    const editProfileBtn =
        document.getElementById("editProfileBtn");

    const createPinSection =
        document.getElementById("createPinSection");

    const pinExistsSection =
        document.getElementById("pinExistsSection");

    const createPinForm =
        document.getElementById("createPinForm");

    const pinVerificationSection =
        document.getElementById("pinVerificationSection");

    const verifyPinForm =
        document.getElementById("verifyPinForm");

    const cancelPinVerificationBtn =
        document.getElementById("cancelPinVerificationBtn");

    const pinMessage =
        document.getElementById("pinMessage");


    // ==========================================
    // VIEW PROFILE
    // ==========================================

    profileSearchForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const mobile =
                document
                    .getElementById("profileMobile")
                    .value
                    .trim();

            if (!/^[0-9]{10}$/.test(mobile)) {

                profileMessage.textContent =
                    "Please enter a valid 10-digit mobile number.";

                return;
            }

            try {

                profileMessage.textContent =
                    "Loading profile...";

                const response =
                    await fetch(
                        `/api/donors/profile/mobile/${mobile}`
                    );

                const donor =
                    await response.json();

                if (!response.ok) {

                    profileMessage.textContent =
                        donor.message ||
                        "Profile not found.";

                    profileDetails.style.display =
                        "none";

                    return;
                }

                currentDonorId =
                    donor.id;

                profileHasPin =
                    Boolean(donor.hasPin);

                profileVerified =
                    false;

                profileVerificationToken =
                    null;


                document.getElementById(
                    "profileName"
                ).textContent = donor.name;

                document.getElementById(
                    "profileAge"
                ).textContent = donor.age;

                document.getElementById(
                    "profileGender"
                ).textContent = donor.gender;

                document.getElementById(
                    "profileWeight"
                ).textContent = donor.weight;

                document.getElementById(
                    "profileBloodGroup"
                ).textContent = donor.bloodGroup;

                document.getElementById(
                    "profileMobileDisplay"
                ).textContent =
                    donor.mobile || "Not shared";

                document.getElementById(
                    "profileCity"
                ).textContent = donor.city;

                document.getElementById(
                    "profileDistrict"
                ).textContent = donor.district;

                document.getElementById(
                    "profileState"
                ).textContent = donor.state;

                document.getElementById(
                    "profileAvailability"
                ).textContent =
                    donor.availability;

                document.getElementById(
                    "profileLastDonation"
                ).textContent =
                    donor.lastDonationDate
                        ? new Date(
                            donor.lastDonationDate
                        ).toLocaleDateString()
                        : "No previous donation";


                profileDetails.style.display =
                    "block";

                editProfileSection.style.display =
                    "none";

                pinVerificationSection.style.display =
                    "none";


                if (profileHasPin) {

                    createPinSection.style.display =
                        "none";

                    pinExistsSection.style.display =
                        "block";

                    editProfileBtn.style.display =
                        "block";

                } else {

                    createPinSection.style.display =
                        "block";

                    pinExistsSection.style.display =
                        "none";

                    editProfileBtn.style.display =
                        "none";
                }


                profileMessage.textContent =
                    "Profile loaded successfully.";


            } catch (error) {

                console.error(error);

                profileMessage.textContent =
                    "Unable to connect to LifeLink server.";
            }
        }
    );


    // ==========================================
    // CREATE PIN
    // ==========================================

    if (createPinForm) {

        createPinForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                if (!currentDonorId) {

                    pinMessage.textContent =
                        "Please load your profile first.";

                    return;
                }


                const pin =
                    document
                        .getElementById("createPin")
                        .value
                        .trim();

                const confirmPin =
                    document
                        .getElementById("confirmPin")
                        .value
                        .trim();


                if (!/^[0-9]{6}$/.test(pin)) {

                    pinMessage.textContent =
                        "PIN must be exactly 6 digits.";

                    return;
                }


                if (pin !== confirmPin) {

                    pinMessage.textContent =
                        "PIN and Confirm PIN do not match.";

                    return;
                }


                try {

                    pinMessage.textContent =
                        "Creating PIN...";


                    const response =
                        await fetch(
                            `/api/donors/profile/${currentDonorId}/set-pin`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({
                                        pin: pin
                                    })
                            }
                        );


                    const result =
                        await response.json();


                    if (!response.ok) {

                        pinMessage.textContent =
                            result.message ||
                            "Unable to create PIN.";

                        return;
                    }


                    profileHasPin =
                        true;

                    createPinForm.reset();

                    createPinSection.style.display =
                        "none";

                    pinExistsSection.style.display =
                        "block";

                    editProfileBtn.style.display =
                        "block";

                    pinMessage.textContent =
                        "Profile PIN created successfully.";


                } catch (error) {

                    console.error(error);

                    pinMessage.textContent =
                        "Unable to connect to LifeLink server.";
                }
            }
        );
    }


    // ==========================================
    // EDIT PROFILE BUTTON
    // ==========================================

    if (editProfileBtn) {

        editProfileBtn.addEventListener(
            "click",
            function () {

                if (!profileHasPin) {

                    pinMessage.textContent =
                        "Please create your profile PIN first.";

                    return;
                }


                pinVerificationSection.style.display =
                    "block";

                profileDetails.style.display =
                    "none";

                editProfileSection.style.display =
                    "none";

                pinMessage.textContent = "";

                document.getElementById(
                    "verifyPin"
                ).value = "";
            }
        );
    }


    // ==========================================
    // VERIFY PIN
    // ==========================================

    if (verifyPinForm) {

        verifyPinForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                if (!currentDonorId) {

                    pinMessage.textContent =
                        "Please load your profile first.";

                    return;
                }


                const pin =
                    document
                        .getElementById("verifyPin")
                        .value
                        .trim();


                if (!/^[0-9]{6}$/.test(pin)) {

                    pinMessage.textContent =
                        "Please enter a valid 6-digit PIN.";

                    return;
                }


                try {

                    pinMessage.textContent =
                        "Verifying PIN...";


                    const response =
                        await fetch(
                            `/api/donors/profile/${currentDonorId}/verify-pin`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({
                                        pin: pin
                                    })
                            }
                        );


                    const result =
                        await response.json();


                    if (!response.ok) {

                        pinMessage.textContent =
                            result.message ||
                            "PIN verification failed.";

                        return;
                    }


                    // IMPORTANT:
                    // Store secure verification token
                    profileVerificationToken =
                        result.verificationToken;

                    profileVerified =
                        true;


                    pinVerificationSection.style.display =
                        "none";

                    editProfileSection.style.display =
                        "block";

                    profileDetails.style.display =
                        "none";


                    document.getElementById(
                        "editName"
                    ).value =
                        document.getElementById(
                            "profileName"
                        ).textContent;


                    document.getElementById(
                        "editAge"
                    ).value =
                        document.getElementById(
                            "profileAge"
                        ).textContent;


                    document.getElementById(
                        "editGender"
                    ).value =
                        document.getElementById(
                            "profileGender"
                        ).textContent;


                    document.getElementById(
                        "editWeight"
                    ).value =
                        document.getElementById(
                            "profileWeight"
                        ).textContent;


                    document.getElementById(
                        "editCity"
                    ).value =
                        document.getElementById(
                            "profileCity"
                        ).textContent;


                    document.getElementById(
                        "editDistrict"
                    ).value =
                        document.getElementById(
                            "profileDistrict"
                        ).textContent;


                    document.getElementById(
                        "editState"
                    ).value =
                        document.getElementById(
                            "profileState"
                        ).textContent;


                    document.getElementById(
                        "editAvailability"
                    ).value =
                        document.getElementById(
                            "profileAvailability"
                        ).textContent;


                    pinMessage.textContent =
                        "PIN verified successfully.";


                } catch (error) {

                    console.error(error);

                    pinMessage.textContent =
                        "Unable to connect to LifeLink server.";
                }
            }
        );
    }


    // ==========================================
    // CANCEL PIN VERIFICATION
    // ==========================================

    if (cancelPinVerificationBtn) {

        cancelPinVerificationBtn.addEventListener(
            "click",
            function () {

                pinVerificationSection.style.display =
                    "none";

                profileDetails.style.display =
                    "block";

                editProfileSection.style.display =
                    "none";

                document.getElementById(
                    "verifyPin"
                ).value = "";

                profileVerified =
                    false;

                profileVerificationToken =
                    null;

                pinMessage.textContent = "";
            }
        );
    }


    // ==========================================
    // CANCEL EDIT
    // ==========================================

    const cancelEditBtn =
        document.getElementById(
            "cancelEditBtn"
        );


    if (cancelEditBtn) {

        cancelEditBtn.addEventListener(
            "click",
            function () {

                editProfileSection.style.display =
                    "none";

                pinVerificationSection.style.display =
                    "none";

                profileDetails.style.display =
                    "block";

                profileVerified =
                    false;

                profileVerificationToken =
                    null;
            }
        );
    }


    // ==========================================
    // SAVE PROFILE CHANGES
    // ==========================================

    const editProfileForm =
        document.getElementById(
            "editProfileForm"
        );


    if (editProfileForm) {

        editProfileForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                if (!currentDonorId) {

                    profileMessage.textContent =
                        "Please load your profile first.";

                    return;
                }


                if (
                    !profileVerified ||
                    !profileVerificationToken
                ) {

                    profileMessage.textContent =
                        "Please verify your PIN before saving changes.";

                    return;
                }


                const updatedData = {

                    name:
                        document
                            .getElementById(
                                "editName"
                            )
                            .value
                            .trim(),

                    age:
                        Number(
                            document
                                .getElementById(
                                    "editAge"
                                )
                                .value
                        ),

                    gender:
                        document
                            .getElementById(
                                "editGender"
                            )
                            .value,

                    weight:
                        Number(
                            document
                                .getElementById(
                                    "editWeight"
                                )
                                .value
                        ),

                    city:
                        document
                            .getElementById(
                                "editCity"
                            )
                            .value
                            .trim(),

                    district:
                        document
                            .getElementById(
                                "editDistrict"
                            )
                            .value
                            .trim(),

                    state:
                        document
                            .getElementById(
                                "editState"
                            )
                            .value
                            .trim(),

                    availability:
                        document
                            .getElementById(
                                "editAvailability"
                            )
                            .value,

                    lastDonationDate:
                        document
                            .getElementById(
                                "editLastDonationDate"
                            )
                            .value || null
                };


                try {

                    profileMessage.textContent =
                        "Saving changes...";


                    const response =
                        await fetch(
                            `/api/donors/profile/${currentDonorId}`,
                            {
                                method: "PUT",

                                headers: {

                                    "Content-Type":
                                        "application/json",

                                    "Authorization":
                                        `Bearer ${profileVerificationToken}`
                                },

                                body:
                                    JSON.stringify(
                                        updatedData
                                    )
                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        profileMessage.textContent =
                            data.message ||
                            "Unable to update profile.";

                        return;
                    }


                    profileMessage.textContent =
                        data.message ||
                        "Profile updated successfully!";


                    profileVerified =
                        false;

                    profileVerificationToken =
                        null;


                    editProfileSection.style.display =
                        "none";

                    profileDetails.style.display =
                        "block";


                    profileSearchForm.dispatchEvent(
                        new Event("submit")
                    );


                } catch (error) {

                    console.error(error);

                    profileMessage.textContent =
                        "Unable to connect to LifeLink server.";
                }
            }
        );
    }

}
