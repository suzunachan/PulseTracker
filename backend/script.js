/* ================================================
   PULSE TRACKER — MAIN SCRIPT
   ================================================ */

const SERVER = "https://pulsetracker-7g11.onrender.com";

/* ================= DOM REFERENCES ================= */

const loginScreen    = document.getElementById("loginScreen");
const registerScreen = document.getElementById("registerScreen");
const mainApp        = document.getElementById("mainApp");

const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");
const loginBtn      = document.getElementById("loginBtn");
const loginError    = document.getElementById("loginError");

const registerBtn             = document.getElementById("registerBtn");
const registerFirstName       = document.getElementById("registerFirstName");
const registerMiddleName      = document.getElementById("registerMiddleName");
const registerLastName        = document.getElementById("registerLastName");
const registerUsername        = document.getElementById("registerUsername");
const registerPassword        = document.getElementById("registerPassword");
const registerConfirmPassword = document.getElementById("registerConfirmPassword");
const registerError           = document.getElementById("registerError");

// Desktop sidebar nav
const homeLink     = document.getElementById("homeLink");
const statsLink    = document.getElementById("statsLink");
const settingsLink = document.getElementById("settingsLink");
const infoLink     = document.getElementById("infoLink");

// Mobile bottom nav
const homeLinkMobile     = document.getElementById("homeLinkMobile");
const statsLinkMobile    = document.getElementById("statsLinkMobile");
const settingsLinkMobile = document.getElementById("settingsLinkMobile");
const infoLinkMobile     = document.getElementById("infoLinkMobile");

// Sections
const homeSection     = document.getElementById("homeSection");
const statsSection    = document.getElementById("statsSection");
const settingsSection = document.getElementById("settingsSection");
const aboutSection    = document.getElementById("about-section");

const logoutBtn    = document.getElementById("logoutBtn");
const userGreeting = document.getElementById("userGreeting");

const newUsernameInput  = document.getElementById("newUsername");
const newPasswordInput  = document.getElementById("newPassword");
const updateUsernameBtn = document.getElementById("updateUsernameBtn");
const updatePasswordBtn = document.getElementById("updatePasswordBtn");
const updateFirstName   = document.getElementById("updateFirstName");
const updateMiddleName  = document.getElementById("updateMiddleName");
const updateLastName    = document.getElementById("updateLastName");
const updateNameBtn     = document.getElementById("updateNameBtn");

const profileUpload  = document.getElementById("profileUpload");
const profilePreview = document.getElementById("profilePreview");
const sidebarProfile = document.getElementById("sidebarProfile");

// Modal
const addInfoBtn       = document.getElementById("addInfoBtn");
const addInfoBtnMobile = document.getElementById("addInfoBtnMobile");
const sleepModal       = document.getElementById("sleepModal");
const cancelSleepBtn   = document.getElementById("cancelSleepBtn");
const saveSleepBtn     = document.getElementById("saveSleepBtn");

const metricType       = document.getElementById("metricType");
const metricUnit       = document.getElementById("metricUnit");
const unitField        = document.getElementById("unitField");
const metricValue      = document.getElementById("metricValue");
const metricNotes      = document.getElementById("metricNotes");
const singleValueField = document.getElementById("singleValueField");
const sleepFields      = document.getElementById("sleepFields");
const sleepHours       = document.getElementById("sleepHours");
const sleepMinutes     = document.getElementById("sleepMinutes");

const sleepValue    = document.getElementById("sleepValue");
const waterValue    = document.getElementById("waterValue");
const caloriesValue = document.getElementById("caloriesValue");
const stepsValue    = document.getElementById("stepsValue");
const stressValue   = document.getElementById("stressValue");

let currentUser = null;


/* ================= HELPER — APPLY PROFILE PIC ================= */

function applyProfilePic(picUrl) {
  const src = (picUrl && picUrl.startsWith("http"))
    ? picUrl
    : "default-profile.png";

  if (profilePreview) profilePreview.src = src;
  if (sidebarProfile) sidebarProfile.src = src;

  ["homeProfilePic", "homeProfilePic2", "homeProfilePic3", "homeProfilePic4"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.src = src;
  });
}


/* ================= HELPER — FETCH FRESH USER ================= */

async function fetchFreshUser(userId) {
  try {
    const res  = await fetch(`${SERVER}/user/${userId}`);
    const data = await res.json();
    if (data.success) return data.user;
  } catch (err) {
    console.error("Could not fetch user:", err);
  }
  return null;
}


