
// Select elements
const form = document.querySelector("#expenseForm");

const monthInput = document.querySelector("#month");
const foodInput = document.querySelector("#food");
const travelInput = document.querySelector("#travel");
const shoppingInput = document.querySelector("#shopping");
const billsInput = document.querySelector("#bills");
const entertainmentInput = document.querySelector("#entertainment");

const totalExpenseEl = document.querySelector("#totalExpense");
const averageExpenseEl = document.querySelector("#averageExpense");
const forecastExpenseEl = document.querySelector("#forecastExpense");
const behaviourEl = document.querySelector("#behaviour");
const behaviourTextEl = document.querySelector("#behaviourText");

const forecastLargeEl = document.querySelector("#forecastLarge");
const forecastMessageEl = document.querySelector("#forecastMessage");
const trendBadge = document.querySelector("#trendBadge");

const categoryList = document.querySelector("#categoryList");
const topCategoryEl = document.querySelector("#topCategory");
const historyList = document.querySelector("#historyList");

const clearBtn = document.querySelector("#clearBtn");
const themeBtn = document.querySelector("#themeBtn");

// Chart variable
let expenseChart;

// Load saved data
let expenseData = JSON.parse(localStorage.getItem("expenseData")) || [];

// Category names
const categories = [
  "food",
  "travel",
  "shopping",
  "bills",
  "entertainment"
];

// Month order
const monthOrder = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

// Add expense data
form.addEventListener("submit", function (event) {
  event.preventDefault();

  const selectedMonth = monthInput.value;

  // Prevent duplicate month
  const alreadyExists = expenseData.some(function (item) {
    return item.month === selectedMonth;
  });

  if (alreadyExists) {
    alert("This month already exists. Please choose another month.");
    return;
  }

  const expense = {
    month: selectedMonth,
    food: Number(foodInput.value),
    travel: Number(travelInput.value),
    shopping: Number(shoppingInput.value),
    bills: Number(billsInput.value),
    entertainment: Number(entertainmentInput.value)
  };

  expenseData.push(expense);

  saveData();
  updateDashboard();

  form.reset();
});

// Save data
function saveData() {
  localStorage.setItem("expenseData", JSON.stringify(expenseData));
}

// Calculate total of one month
function getMonthlyTotal(item) {
  return (
    item.food +
    item.travel +
    item.shopping +
    item.bills +
    item.entertainment
  );
}

// Update dashboard
function updateDashboard() {
  calculateSummary();
  displayForecast();
  displayCategories();
  displayHistory();
  drawChart();
}

// Calculate summary
function calculateSummary() {
  let total = 0;

  expenseData.forEach(function (item) {
    total += getMonthlyTotal(item);
  });

  const average =
    expenseData.length > 0 ? total / expenseData.length : 0;

  totalExpenseEl.innerText = `₹${Math.round(total).toLocaleString("en-IN")}`;
  averageExpenseEl.innerText = `₹${Math.round(average).toLocaleString("en-IN")}`;
}

// Forecast calculation
function displayForecast() {
  if (expenseData.length === 0) {
    forecastExpenseEl.innerText = "₹0";
    forecastLargeEl.innerText = "₹0";
    behaviourEl.innerText = "-";
    behaviourTextEl.innerText = "Add data to analyse";
    trendBadge.innerText = "No Data";
    forecastMessageEl.innerText =
      "Add at least two months of data to generate a forecast.";
    return;
  }

  // Sort by calendar month
  const sortedData = [...expenseData].sort(function (a, b) {
    return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
  });

  const totals = sortedData.map(function (item) {
    return getMonthlyTotal(item);
  });

  // Average
  const average =
    totals.reduce((sum, value) => sum + value, 0) / totals.length;

  let forecast = average;
  let behaviour = "Stable";
  let message = "Your spending is relatively stable.";

  if (totals.length >= 2) {
    const first = totals[0];
    const last = totals[totals.length - 1];

    // Percentage change from first to last month
    const change = first === 0 ? 0 : ((last - first) / first) * 100;

    // Simple trend-based forecast
    const trendPerMonth = (last - first) / (totals.length - 1);

    forecast = average + trendPerMonth;

    if (change > 5) {
      behaviour = "Increasing";
      message = "Your spending has increased across the recorded period.";
    } else if (change < -5) {
      behaviour = "Decreasing";
      message = "Your spending has decreased across the recorded period.";
    } else {
      behaviour = "Stable";
      message = "Your spending is relatively stable across the recorded period.";
    }
  } else {
    message = "Add another month to calculate spending behaviour and trend.";
  }

  // Forecast should not be negative
  forecast = Math.max(0, Math.round(forecast));

  totalExpenseEl.innerText =
    `₹${Math.round(totals.reduce((a, b) => a + b, 0)).toLocaleString("en-IN")}`;

  forecastExpenseEl.innerText =
    `₹${forecast.toLocaleString("en-IN")}`;

  forecastLargeEl.innerText =
    `₹${forecast.toLocaleString("en-IN")}`;

  behaviourEl.innerText = behaviour;
  behaviourTextEl.innerText = message;

  trendBadge.innerText = behaviour;
  forecastMessageEl.innerText = message;
}

