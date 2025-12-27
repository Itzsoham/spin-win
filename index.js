// Configuration
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyN8LVoU_1wcrJQiQebZjw46_9X9bDoSzA7fSDFDihoCQXLK4j05Q4rEzR-G-EPWTW0/exec";
const DISCOUNT_VALUES = [2, 3, 5, 7, 10]; // Discount percentages
const SEGMENT_ANGLE = 360 / DISCOUNT_VALUES.length; // 72 degrees per segment

// DOM Elements
const orderNumberInput = document.getElementById("orderNumber");
const spinButton = document.getElementById("spinButton");
const spinnerWheel = document.getElementById("spinnerWheel");
const resultDisplay = document.getElementById("resultDisplay");
const discountText = document.getElementById("discountText");
const statusMessage = document.getElementById("statusMessage");
const productImageContainer = document.getElementById("productImageContainer");

// State
let isSpinning = false;
let currentRotation = 0;
let myChart;

// Chart.js colors matching original theme
const pieColors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#f9ca24", "#6c5ce7"];

// Initialize Chart.js wheel
function initializeWheel() {
  const data = DISCOUNT_VALUES.map(() => 1); // Equal size segments

  myChart = new Chart(spinnerWheel, {
    plugins: [ChartDataLabels],
    type: "pie",
    data: {
      labels: DISCOUNT_VALUES.map((v) => `${v}%`),
      datasets: [
        {
          backgroundColor: pieColors,
          data: data,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      animation: { duration: 0 },
      plugins: {
        tooltip: false,
        legend: { display: false },
        datalabels: {
          color: "#ffffff",
          formatter: (_, context) =>
            context.chart.data.labels[context.dataIndex],
          font: { size: 24, weight: "bold" },
        },
      },
    },
  });
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  initializeWheel();
  spinButton.addEventListener("click", handleSpin);
  orderNumberInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleSpin();
    }
  });
});

// Main spin handler
async function handleSpin() {
  // Validation
  const orderNumber = orderNumberInput.value.trim();
  if (!orderNumber) {
    showStatus("Please enter an order number!", "error");
    orderNumberInput.focus();
    return;
  }

  if (isSpinning) {
    return;
  }

  // Start spinning
  isSpinning = true;
  spinButton.disabled = true;
  resultDisplay.classList.remove("show");
  statusMessage.classList.remove("show");

  productImageContainer.classList.add("hide");

  // Random discount selection
  const randomIndex = Math.floor(Math.random() * DISCOUNT_VALUES.length);
  const selectedDiscount = DISCOUNT_VALUES[randomIndex];

  // Calculate the target angle for the selected segment
  const targetAngle = randomIndex * SEGMENT_ANGLE;
  const randomDegree = targetAngle + Math.floor(Math.random() * SEGMENT_ANGLE);

  // Spin animation using Chart.js rotation
  let count = 0;
  let resultValue = 101;
  const baseRotations = 1800; // 5 full rotations
  const finalRotation = baseRotations + randomDegree;

  let rotationInterval = setInterval(() => {
    myChart.options.rotation = myChart.options.rotation + resultValue;
    myChart.update();

    if (myChart.options.rotation >= 360) {
      count += 1;
      resultValue -= 5;
      myChart.options.rotation = 0;
    } else if (count > 15 && myChart.options.rotation >= randomDegree % 360) {
      clearInterval(rotationInterval);

      // Show result after animation
      setTimeout(() => {
        displayResult(selectedDiscount);
        saveToGoogleSheets(orderNumber, selectedDiscount);
        createConfetti();
        isSpinning = false;
        spinButton.disabled = false;
      }, 500);
    }
  }, 10);
}

// Display the result
function displayResult(discount) {
  discountText.textContent = `${discount}%`;
  resultDisplay.classList.add("show");
}

// Save data to Google Sheets
async function saveToGoogleSheets(orderNumber, discount) {
  showStatus("Saving to Google Sheets...", "");

  try {
    const currentDate = new Date().toLocaleDateString("en-GB"); // DD/MM/YYYY format

    const data = {
      orderNo: orderNumber,
      discount: discount,
      date: currentDate,
    };

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", // Google Apps Script requires no-cors
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    // Note: With no-cors mode, we can't read the response
    // We'll assume success if no error is thrown
    showStatus("âœ… Discount saved successfully!", "success");

    // Clear input after successful save
    setTimeout(() => {
      orderNumberInput.value = "";
      orderNumberInput.focus();
    }, 1000);
  } catch (error) {
    console.error("Error saving to Google Sheets:", error);
    showStatus(
      "âš ï¸ Discount won, but failed to save. Please try again.",
      "error"
    );
  }
}

// Show status message
function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = "status-message show";

  if (type) {
    statusMessage.classList.add(type);
  }

  // Auto-hide after 5 seconds
  setTimeout(() => {
    statusMessage.classList.remove("show");
  }, 5000);
}

// Create confetti effect
function createConfetti() {
  const colors = [
    "#ff6b6b",
    "#4ecdc4",
    "#45b7d1",
    "#f9ca24",
    "#6c5ce7",
    "#f093fb",
  ];
  const confettiCount = 50;

  for (let i = 0; i < confettiCount; i++) {
    setTimeout(() => {
      const confetti = document.createElement("div");
      confetti.className = "confetti";
      confetti.style.left = Math.random() * 100 + "%";
      confetti.style.background =
        colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = Math.random() * 0.5 + "s";
      confetti.style.animationDuration = Math.random() * 2 + 2 + "s";
      document.body.appendChild(confetti);

      // Remove confetti after animation
      setTimeout(() => {
        confetti.remove();
      }, 3000);
    }, i * 30);
  }
}

// Utility function for delays
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Add keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Press Space to spin (when not focused on input)
  if (e.code === "Space" && document.activeElement !== orderNumberInput) {
    e.preventDefault();
    handleSpin();
  }
});

// Add visual feedback for button
spinButton.addEventListener("mousedown", () => {
  spinButton.style.transform = "scale(0.95)";
});

spinButton.addEventListener("mouseup", () => {
  spinButton.style.transform = "";
});

// Prevent multiple rapid clicks
let lastClickTime = 0;
spinButton.addEventListener(
  "click",
  (e) => {
    const now = Date.now();
    if (now - lastClickTime < 500) {
      e.preventDefault();
      e.stopPropagation();
    }
    lastClickTime = now;
  },
  true
);
