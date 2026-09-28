// =====================================================
// LIFELINK - DONOR REGISTRATION
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


    // Calculate estimated next eligible date
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


    // Registration
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

                    return;
                }


                message.textContent =
                    "Donor registered successfully!";

                message.style.color =
                    "green";


                donorForm.reset();

                nextEligibleDate.value = "";


            } catch (error) {

                console.error(error);

                message.textContent =
                    "Unable to connect to LifeLink server.";
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
// MY PROFILE
// =====================================================

const profileSearchForm =
    document.getElementById("profileSearchForm");

if (profileSearchForm) {

    let currentDonorId = null;

    const profileMessage =
        document.getElementById("profileMessage");

    const profileDetails =
        document.getElementById("profileDetails");

    const editProfileSection =
        document.getElementById("editProfileSection");


    // =================================================
    // VIEW PROFILE
    // =================================================

    profileSearchForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const mobile =
                document.getElementById(
                    "profileMobile"
                ).value.trim();


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


                document.getElementById(
                    "profileName"
                ).textContent =
                    donor.name;


                document.getElementById(
                    "profileAge"
                ).textContent =
                    donor.age;


                document.getElementById(
                    "profileGender"
                ).textContent =
                    donor.gender;


                document.getElementById(
                    "profileWeight"
                ).textContent =
                    donor.weight;


                document.getElementById(
                    "profileBloodGroup"
                ).textContent =
                    donor.bloodGroup;


                document.getElementById(
                    "profileMobileDisplay"
                ).textContent =
                    donor.mobile ||
                    "Not shared";


                document.getElementById(
                    "profileCity"
                ).textContent =
                    donor.city;


                document.getElementById(
                    "profileDistrict"
                ).textContent =
                    donor.district;


                document.getElementById(
                    "profileState"
                ).textContent =
                    donor.state;


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


                profileMessage.textContent =
                    "Profile loaded successfully.";

            } catch (error) {

                console.error(error);

                profileMessage.textContent =
                    "Unable to connect to LifeLink server.";
            }
        }
    );


    // =================================================
    // EDIT PROFILE
    // =================================================

    const editProfileBtn =
        document.getElementById(
            "editProfileBtn"
        );


    if (editProfileBtn) {

        editProfileBtn.addEventListener(
            "click",
            function () {

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


                editProfileSection.style.display =
                    "block";

                profileDetails.style.display =
                    "none";
            }
        );
    }


    // =================================================
    // CANCEL EDIT
    // =================================================

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

                profileDetails.style.display =
                    "block";
            }
        );
    }


    // =================================================
    // SAVE PROFILE CHANGES
    // =================================================

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


                const updatedData = {

                    name:
                        document.getElementById(
                            "editName"
                        ).value.trim(),

                    age:
                        Number(
                            document.getElementById(
                                "editAge"
                            ).value
                        ),

                    gender:
                        document.getElementById(
                            "editGender"
                        ).value,

                    weight:
                        Number(
                            document.getElementById(
                                "editWeight"
                            ).value
                        ),

                    city:
                        document.getElementById(
                            "editCity"
                        ).value.trim(),

                    district:
                        document.getElementById(
                            "editDistrict"
                        ).value.trim(),

                    state:
                        document.getElementById(
                            "editState"
                        ).value.trim(),

                    availability:
                        document.getElementById(
                            "editAvailability"
                        ).value,

                    lastDonationDate:
                        document.getElementById(
                            "editLastDonationDate"
                        ).value || null
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
                                        "application/json"
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