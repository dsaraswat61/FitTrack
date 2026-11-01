
const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    // Get form values
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    const age = parseInt(document.getElementById("age").value);
    const height = parseFloat(document.getElementById("height").value);
    const weight = parseFloat(document.getElementById("weight").value);
    const sex = document.getElementById("sex").value;

    // Password validation
    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    if (password.length < 8) {
        alert("Password must contain at least 8 characters!");
        return;
    }

    // Fitness details validation
    if (
        !Number.isFinite(age) || age <= 0 ||
        !Number.isFinite(height) || height <= 0 ||
        !Number.isFinite(weight) || weight <= 0 ||
        !sex
    ) {
        alert("Please enter valid fitness details!");
        return;
    }

    try {

        const response = await fetch("http://127.0.0.1:5000/api/register", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name: name,
                email: email,
                password: password,
                age: age,
                height: height,
                weight: weight,
                sex: sex
            })

        });

        const data = await response.json();

        alert(data.message);

        if (response.ok) {
            registerForm.reset();
            window.location.href = "login.html";
        }

    } catch (error) {

        console.error("Registration Error:", error);
        alert("Cannot connect to FitTrack server!");

    }

});
