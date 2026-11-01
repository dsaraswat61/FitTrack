
// =====================================
// GET LOGGED-IN USER
// =====================================

const user = JSON.parse(sessionStorage.getItem("user"));

if (!user) {
    window.location.href = "login.html";
}

// Backend API URLs
const WORKOUT_API = "http://127.0.0.1:5000/api/workouts";
const WEIGHT_API = "http://127.0.0.1:5000/api/weight";

// Workout elements
const totalWorkouts = document.getElementById("totalWorkouts");
const totalDuration = document.getElementById("totalDuration");
const latestWorkout = document.getElementById("latestWorkout");
const progressHistory = document.getElementById("progressHistory");

// Weight elements
const weightForm = document.getElementById("weightForm");
const weightInput = document.getElementById("weightInput");
const weightDate = document.getElementById("weightDate");
const latestWeight = document.getElementById("latestWeight");
const weightHistory = document.getElementById("weightHistory");

// Chart elements
const weightChartCanvas = document.getElementById("weightChart");
const workoutChartCanvas = document.getElementById("workoutChart");
const weightChartMessage = document.getElementById("weightChartMessage");
const workoutChartMessage = document.getElementById("workoutChartMessage");

// Chart instances
let weightChart = null;
let workoutChart = null;


// =====================================
// HELPER FUNCTIONS
// =====================================

// Today's date
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

weightDate.value = getTodayDate();
weightDate.max = getTodayDate();


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


// Format date for chart labels
function formatChartDate(dateString) {
    const parts = dateString.split("-");
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}


// =====================================
// WORKOUT PROGRESS
// =====================================

async function updateProgress() {

    try {
        const response = await fetch(`${WORKOUT_API}/${user.id}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to fetch progress");
        }

        const workouts = data.workouts;

        // Total workouts
        totalWorkouts.textContent = workouts.length;

        // Total workout duration
        const duration = workouts.reduce(function (total, workout) {
            return total + Number(workout.duration);
        }, 0);

        totalDuration.textContent = duration + " min";

        // Latest workout
        if (workouts.length > 0) {
            latestWorkout.textContent = workouts[0].date;
        } else {
            latestWorkout.textContent = "Not Available";
        }

        displayProgressHistory(workouts);

        // Update workout chart
        createWorkoutChart(workouts);

    } catch (error) {
        console.error("Progress Error:", error);

        progressHistory.innerHTML = `
            <p class="empty-progress">
                Unable to load workout activity.
            </p>
        `;

        workoutChartMessage.hidden = false;
        workoutChartMessage.textContent = "Unable to load workout chart.";
    }
}


// Display workout history
function displayProgressHistory(workouts) {

    if (workouts.length === 0) {
        progressHistory.innerHTML = `
            <p class="empty-progress">
                No workout activity available yet.
            </p>
        `;
        return;
    }

    progressHistory.innerHTML = workouts.map(function (workout) {

        return `
            <div class="progress-item">
                <h3>${escapeHTML(workout.name)}</h3>
                <p>Date: ${escapeHTML(workout.date || "")}</p>
                <p>Duration: ${Number(workout.duration)} minutes</p>
                <p>Notes: ${escapeHTML(workout.notes || "No notes added.")}</p>
            </div>
        `;

    }).join("");
}


// =====================================
// WEIGHT TRACKING
// =====================================

// Fetch weight history
async function updateWeightHistory() {

    try {
        const response = await fetch(`${WEIGHT_API}/${user.id}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to fetch weight history");
        }

        const records = data.records;

        // Latest weight
        if (records.length > 0) {
            latestWeight.textContent = records[0].weight + " kg";
        } else {
            latestWeight.textContent = "Not Available";
        }

        displayWeightHistory(records);

        // Update weight chart
        createWeightChart(records);

    } catch (error) {
        console.error("Weight History Error:", error);

        weightHistory.innerHTML = `
            <p class="empty-progress">
                Unable to load weight history.
            </p>
        `;

        weightChartMessage.hidden = false;
        weightChartMessage.textContent = "Unable to load weight chart.";
    }
}


// Display weight records
function displayWeightHistory(records) {

    if (records.length === 0) {
        weightHistory.innerHTML = `
            <p class="empty-progress">
                No weight records available yet.
            </p>
        `;
        return;
    }

    weightHistory.innerHTML = records.map(function (record) {

        return `
            <div class="progress-item">
                <h3>${Number(record.weight).toFixed(1)} kg</h3>
                <p>Date: ${escapeHTML(record.date || "")}</p>

                <button
                    type="button"
                    class="delete-weight"
                    data-id="${record.id}"
                >
                    Delete
                </button>
            </div>
        `;

    }).join("");
}


