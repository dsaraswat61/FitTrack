const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://127.0.0.1:5000/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Save user details for this browser session
            sessionStorage.setItem("user", JSON.stringify(data.user));

            alert("Login successful!");

            window.location.href = "dashboard.html";
        } else {
            alert(data.message);
        }

    } catch (error) {
        console.error("Login Error:", error);
        alert("Cannot connect to FitTrack server!");
    }
});