/* ================= HELPER — START SESSION ================= */

async function startSession(userId) {
  const freshUser = await fetchFreshUser(userId);

  if (!freshUser) {
    localStorage.removeItem("pulse_user_id");
    loginScreen.style.display = "flex";
    return;
  }

  currentUser = freshUser;
  localStorage.setItem("pulse_user_id", String(currentUser.user_id));

  loginScreen.style.display    = "none";
  registerScreen.style.display = "none";
  mainApp.style.display        = "flex";

  if (userGreeting) userGreeting.textContent = "Welcome back, " + currentUser.username + "!";
  const greetingMobile = document.getElementById("userGreetingMobile");
  if (greetingMobile) greetingMobile.textContent = "Welcome back, " + currentUser.username + "!";

  const sidebarUsername = document.getElementById("sidebarUsername");
  if (sidebarUsername) {
    const fullName = [currentUser.first_name, currentUser.middle_name, currentUser.last_name]
      .filter(Boolean)
      .join(" ");
    sidebarUsername.textContent = fullName || currentUser.username;
  }

  applyProfilePic(currentUser.profilePic);

  if (updateFirstName)  updateFirstName.value  = currentUser.first_name  || "";
  if (updateMiddleName) updateMiddleName.value = currentUser.middle_name || "";
  if (updateLastName)   updateLastName.value   = currentUser.last_name   || "";

  await loadMetrics();
}


/* ================= SESSION RESTORE ON LOAD ================= */

window.addEventListener("DOMContentLoaded", async () => {
  const savedUserId = localStorage.getItem("pulse_user_id");
  if (!savedUserId) return;
  await startSession(savedUserId);
});


/* ================= LOGIN ================= */

loginBtn.addEventListener("click", async () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    loginError.textContent = "Please fill all fields.";
    return;
  }

  try {
    const res  = await fetch(`${SERVER}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!data.success) {
      loginError.textContent = data.message;
      return;
    }

    await startSession(data.user.user_id);

  } catch (err) {
    loginError.textContent = "Server not reachable.";
  }
});


/* ================= REGISTER ================= */

registerBtn.addEventListener("click", async () => {
  const firstName       = registerFirstName.value.trim();
  const middleName      = registerMiddleName.value.trim();
  const lastName        = registerLastName.value.trim();
  const username        = registerUsername.value.trim();
  const password        = registerPassword.value.trim();
  const confirmPassword = registerConfirmPassword.value.trim();

  if (!firstName || !lastName || !username || !password || !confirmPassword) {
    registerError.textContent = "Please fill all required fields.";
    return;
  }

  if (password !== confirmPassword) {
    registerError.textContent = "Passwords do not match.";
    return;
  }

  try {
    const res  = await fetch(`${SERVER}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password,
        first_name: firstName,
        middle_name: middleName || null,
        last_name: lastName
      })
    });

    const data = await res.json();

    if (!data.success) {
      registerError.textContent = data.message;
      return;
    }

    alert("Account created! Please login.");
    registerScreen.style.display = "none";
    loginScreen.style.display    = "flex";

  } catch {
    registerError.textContent = "Server not reachable.";
  }
});


/* ================= SCREEN SWITCHING ================= */

document.getElementById("goToRegister").addEventListener("click", () => {
  loginScreen.style.display    = "none";
  registerScreen.style.display = "flex";
});

document.getElementById("goToLogin").addEventListener("click", () => {
  registerScreen.style.display  = "none";
  loginScreen.style.display     = "flex";
  registerUsername.value        = "";
  registerPassword.value        = "";
  registerConfirmPassword.value = "";
});


/* ================= LOGOUT ================= */

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("pulse_user_id");
  currentUser = null;

  applyProfilePic(null);

  mainApp.style.display     = "none";
  loginScreen.style.display = "flex";

  usernameInput.value           = "";
  passwordInput.value           = "";
  registerFirstName.value       = "";
  registerMiddleName.value      = "";
  registerLastName.value        = "";
  registerUsername.value        = "";
  registerPassword.value        = "";
  registerConfirmPassword.value = "";

  document.querySelectorAll(".section").forEach(s => s.classList.remove("active-section"));
  homeSection.classList.add("active-section");

  document.querySelectorAll(".nav-btn, .mobile-nav-btn").forEach(b => b.classList.remove("active"));
  homeLink.classList.add("active");
  homeLinkMobile.classList.add("active");
});


