
const dietPlans = {
    gain: {
        title: "Muscle Gain Diet Plan",
        meals: [
            {
                time: "🌅 BREAKFAST",
                name: "Protein-Rich Breakfast",
                food: "Milk, eggs or paneer, oats and a banana."
            },
            {
                time: "🍛 LUNCH",
                name: "Healthy Lunch",
                food: "Roti or rice, dal, paneer or chicken, vegetables and curd."
            },
            {
                time: "🍌 EVENING SNACK",
                name: "Energy Snack",
                food: "Banana, peanut butter, roasted chana or nuts."
            },
            {
                time: "🌙 DINNER",
                name: "Protein-Rich Dinner",
                food: "Roti or rice, dal, vegetables and paneer or eggs."
            }
        ]
    },

    loss: {
        title: "Weight Management Diet Plan",
        meals: [
            {
                time: "🌅 BREAKFAST",
                name: "Light Breakfast",
                food: "Vegetable oats, eggs or paneer and a seasonal fruit."
            },
            {
                time: "🍛 LUNCH",
                name: "Balanced Lunch",
                food: "Roti, dal, vegetables, salad and curd."
            },
            {
                time: "🍎 EVENING SNACK",
                name: "Healthy Snack",
                food: "Apple, roasted chana or a bowl of curd."
            },
            {
                time: "🌙 DINNER",
                name: "Balanced Dinner",
                food: "Roti, vegetables and a protein-rich food like dal or paneer."
            }
        ]
    },

    maintain: {
        title: "Weight Maintenance Diet Plan",
        meals: [
            {
                time: "🌅 BREAKFAST",
                name: "Balanced Breakfast",
                food: "Milk, oats, eggs or paneer and seasonal fruit."
            },
            {
                time: "🍛 LUNCH",
                name: "Nutritious Lunch",
                food: "Roti or rice, dal, vegetables, curd and salad."
            },
            {
                time: "🍌 EVENING SNACK",
                name: "Healthy Snack",
                food: "Fruit, nuts, roasted chana or milk."
            },
            {
                time: "🌙 DINNER",
                name: "Balanced Dinner",
                food: "Roti or rice, vegetables, dal and paneer or chicken."
            }
        ]
    }
};

const goalSelect = document.getElementById("fitnessGoal");
const planTitle = document.getElementById("planTitle");
const mealGrid = document.getElementById("mealGrid");

goalSelect.addEventListener("change", function () {
    const selectedGoal = goalSelect.value;
    const plan = dietPlans[selectedGoal];

    if (!plan) {
        planTitle.textContent = "Select Your Fitness Goal";
        mealGrid.innerHTML = "";
        return;
    }

    planTitle.textContent = plan.title;

    mealGrid.innerHTML = plan.meals.map(function (meal) {
        return `
            <div class="meal-card">
                <span class="meal-time">${meal.time}</span>
                <h3>${meal.name}</h3>
                <p>${meal.food}</p>
            </div>
        `;
    }).join("");
});
