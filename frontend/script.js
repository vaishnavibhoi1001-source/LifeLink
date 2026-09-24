// ===============================
// LifeLink - Frontend JavaScript
// ===============================


// ===============================
// Donor Registration
// ===============================

const donorForm = document.getElementById("donorForm");

if (donorForm) {

    donorForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const donorData = {
            name: document.getElementById("name").value,
            age: document.getElementById("age").value,
            bloodGroup: document.getElementById("bloodGroup").value,
            mobile: document.getElementById("mobile").value,
            city: document.getElementById("city").value,
            district: document.getElementById("district").value,
            state: document.getElementById("state").value,
            availability: document.getElementById("availability").value
        };

        try {

            const response = await fetch("/api/donors/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(donorData)
            });

            const result = await response.json();

            if (response.ok) {

                alert("Donor registered successfully!");

                donorForm.reset();

            } else {

                alert(result.message || "Registration failed.");

            }

        } catch (error) {

            console.error("Registration error:", error);

            alert("Unable to connect to the LifeLink server.");

        }

    });

}


// ===============================
// Blood Search
// City → District → State
// ===============================

const searchForm = document.getElementById("searchForm");

if (searchForm) {

    searchForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const bloodGroup =
            document.getElementById("searchBloodGroup").value;

        const city =
            document.getElementById("searchCity").value;

        const district =
            document.getElementById("searchDistrict").value;

        const state =
            document.getElementById("searchState").value;

        const resultsDiv =
            document.getElementById("results");


        resultsDiv.innerHTML =
            "<p>Searching for potential donors...</p>";


        try {

            const url =
                `/api/donors/search?bloodGroup=${encodeURIComponent(bloodGroup)}&city=${encodeURIComponent(city)}&district=${encodeURIComponent(district)}&state=${encodeURIComponent(state)}`;


            const response = await fetch(url);

            const donors = await response.json();


            if (!response.ok) {

                resultsDiv.innerHTML =
                    `<p>${donors.message || "Search failed."}</p>`;

                return;
            }


            if (donors.length === 0) {

                resultsDiv.innerHTML =
                    "<p>No potential donors found in the selected location.</p>";

                return;
            }


            resultsDiv.innerHTML = "";


            donors.forEach(function (donor) {

                const donorCard =
                    document.createElement("div");

                donorCard.className =
                    "donor-card";


                donorCard.innerHTML = `

                    <h3>${donor.name}</h3>

                    <p>
                        <strong>Blood Group:</strong>
                        ${donor.bloodGroup}
                    </p>

                    <p>
                        <strong>Location:</strong>
                        ${donor.city},
                        ${donor.district},
                        ${donor.state}
                    </p>

                    <p>
                        <strong>Match:</strong>
                        ${donor.matchLevel}
                    </p>

                    <p>
                        <strong>Availability:</strong>
                        ${donor.availability}
                    </p>

                    <p>
                        <strong>Contact:</strong>
                        ${donor.mobile}
                    </p>

                `;


                resultsDiv.appendChild(donorCard);

            });


        } catch (error) {

            console.error("Search error:", error);

            resultsDiv.innerHTML =
                "<p>Unable to connect to the LifeLink server.</p>";

        }

    });

}