/* ================= NAVIGATION ================= */

function showSection(section, desktopBtn, mobileBtn) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active-section"));
  document.querySelectorAll(".nav-btn, .mobile-nav-btn").forEach(b => b.classList.remove("active"));

  section.classList.add("active-section");
  if (desktopBtn) desktopBtn.classList.add("active");
  if (mobileBtn)  mobileBtn.classList.add("active");

  window.scrollTo(0, 0);
}

homeLink.addEventListener("click",     () => showSection(homeSection,     homeLink,     homeLinkMobile));
statsLink.addEventListener("click",    () => showSection(statsSection,    statsLink,    statsLinkMobile));
settingsLink.addEventListener("click", () => showSection(settingsSection, settingsLink, settingsLinkMobile));
infoLink.addEventListener("click",     () => showSection(aboutSection,    infoLink,     infoLinkMobile));

homeLinkMobile.addEventListener("click",     () => showSection(homeSection,     homeLink,     homeLinkMobile));
statsLinkMobile.addEventListener("click",    () => showSection(statsSection,    statsLink,    statsLinkMobile));
settingsLinkMobile.addEventListener("click", () => showSection(settingsSection, settingsLink, settingsLinkMobile));
infoLinkMobile.addEventListener("click",     () => showSection(aboutSection,    infoLink,     infoLinkMobile));


/* ================= PROFILE PICTURE UPLOAD ================= */

profileUpload.addEventListener("change", async () => {
  const file = profileUpload.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => applyProfilePic(e.target.result);
  reader.readAsDataURL(file);

  const formData = new FormData();
  formData.append("profilePic", file);
  formData.append("id", currentUser.user_id);

  try {
    const res  = await fetch(`${SERVER}/upload-profile-pic`, {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (data.success) {
      currentUser.profilePic = data.imagePath;
      applyProfilePic(currentUser.profilePic);
    } else {
      console.error("Upload failed:", data.message);
    }
  } catch (err) {
    console.error("Profile upload error:", err);
  }
});


/* ================= UPDATE USERNAME ================= */

updateUsernameBtn.addEventListener("click", async () => {
  const newUsername = newUsernameInput.value.trim();
  if (!newUsername) return alert("Enter a username");

  const res  = await fetch(`${SERVER}/update-username`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: currentUser.user_id, newUsername })
  });

  const data = await res.json();

  if (!data.success) {
    alert("Username already exists");
    return;
  }

  currentUser.username = newUsername;

  if (userGreeting) userGreeting.textContent = "Welcome back, " + newUsername + "!";
  const sidebarUsername = document.getElementById("sidebarUsername");
  if (sidebarUsername) {
    const fullName = [currentUser.first_name, currentUser.middle_name, currentUser.last_name]
      .filter(Boolean)
      .join(" ");
    sidebarUsername.textContent = fullName || newUsername;
  }

  alert("Username updated!");
  newUsernameInput.value = "";
});


/* ================= UPDATE PASSWORD ================= */

updatePasswordBtn.addEventListener("click", async () => {
  const newPassword = newPasswordInput.value.trim();
  if (!newPassword) return alert("Enter a password");

  await fetch(`${SERVER}/update-password`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: currentUser.user_id, newPassword })
  });

  alert("Password updated!");
  newPasswordInput.value = "";
});


/* ================= UPDATE FULL NAME ================= */

updateNameBtn.addEventListener("click", async () => {
  const firstName  = updateFirstName.value.trim();
  const middleName = updateMiddleName.value.trim();
  const lastName   = updateLastName.value.trim();

  if (!firstName || !lastName) return alert("First and last name are required.");

  const res  = await fetch(`${SERVER}/update-name`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: currentUser.user_id,
      first_name: firstName,
      middle_name: middleName || null,
      last_name: lastName
    })
  });

  const data = await res.json();
  if (!data.success) return alert("Failed to update name.");

  currentUser.first_name  = firstName;
  currentUser.middle_name = middleName || null;
  currentUser.last_name   = lastName;

  const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ");
  const sidebarUsername = document.getElementById("sidebarUsername");
  if (sidebarUsername) sidebarUsername.textContent = fullName;

  alert("Name updated!");
});


/* ================= VIEW DETAILS POPUP ================= */

