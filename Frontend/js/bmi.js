
const bmiForm = document.getElementById("bmiForm");
const bmiResult = document.getElementById("bmiResult");
const bmrResult = document.getElementById("bmrResult");
const activityLevel = document.getElementById("activityLevel");
const tdeeResult = document.getElementById("tdeeResult");

let userBMR = null;


// CHECK LOGIN
const userData = sessionStorage.getItem("user");

if (!userData) {
    window.location.href = "login.html";
} else {
    const user = JSON.parse(userData);
    loadBMR(user.id);
}


// BMI CALCULATION
bmiForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const height = parseFloat(
        document.getElementById("height").value
    );

    const weight = parseFloat(
        document.getElementById("weight").value
    );

    if (
        !Number.isFinite(height) ||
        !Number.isFinite(weight) ||
        height <= 0 ||
        weight <= 0
    ) {
        bmiResult.innerHTML = `
            <h3>Invalid Details</h3>
            <p>Please enter valid height and weight.</p>
        `;
        return;
    }

    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);

    bmiResult.innerHTML = `
        <h3>Your BMI: ${bmi.toFixed(2)}</h3>
        <p>This is your BMI value, not a medical diagnosis.</p>
    `;
});


// FETCH BMR FROM DATABASE
async function loadBMR(userId) {

    try {

        const response = await fetch(
            `http://127.0.0.1:5000/api/bmr/${userId}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to calculate BMR");
        }

        userBMR = Number(data.bmr);

        bmrResult.innerHTML = `
            <h3>Your BMR: ${userBMR} kcal/day</h3>
            <p>Your estimated calorie requirement at rest.</p>
        `;

        // If activity was selected before BMR loaded
        calculateTDEE();

    } catch (error) {

        console.error("BMR Error:", error);

        bmrResult.innerHTML = `
            <h3>BMR Unavailable</h3>
            <p>${error.message}</p>
        `;
    }
}


// TDEE CALCULATION
activityLevel.addEventListener("change", calculateTDEE);

function calculateTDEE() {

    const activityFactor = Number(activityLevel.value);

    if (!activityLevel.value) {
        tdeeResult.innerHTML = `
            <h3>Your TDEE Will Appear Here</h3>
            <p>Select your activity level to continue.</p>
        `;
        return;
    }

    if (userBMR === null) {
        tdeeResult.innerHTML = `
            <h3>Please Wait</h3>
            <p>Fetching your BMR...</p>
        `;
        return;
    }

    const tdee = userBMR * activityFactor;

    tdeeResult.innerHTML = `
        <h3>Your TDEE: ${Math.round(tdee)} kcal/day</h3>
        <p>Estimated calories you burn daily at your selected activity level.</p>
    `;
}
