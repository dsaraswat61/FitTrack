
const profileForm = document.getElementById("profileForm");
const profileMessage = document.getElementById("profileMessage");
const profileDisplayName = document.getElementById("profileDisplayName");

const API_URL = "http://127.0.0.1:5000/api/profile";

const storedUser = sessionStorage.getItem("user");

if (!storedUser) {
    window.location.href = "login.html";
}

const user = JSON.parse(storedUser);

async function loadProfile() {
    try {
        const response = await fetch(`${API_URL}/${user.id}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load profile.");
        }

        const profile = data.user;

        document.getElementById("name").value = profile.name || "";
        document.getElementById("email").value = profile.email || "";
        document.getElementById("age").value = profile.age ?? "";
        document.getElementById("height").value = profile.height ?? "";
        document.getElementById("weight").value = profile.weight ?? "";
        document.getElementById("sex").value = profile.sex || "";

        profileDisplayName.textContent = profile.name;

    } catch (error) {
        showMessage(error.message, "error");
    }
}

profileForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const updatedProfile = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        age: Number(document.getElementById("age").value),
        height: Number(document.getElementById("height").value),
        weight: Number(document.getElementById("weight").value),
        sex: document.getElementById("sex").value
    };

    if (
        !updatedProfile.name ||
        !updatedProfile.email ||
        !updatedProfile.sex ||
        updatedProfile.age <= 0 ||
        updatedProfile.height <= 0 ||
        updatedProfile.weight <= 0
    ) {
        showMessage("Please enter valid profile details.", "error");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${user.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedProfile)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to update profile.");
        }

        // Update the stored login information
        user.name = data.user.name;
        user.email = data.user.email;

        sessionStorage.setItem("user", JSON.stringify(user));

        profileDisplayName.textContent = data.user.name;

        showMessage("Profile updated successfully!", "success");

    } catch (error) {
        showMessage(error.message, "error");
    }
});

function showMessage(message, type) {
    profileMessage.textContent = message;
    profileMessage.className = `profile-message ${type}`;
}

loadProfile();