document.querySelectorAll(".lifestyle-grid .soft-btn").forEach(button => {
  button.addEventListener("click", (e) => {
    e.stopPropagation();

    document.querySelectorAll(".details-popup").forEach(p => p.remove());

    const card        = button.closest(".stat-card");
    const metricTitle = card.querySelector(".stat-label").textContent;
    const metricVal   = card.querySelector(".stat-value").textContent;

    let recommendation = "";
    const t = metricTitle.toLowerCase();

    if (t.includes("sleep"))   recommendation = "Recommended sleep duration: 7–9 hours per night for adults.";
    if (t.includes("water"))   recommendation = "Recommended water intake: About 2–3 liters per day.";
    if (t.includes("calorie")) recommendation = "Average daily intake: 2000–2500 kcal depending on age and activity level.";
    if (t.includes("step"))    recommendation = "Recommended: 8,000–10,000 steps per day for good health.";
    if (t.includes("stress"))  recommendation = "Healthy stress level: Try to maintain low to moderate stress.";

    const popup = document.createElement("div");
    popup.classList.add("details-popup");
    popup.innerHTML = `
      <h4>${metricTitle}</h4>
      <p><strong>Current:</strong> ${metricVal}</p>
      <p>${recommendation}</p>
    `;

    card.appendChild(popup);
  });
});

document.addEventListener("click", () => {
  document.querySelectorAll(".details-popup").forEach(p => p.remove());
});


/* ================= METRIC MODAL — OPEN / CLOSE ================= */

if (addInfoBtn) {
  addInfoBtn.addEventListener("click", () => {
    resetMetricModal();
    sleepModal.classList.remove("hidden");
  });
}

if (addInfoBtnMobile) {
  addInfoBtnMobile.addEventListener("click", () => {
    resetMetricModal();
    sleepModal.classList.remove("hidden");
  });
}

cancelSleepBtn.addEventListener("click", () => {
  sleepModal.classList.add("hidden");
});

sleepModal.addEventListener("click", (e) => {
  if (e.target === sleepModal) sleepModal.classList.add("hidden");
});


/* ================= METRIC MODAL — FIELD SWITCHING ================= */

metricType.addEventListener("change", function () {
  const type = metricType.value;

  singleValueField.classList.add("hidden");
  sleepFields.classList.add("hidden");
  unitField.classList.add("hidden");
  metricUnit.innerHTML = "";

  if (type === "sleep") {
    sleepFields.classList.remove("hidden");
  }

  if (type === "water") {
    singleValueField.classList.remove("hidden");
    unitField.classList.remove("hidden");
    metricUnit.innerHTML = `
      <option value="ml">ml</option>
      <option value="liters">Liters</option>
    `;
  }

  if (type === "calories") {
    singleValueField.classList.remove("hidden");
    unitField.classList.remove("hidden");
    metricUnit.innerHTML = `<option value="kcal">kcal</option>`;
  }

  if (type === "steps") {
    singleValueField.classList.remove("hidden");
    unitField.classList.remove("hidden");
    metricUnit.innerHTML = `<option value="steps">steps</option>`;
  }

  if (type === "stress") {
    unitField.classList.remove("hidden");
    metricUnit.innerHTML = `
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
    `;
  }
});


/* ================= METRIC MODAL — RESET ================= */

function resetMetricModal() {
  metricType.value     = "";
  metricValue.value    = "";
  metricNotes.value    = "";
  metricUnit.innerHTML = '<option value="" disabled selected hidden>Select Unit</option>';
  sleepHours.value     = "";
  sleepMinutes.value   = "";

  sleepFields.classList.add("hidden");
  singleValueField.classList.add("hidden");
  unitField.classList.add("hidden");
}


/* ================= METRIC MODAL — SAVE ================= */

saveSleepBtn.addEventListener("click", async () => {
  const type = metricType.value;

  if (!type) { alert("Select a metric."); return; }

  let value1 = null;
  let value2 = null;
  let unit   = null;

  if (type === "sleep") {
    const h = parseInt(sleepHours.value)   || 0;
    const m = parseInt(sleepMinutes.value) || 0;
    if (h === 0 && m === 0) { alert("Enter sleep hours or minutes."); return; }
    value1 = h;
    value2 = m;

  } else if (type === "stress") {
    if (!metricUnit.value) { alert("Select stress level."); return; }
    unit = metricUnit.value;

  } else {
    if (!metricValue.value || !metricUnit.value) { alert("Enter value and unit."); return; }
    value1 = metricValue.value;
    unit   = metricUnit.value;
  }

  try {
    await fetch(`${SERVER}/add-metric`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: currentUser.user_id,
        metricType: type,
        value1,
        value2,
        unit,
        notes: metricNotes.value.trim() || null
      })
    });

    await loadMetrics();
    resetMetricModal();
    sleepModal.classList.add("hidden");

  } catch {
    alert("Error saving metric.");
  }
});