// Add new weight record
weightForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const weight = Number(weightInput.value);
    const date = weightDate.value;

    if (!Number.isFinite(weight) || weight <= 0 || !date) {
        alert("Please enter valid weight and date.");
        return;
    }

    if (date > getTodayDate()) {
        alert("Future dates are not allowed.");
        return;
    }

    try {
        const response = await fetch(WEIGHT_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: user.id,
                weight: weight,
                date: date
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to save weight");
        }

        alert("Weight recorded successfully!");

        weightForm.reset();
        weightDate.value = getTodayDate();

        await updateWeightHistory();

    } catch (error) {
        console.error("Save Weight Error:", error);
        alert(error.message || "Cannot connect to FitTrack server!");
    }
});


// Delete weight record
weightHistory.addEventListener("click", async function (event) {

    const deleteButton = event.target.closest(".delete-weight");

    if (!deleteButton) {
        return;
    }

    const recordId = deleteButton.dataset.id;

    if (!confirm("Are you sure you want to delete this weight record?")) {
        return;
    }

    try {
        const response = await fetch(`${WEIGHT_API}/${recordId}`, {
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
            throw new Error(data.message || "Unable to delete weight record");
        }

        alert("Weight record deleted successfully!");

        await updateWeightHistory();

    } catch (error) {
        console.error("Delete Weight Error:", error);
        alert(error.message || "Cannot connect to FitTrack server!");
    }
});


// =====================================
// WEIGHT PROGRESS CHART
// =====================================

function createWeightChart(records) {

    // Destroy previous chart before creating another
    if (weightChart) {
        weightChart.destroy();
        weightChart = null;
    }

    if (records.length === 0) {
        weightChartCanvas.hidden = true;
        weightChartMessage.hidden = false;
        return;
    }

    weightChartCanvas.hidden = false;
    weightChartMessage.hidden = true;

    // API returns newest first, so reverse for the chart
    const sortedRecords = [...records].sort(function (a, b) {
        return a.date.localeCompare(b.date) || a.id - b.id;
    });

    const labels = sortedRecords.map(function (record) {
        return formatChartDate(record.date);
    });

    const weights = sortedRecords.map(function (record) {
        return Number(record.weight);
    });

    weightChart = new Chart(weightChartCanvas, {
        type: "line",

        data: {
            labels: labels,

            datasets: [{
                label: "Weight (kg)",
                data: weights,
                borderColor: "#4f46e5",
                backgroundColor: "rgba(79, 70, 229, 0.15)",
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: true
                }
            },

            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: "Weight (kg)"
                    }
                },

                x: {
                    title: {
                        display: true,
                        text: "Date"
                    }
                }
            }
        }
    });
}


// =====================================
// WORKOUT ACTIVITY CHART
// =====================================

function createWorkoutChart(workouts) {

    // Destroy previous chart before creating another
    if (workoutChart) {
        workoutChart.destroy();
        workoutChart = null;
    }

    if (workouts.length === 0) {
        workoutChartCanvas.hidden = true;
        workoutChartMessage.hidden = false;
        return;
    }

    workoutChartCanvas.hidden = false;
    workoutChartMessage.hidden = true;

    // Add durations of workouts performed on the same date
    const dailyDuration = {};

    workouts.forEach(function (workout) {

        const date = workout.date;

        if (!date) {
            return;
        }

        if (!dailyDuration[date]) {
            dailyDuration[date] = 0;
        }

        dailyDuration[date] += Number(workout.duration);
    });

    // Sort dates from oldest to newest
    const sortedDates = Object.keys(dailyDuration).sort();

    const labels = sortedDates.map(function (date) {
        return formatChartDate(date);
    });

    const durations = sortedDates.map(function (date) {
        return dailyDuration[date];
    });

    if (sortedDates.length === 0) {
        workoutChartCanvas.hidden = true;
        workoutChartMessage.hidden = false;
        return;
    }

    workoutChart = new Chart(workoutChartCanvas, {
        type: "bar",

        data: {
            labels: labels,

            datasets: [{
                label: "Workout Duration (minutes)",
                data: durations,
                backgroundColor: "rgba(16, 185, 129, 0.7)",
                borderColor: "#10b981",
                borderWidth: 1,
                borderRadius: 6
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: true
                }
            },

            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Duration (minutes)"
                    }
                },

                x: {
                    title: {
                        display: true,
                        text: "Date"
                    }
                }
            }
        }
    });
}


// =====================================
// LOAD PAGE DATA
// =====================================

if (user) {
    updateProgress();
    updateWeightHistory();
}
