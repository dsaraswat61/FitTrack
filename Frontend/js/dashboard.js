
const userData = sessionStorage.getItem("user");

if (!userData) {
    window.location.href = "login.html";
} else {
    const user = JSON.parse(userData);

    document.getElementById("welcomeName").textContent =
        "Welcome, " + user.name + "!";

    loadDashboardData(user.id);
}

// Logout functionality
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", function () {
    sessionStorage.removeItem("user");
    window.location.href = "login.html";
});

// Fetch workout data from backend
async function loadDashboardData(userId) {
    try {
        const response = await fetch(
            `http://127.0.0.1:5000/api/workouts/${userId}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error("Unable to fetch workout data");
        }

        const workouts = data.workouts;

        // Total workouts
        document.getElementById("dashboardWorkouts").textContent =
            workouts.length + " Completed";

        // Total workout duration
        const totalDuration = workouts.reduce(function (total, workout) {
            return total + Number(workout.duration);
        }, 0);

        document.getElementById("dashboardDuration").textContent =
            totalDuration + " Minutes";

        // Calculate current workout streak
        const workoutDates = [...new Set(
            workouts.map(workout => workout.date)
        )].sort().reverse();

        let streak = 0;

        if (workoutDates.length > 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const latestDate = new Date(workoutDates[0] + "T00:00:00");
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            if (
                latestDate.getTime() === today.getTime() ||
                latestDate.getTime() === yesterday.getTime()
            ) {
                let expectedDate = new Date(latestDate);

                for (const workoutDate of workoutDates) {
                    const currentDate = new Date(
                        workoutDate + "T00:00:00"
                    );

                    if (currentDate.getTime() === expectedDate.getTime()) {
                        streak++;
                        expectedDate.setDate(expectedDate.getDate() - 1);
                    } else {
                        break;
                    }
                }
            }
        }

        document.getElementById("dashboardStreak").textContent =
            streak + " Days";

    } catch (error) {
        console.error("Dashboard Error:", error);
    }
}