/* ================= LOAD & DISPLAY METRICS ================= */

async function loadMetrics() {
  try {
    const res  = await fetch(`${SERVER}/metrics/${currentUser.user_id}`);
    const data = await res.json();

    sleepValue.textContent    = "--";
    waterValue.textContent    = "--";
    caloriesValue.textContent = "--";
    stepsValue.textContent    = "--";
    stressValue.textContent   = "--";

    ["sleepNotes","waterNotes","caloriesNotes","stepsNotes","stressNotes"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = "";
    });

    const seen = {};

    data.forEach(metric => {
      if (seen[metric.metric_type]) return;
      seen[metric.metric_type] = true;

      if (metric.metric_type === "sleep")    sleepValue.textContent    = `${metric.value1}h ${metric.value2}m`;
      if (metric.metric_type === "water")    waterValue.textContent    = `${metric.value1} ${metric.unit}`;
      if (metric.metric_type === "calories") caloriesValue.textContent = `${metric.value1} ${metric.unit}`;
      if (metric.metric_type === "steps")    stepsValue.textContent    = `${metric.value1} ${metric.unit}`;
      if (metric.metric_type === "stress")   stressValue.textContent   = metric.unit;

      const notesMap = {
        sleep:    "sleepNotes",
        water:    "waterNotes",
        calories: "caloriesNotes",
        steps:    "stepsNotes",
        stress:   "stressNotes"
      };

      const notesEl = document.getElementById(notesMap[metric.metric_type]);
      if (notesEl && metric.notes) {
        notesEl.innerHTML = `<img src="icon-note.png" alt="note" class="note-icon"> ${metric.notes}`;
      }
    });

  } catch (err) {
    console.error("Error loading metrics:", err);
  }
}


/* ================= VITALS SIMULATION ================= */

function updateVitalCard(valueId, barId, value, maxValue) {
  const valueEl = document.getElementById(valueId);
  const barEl   = document.getElementById(barId);
  if (!valueEl || !barEl) return;

  valueEl.style.transition = "opacity 0.3s ease";
  valueEl.style.opacity    = 0;

  setTimeout(() => {
    valueEl.textContent    = value;
    valueEl.style.opacity  = 1;
  }, 300);

  const pct = Math.min((value / maxValue) * 100, 100);
  barEl.style.transition = "width 0.8s ease";
  barEl.style.width      = pct + "%";
}

function simulateVitals() {
  updateVitalCard("bpmValue",    "bpmBar",    72, 180);
  updateVitalCard("oxygenValue", "oxygenBar", 98, 100);
  updateVitalCard("rrValue",     "rrBar",     16,  30);

  setInterval(() => {
    updateVitalCard("bpmValue",    "bpmBar",    Math.floor(Math.random() * 41) + 60,  180);
    updateVitalCard("oxygenValue", "oxygenBar", Math.floor(Math.random() * 6)  + 95,  100);
    updateVitalCard("rrValue",     "rrBar",     Math.floor(Math.random() * 13) + 12,   30);
  }, 3500);
}

simulateVitals();


/* ================= PULSE HISTORY CHART ================= */

const ctx = document.getElementById("pulseChart");

if (ctx) {
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "BPM",
          data: [72, 75, 78, 74, 76, 73, 70],
          backgroundColor: "rgba(91, 155, 213, 0.7)",
          borderRadius: 8,
          borderSkipped: false,
        },
        {
          label: "Oxygen",
          data: [98, 97, 99, 98, 97, 98, 99],
          backgroundColor: "rgba(76, 175, 239, 0.7)",
          borderRadius: 8,
          borderSkipped: false,
        },
        {
          label: "Respiratory Rate",
          data: [16, 17, 15, 18, 16, 17, 16],
          backgroundColor: "rgba(179, 136, 255, 0.7)",
          borderRadius: 8,
          borderSkipped: false,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1500, easing: "easeInOutQuart" },
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { labels: { color: "#333", font: { size: 13 }, padding: 20 } }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#7a90a8" }
        },
        y: {
          grid: { color: "rgba(0,0,0,0.04)" },
          ticks: { color: "#7a90a8" }
        }
      }
    }
  });
}