// Category analysis
function displayCategories() {
  const categoryTotals = {
    food: 0,
    travel: 0,
    shopping: 0,
    bills: 0,
    entertainment: 0
  };

  expenseData.forEach(function (item) {
    categories.forEach(function (category) {
      categoryTotals[category] += item[category];
    });
  });

  const totalCategoryExpense = Object.values(categoryTotals)
    .reduce((sum, value) => sum + value, 0);

  categoryList.innerHTML = "";

  if (totalCategoryExpense === 0) {
    categoryList.innerHTML =
      `<p class="empty">No category data available</p>`;
    topCategoryEl.innerText = "-";
    return;
  }

  let highestCategory = "";
  let highestAmount = 0;

  for (let category in categoryTotals) {
    const amount = categoryTotals[category];

    if (amount > highestAmount) {
      highestAmount = amount;
      highestCategory = category;
    }

    const percentage = (amount / totalCategoryExpense) * 100;

    const div = document.createElement("div");
    div.classList.add("category-item");

    div.innerHTML = `
      <div class="category-top">
        <span>${capitalize(category)}</span>
        <span>₹${amount.toLocaleString("en-IN")} (${percentage.toFixed(1)}%)</span>
      </div>

      <div class="progress">
        <div class="progress-bar" style="width: ${percentage}%"></div>
      </div>
    `;

    categoryList.appendChild(div);
  }

  topCategoryEl.innerText = `Top: ${capitalize(highestCategory)}`;
}

// Display history
function displayHistory() {
  historyList.innerHTML = "";

  if (expenseData.length === 0) {
    historyList.innerHTML =
      `<p class="empty">No expense history yet</p>`;
    return;
  }

  const sortedData = [...expenseData].sort(function (a, b) {
    return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
  });

  sortedData.forEach(function (item) {
    const total = getMonthlyTotal(item);

    const div = document.createElement("div");
    div.classList.add("history-item");

    div.innerHTML = `
      <div>
        <h3>${item.month}</h3>
        <p>Food: ₹${item.food} • Travel: ₹${item.travel} • Shopping: ₹${item.shopping}</p>
      </div>

      <div class="history-total">
        ₹${total.toLocaleString("en-IN")}
      </div>
    `;

    historyList.appendChild(div);
  });
}

// Draw chart
function drawChart() {
  const canvas = document.querySelector("#expenseChart");

  if (expenseChart) {
    expenseChart.destroy();
  }

  const sortedData = [...expenseData].sort(function (a, b) {
    return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
  });

  const labels = sortedData.map(item => item.month);
  const totals = sortedData.map(item => getMonthlyTotal(item));

  expenseChart = new Chart(canvas, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Monthly Expense",
        data: totals,
        borderColor: "#4f46e5",
        backgroundColor: "#4f46e533",
        fill: true,
        tension: 0.3,
        borderWidth: 3,
        pointRadius: 5
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
          beginAtZero: true
        }
      }
    }
  });
}

// Capitalize text
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Clear all data
clearBtn.addEventListener("click", function () {
  if (expenseData.length === 0) return;

  const confirmDelete = confirm("Delete all expense data?");

  if (confirmDelete) {
    expenseData = [];
    saveData();
    updateDashboard();
  }
});

// Dark mode
themeBtn.addEventListener("click", function () {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    themeBtn.innerText = "☀️ Light Mode";
  } else {
    themeBtn.innerText = "🌙 Dark Mode";
  }
});

// Initial load
updateDashboard();