
// Get HTML elements
const workoutForm = document.getElementById("workoutLogForm");
const workoutHistory = document.getElementById("workoutHistory");

// Get logged-in user
const user = JSON.parse(sessionStorage.getItem("user"));

// Check login
if (!user) {
    window.location.href = "login.html";
}

// Backend API URL
const API_URL = "http://127.0.0.1:5000/api/workouts";


// Prevent HTML injection
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[character];
    });
}


// Fetch and display workouts
async function displayWorkouts() {

    try {
        const response = await fetch(`${API_URL}/${user.id}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to fetch workouts");
        }

        const workouts = data.workouts;

        if (workouts.length === 0) {
            workoutHistory.innerHTML =
                '<p class="empty-history">No workouts recorded yet.</p>';
            return;
        }

        workoutHistory.innerHTML = workouts.map(workout => `
            <div class="logged-workout">
                <h3>${escapeHTML(workout.name)}</h3>
                <p>Date: ${escapeHTML(workout.date || "")}</p>
                <p>Duration: ${escapeHTML(workout.duration)} minutes</p>
                <p>${escapeHTML(workout.notes || "No notes added.")}</p>

                <button class="delete-workout" data-id="${workout.id}">
                    Delete
                </button>
            </div>
        `).join("");

    } catch (error) {
        console.error("Fetch Error:", error);
        workoutHistory.innerHTML =
            '<p class="empty-history">Unable to load workouts.</p>';
    }
}


// Add workout
workoutForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const name = document.getElementById("workoutName").value.trim();
    const date = document.getElementById("workoutDate").value;
    const duration = Number(document.getElementById("duration").value);
    const notes = document.getElementById("workoutNotes").value.trim();

    if (!name || !date || !Number.isFinite(duration) || duration <= 0) {
        alert("Please enter valid workout details.");
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: user.id,
                name: name,
                date: date,
                duration: duration,
                notes: notes
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to add workout");
        }

        alert("Workout added successfully!");

        workoutForm.reset();

        await displayWorkouts();

    } catch (error) {
        console.error("Add Workout Error:", error);
        alert(error.message || "Cannot connect to FitTrack server!");
    }
});


// Delete workout
workoutHistory.addEventListener("click", async function (event) {

    if (event.target.classList.contains("delete-workout")) {

        const workoutId = event.target.dataset.id;

        if (!confirm("Are you sure you want to delete this workout?")) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/${workoutId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id: user.id
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to delete workout");
            }

            alert("Workout deleted successfully!");

            await displayWorkouts();

        } catch (error) {
            console.error("Delete Error:", error);
            alert(error.message || "Cannot connect to FitTrack server!");
        }
    }
});


// Load workouts when page opens
if (user) {
    displayWorkouts();
}
