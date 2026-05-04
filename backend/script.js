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

const homeLink     = document.getElementById("homeLink");
const statsLink    = document.getElementById("statsLink");
const settingsLink = document.getElementById("settingsLink");
const infoLink     = document.getElementById("infoLink");

const homeLinkMobile     = document.getElementById("homeLinkMobile");
const statsLinkMobile    = document.getElementById("statsLinkMobile");
const settingsLinkMobile = document.getElementById("settingsLinkMobile");
const infoLinkMobile     = document.getElementById("infoLinkMobile");

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

/* ================= NURSE DOM REFERENCES ================= */

const nurseRegisterScreen     = document.getElementById("nurseRegisterScreen");
const nurseDashboard          = document.getElementById("nurseDashboard");
const nurseRegFirstName       = document.getElementById("nurseRegFirstName");
const nurseRegMiddleName      = document.getElementById("nurseRegMiddleName");
const nurseRegLastName        = document.getElementById("nurseRegLastName");
const nurseRegUsername        = document.getElementById("nurseRegUsername");
const nurseRegPassword        = document.getElementById("nurseRegPassword");
const nurseRegConfirmPassword = document.getElementById("nurseRegConfirmPassword");
const nurseSecretCode         = document.getElementById("nurseSecretCode");
const nurseRegisterBtn        = document.getElementById("nurseRegisterBtn");
const nurseRegisterError      = document.getElementById("nurseRegisterError");
const nurseLogoutBtn          = document.getElementById("nurseLogoutBtn");
const nurseGreeting           = document.getElementById("nurseGreeting");
const nurseRefreshBtn         = document.getElementById("nurseRefreshBtn");
const nurseTableBody          = document.getElementById("nurseTableBody");
const nurseSearch             = document.getElementById("nurseSearch");
const nurseFilter             = document.getElementById("nurseFilter");
const nursePortalLink         = document.getElementById("nursePortalLink");
const logoClickTarget         = document.getElementById("logoClickTarget");

const NURSE_SECRET = "NURSE2025";

let currentUser    = null;
let nurseAllRows   = [];


/* ================= HIDDEN LOGO TAP — NURSE PORTAL ================= */

let logoTapCount = 0;
let logoTapTimer = null;

if (logoClickTarget) {
  logoClickTarget.addEventListener("click", () => {
    logoTapCount++;
    clearTimeout(logoTapTimer);
    logoTapTimer = setTimeout(() => { logoTapCount = 0; }, 2000);

    if (logoTapCount >= 5) {
      logoTapCount = 0;
      nursePortalLink.classList.remove("hidden");
      nursePortalLink.classList.add("nurse-portal-reveal");
    }
  });
}

if (nursePortalLink) {
  nursePortalLink.addEventListener("click", () => {
    loginScreen.style.display         = "none";
    nurseRegisterScreen.style.display = "flex";
  });
}

if (document.getElementById("nurseGoToLogin")) {
  document.getElementById("nurseGoToLogin").addEventListener("click", () => {
    nurseRegisterScreen.style.display = "none";
    loginScreen.style.display         = "flex";
  });
}

/* ================= NURSE REGISTER ================= */

/* ================= NURSE REGISTER ================= */

if (nurseRegisterBtn) {
  nurseRegisterBtn.addEventListener("click", async () => {
    const firstName       = nurseRegFirstName.value.trim();
    const middleName      = nurseRegMiddleName.value.trim();
    const lastName        = nurseRegLastName.value.trim();
    const username        = nurseRegUsername.value.trim();
    const password        = nurseRegPassword.value.trim();
    const confirmPassword = nurseRegConfirmPassword.value.trim();
    const secretCode      = nurseSecretCode.value.trim();

    if (!firstName || !lastName || !username || !password || !confirmPassword) {
      nurseRegisterError.textContent = "Please fill all required fields.";
      return;
    }

    if (password !== confirmPassword) {
      nurseRegisterError.textContent = "Passwords do not match.";
      return;
    }

    if (secretCode !== NURSE_SECRET) {
      nurseRegisterError.textContent = "Invalid nurse access code.";
      return;
    }

    try {
      const res = await fetch(`${SERVER}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          first_name: firstName,
          middle_name: middleName || null,
          last_name: lastName,
          role: "nurse"
        })
      });

      const data = await res.json();

      if (!data.success) {
        nurseRegisterError.textContent = data.message;
        return;
      }

      // Log in immediately and go straight to nurse dashboard
      const loginRes = await fetch(`${SERVER}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const loginData = await loginRes.json();

      if (loginData.success) {
        currentUser = loginData.user;
        currentUser.role = "nurse";
        localStorage.setItem("pulse_user_id", String(currentUser.user_id));
        nurseRegisterScreen.style.display = "none";
        startNurseSession();
      }

    } catch {
      nurseRegisterError.textContent = "Server not reachable.";
    }
  });
}


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

  // Route by role
  if (currentUser.role === "nurse") {
    startNurseSession();
    return;
  }

  // Student flow
  mainApp.style.display = "flex";

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
  await loadHistory();
}


/* ================= NURSE SESSION ================= */

function startNurseSession() {
  nurseDashboard.style.display = "flex";

  const fullName = [currentUser.first_name, currentUser.middle_name, currentUser.last_name]
    .filter(Boolean).join(" ");

  if (nurseGreeting) nurseGreeting.textContent = "Logged in as " + (fullName || currentUser.username);
  if (document.getElementById("nurseDisplayName")) {
    document.getElementById("nurseDisplayName").textContent = fullName || currentUser.username;
  }
  if (document.getElementById("nurseProfilePic") && currentUser.profilePic) {
    document.getElementById("nurseProfilePic").src = currentUser.profilePic;
  }

  loadNurseDashboard();
}


/* ================= LOAD NURSE DASHBOARD ================= */

async function loadNurseDashboard() {
  if (nurseTableBody) {
    nurseTableBody.innerHTML = `<tr><td colspan="9" class="nurse-loading">Loading students…</td></tr>`;
  }

  try {
    const res  = await fetch(`${SERVER}/nurse/students`);
    const data = await res.json();

    nurseAllRows = data;
    renderNurseTable(data);
    updateNurseStats(data);

  } catch (err) {
    console.error("Nurse dashboard error:", err);
    if (nurseTableBody) {
      nurseTableBody.innerHTML = `<tr><td colspan="9" class="nurse-loading">Failed to load data.</td></tr>`;
    }
  }
}


/* ================= RENDER NURSE TABLE ================= */

function renderNurseTable(rows) {
  if (!nurseTableBody) return;

  if (!rows.length) {
    nurseTableBody.innerHTML = `<tr><td colspan="9" class="nurse-loading">No students found.</td></tr>`;
    return;
  }

  nurseTableBody.innerHTML = rows.map(s => {
    const bpm    = s.latest_bpm  ?? "—";
    const spo2   = s.latest_spo2 ?? "—";
    const sleep  = s.sleep  ? `${s.sleep.value1}h ${s.sleep.value2}m` : "—";
    const water  = s.water  ? `${s.water.value1} ${s.water.unit}`     : "—";
    const steps  = s.steps  ? `${s.steps.value1}`                     : "—";
    const stress = s.stress ? s.stress.unit                           : "—";

    const status    = getStatus(s.latest_bpm, s.latest_spo2);
    const statusTag = `<span class="status-badge status-${status.cls}">${status.label}</span>`;

    const lastRead = s.last_reading_at
      ? new Date(s.last_reading_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
      : "No readings";

    const fullName = [s.first_name, s.middle_name, s.last_name].filter(Boolean).join(" ");
    const avatar   = s.profilePic && s.profilePic.startsWith("http")
      ? `<img src="${s.profilePic}" class="nurse-avatar" alt="pic">`
      : `<div class="nurse-avatar-placeholder">${(s.first_name || s.username || "?")[0].toUpperCase()}</div>`;

    return `
      <tr class="nurse-row" data-status="${status.cls}">
        <td>
          <div class="nurse-student-cell">
            ${avatar}
            <div>
              <div class="nurse-student-name">${fullName || s.username}</div>
              <div class="nurse-student-user">@${s.username}</div>
            </div>
          </div>
        </td>
        <td><span class="metric-pill bpm-pill">${bpm}${bpm !== "—" ? " bpm" : ""}</span></td>
        <td><span class="metric-pill oxy-pill">${spo2}${spo2 !== "—" ? "%" : ""}</span></td>
        <td>${sleep}</td>
        <td>${water}</td>
        <td>${steps}</td>
        <td>${stress}</td>
        <td>${statusTag}</td>
        <td class="last-read-cell">${lastRead}</td>
      </tr>
    `;
  }).join("");
}


/* ================= STATUS LOGIC ================= */

function getStatus(bpm, spo2) {
  if (!bpm && !spo2) return { cls: "nodata",  label: "No Data" };
  const bpmNum  = Number(bpm);
  const spo2Num = Number(spo2);
  if ((bpm  && (bpmNum  < 60 || bpmNum  > 100)) ||
      (spo2 && spo2Num < 95)) {
    return { cls: "alert",  label: "⚠ Attention" };
  }
  return { cls: "normal", label: "✓ Normal" };
}


/* ================= NURSE STATS BAR ================= */

function updateNurseStats(rows) {
  const total  = rows.length;
  let normal = 0, alert = 0, nodata = 0;

  rows.forEach(s => {
    const st = getStatus(s.latest_bpm, s.latest_spo2).cls;
    if (st === "normal") normal++;
    else if (st === "alert")  alert++;
    else nodata++;
  });

  if (document.getElementById("totalStudents"))  document.getElementById("totalStudents").textContent  = total;
  if (document.getElementById("normalCount"))    document.getElementById("normalCount").textContent    = normal;
  if (document.getElementById("alertCount"))     document.getElementById("alertCount").textContent     = alert;
  if (document.getElementById("noDataCount"))    document.getElementById("noDataCount").textContent    = nodata;
}


/* ================= NURSE SEARCH & FILTER ================= */

function applyNurseFilters() {
  const q      = (nurseSearch  ? nurseSearch.value.toLowerCase()  : "");
  const filter = (nurseFilter  ? nurseFilter.value                : "all");

  const filtered = nurseAllRows.filter(s => {
    const fullName = [s.first_name, s.middle_name, s.last_name, s.username]
      .filter(Boolean).join(" ").toLowerCase();
    const matchQ = !q || fullName.includes(q);

    const status   = getStatus(s.latest_bpm, s.latest_spo2).cls;
    const matchF   = filter === "all"
      || (filter === "normal" && status === "normal")
      || (filter === "alert"  && status === "alert")
      || (filter === "nodata" && status === "nodata");

    return matchQ && matchF;
  });

  renderNurseTable(filtered);
}

if (nurseSearch) nurseSearch.addEventListener("input",  applyNurseFilters);
if (nurseFilter) nurseFilter.addEventListener("change", applyNurseFilters);
if (nurseRefreshBtn) nurseRefreshBtn.addEventListener("click", loadNurseDashboard);


/* ================= NURSE LOGOUT ================= */

if (nurseLogoutBtn) {
  nurseLogoutBtn.addEventListener("click", () => {
    localStorage.removeItem("pulse_user_id");
    currentUser = null;
    nurseDashboard.style.display  = "none";
    loginScreen.style.display     = "flex";
    nurseAllRows = [];
  });
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
        last_name: lastName,
        role: "student"
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


/* ================= LOGOUT (student) ================= */

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

document.querySelectorAll(".lifestyle-grid .ghost-btn").forEach(button => {
  button.addEventListener("click", (e) => {
    e.stopPropagation();

    document.querySelectorAll(".details-popup").forEach(p => p.remove());

    const card        = button.closest(".lifestyle-card");
    const metricTitle = card.querySelector(".lifestyle-label").textContent;
    const metricVal   = card.querySelector(".lifestyle-value").textContent;

    let recommendation = "";
    const t = metricTitle.toLowerCase();

    if (t.includes("sleep"))   recommendation = "Recommended sleep duration: 7-9 hours per night for adults.";
    if (t.includes("water"))   recommendation = "Recommended water intake: About 2-3 liters per day.";
    if (t.includes("calorie")) recommendation = "Average daily intake: 2000-2500 kcal depending on age and activity.";
    if (t.includes("step"))    recommendation = "Recommended: 8,000-10,000 steps per day for good health.";
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
        notesEl.innerHTML = `<img src="write.png" alt="note" class="note-icon"> ${metric.notes}`;
      }
    });

  } catch (err) {
    console.error("Error loading metrics:", err);
  }
}


/* ================= VITALS ================= */

function updateVitalCard(valueId, barId, value, maxValue) {
  const valueEl = document.getElementById(valueId);
  const barEl   = document.getElementById(barId);
  if (!valueEl || !barEl) return;

  valueEl.style.transition = "opacity 0.3s ease";
  valueEl.style.opacity    = 0;

  setTimeout(() => {
    valueEl.textContent   = value;
    valueEl.style.opacity = 1;
  }, 300);

  const pct = Math.min((value / maxValue) * 100, 100);
  barEl.style.transition = "width 0.8s ease";
  barEl.style.width      = isNaN(value) ? "0%" : pct + "%";
}

updateVitalCard("bpmValue",    "bpmBar",    "--", 180);
updateVitalCard("oxygenValue", "oxygenBar", "--", 100);
updateVitalCard("rrValue",     "rrBar",     "--",  30);


/* ================= ARDUINO WEBSOCKET ================= */

let lastSavedTime = 0;

function connectArduino() {
  const ws = new WebSocket('ws://localhost:8080');

  ws.onopen = () => console.log('Arduino bridge connected');

  ws.onmessage = async (e) => {
  try {
    const d = JSON.parse(e.data);

    if (d.status === 'no_finger') {
      updateVitalCard("bpmValue",    "bpmBar",    "--", 180);
      updateVitalCard("oxygenValue", "oxygenBar", "--", 100);
      updateVitalCard("rrValue",     "rrBar",     "--",  30);
      return;
    }

    const bpm  = d.valid_bpm  && d.bpm  > 20  && d.bpm  < 255  ? Math.round(d.bpm)  : null;
    const spo2 = d.valid_spo2 && d.spo2 > 50  && d.spo2 <= 100 ? d.spo2              : null;
    const rr = d.rr > 0 ? d.rr : null;

    if (bpm)  updateVitalCard("bpmValue",    "bpmBar",    bpm,  180);
    if (spo2) updateVitalCard("oxygenValue", "oxygenBar", spo2, 100);
    if (rr)   updateVitalCard("rrValue",     "rrBar",     rr,    30);

    if (bpm) addLiveReading(bpm, spo2 || 0);

    const now = Date.now();
    if (bpm && currentUser && (now - lastSavedTime > 10000)) {
      lastSavedTime = now;
      await saveReading(bpm, spo2 || 0);
    }

  } catch (err) {
    console.error('WebSocket parse error:', err);
  }
};

  ws.onclose = () => {
    console.log('Arduino bridge disconnected — retrying in 3s...');
    setTimeout(connectArduino, 3000);
  };

  ws.onerror = () => {};
}

connectArduino();


/* ================= SAVE READING TO SUPABASE ================= */

async function saveReading(bpm, spo2) {
  try {
    await fetch(`${SERVER}/save-reading`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser.user_id, bpm, spo2 })
    });
    console.log("Reading saved:", bpm, spo2);
  } catch (err) {
    console.error("Save reading error:", err);
  }
}


/* ================= PULSE HISTORY CHART ================= */

const ctx = document.getElementById("pulseChart");
let pulseChart = null;
const liveLabels = [];
const liveBpm    = [];
const liveSpo2   = [];

if (ctx) {
  const chartCtx = ctx.getContext("2d");

  const bpmGrad = chartCtx.createLinearGradient(0, 0, 0, 400);
  bpmGrad.addColorStop(0, "rgba(74, 144, 217, 0.9)");
  bpmGrad.addColorStop(1, "rgba(74, 144, 217, 0.45)");

  const oxyGrad = chartCtx.createLinearGradient(0, 0, 0, 400);
  oxyGrad.addColorStop(0, "rgba(110, 198, 245, 0.9)");
  oxyGrad.addColorStop(1, "rgba(110, 198, 245, 0.45)");

  pulseChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: liveLabels,
      datasets: [
        {
          label: "BPM",
          data: liveBpm,
          borderColor: "rgba(74, 144, 217, 1)",
          backgroundColor: bpmGrad,
          borderWidth: 2,
          pointRadius: 3,
          tension: 0.4,
          fill: true,
        },
        {
          label: "SpO2 %",
          data: liveSpo2,
          borderColor: "rgba(110, 198, 245, 1)",
          backgroundColor: oxyGrad,
          borderWidth: 2,
          pointRadius: 3,
          tension: 0.4,
          fill: true,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 500 },
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          labels: {
            color: "#7a90a8",
            font: { size: 12, family: "DM Sans" },
            padding: 20,
            usePointStyle: true,
          }
        },
        tooltip: {
          backgroundColor: "rgba(255,255,255,0.97)",
          titleColor: "#1c2b3a",
          bodyColor: "#8fa3bc",
          borderColor: "rgba(74,144,217,0.25)",
          borderWidth: 1,
          padding: 12,
          cornerRadius: 12,
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#8fa3bc", font: { family: "DM Sans" }, maxTicksLimit: 10 },
          border: { display: false }
        },
        y: {
          grid: { color: "rgba(163,185,210,0.35)", lineWidth: 1 },
          ticks: { color: "#8fa3bc", font: { family: "DM Sans", size: 11 }, padding: 8 },
          border: { display: false }
        }
      }
    }
  });
}


/* ================= ADD LIVE READING TO CHART ================= */

function addLiveReading(bpm, spo2) {
  const now   = new Date();
  const label = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  liveLabels.push(label);
  liveBpm.push(bpm);
  liveSpo2.push(spo2);

  if (liveLabels.length > 30) {
    liveLabels.shift();
    liveBpm.shift();
    liveSpo2.shift();
  }

  if (pulseChart) pulseChart.update();
}


/* ================= LOAD HISTORY FROM SUPABASE ================= */

async function loadHistory() {
  if (!currentUser) return;

  try {
    const res  = await fetch(`${SERVER}/readings/${currentUser.user_id}`);
    const data = await res.json();

    if (!data.length || !pulseChart) return;

    const byDay = {};
    data.forEach(r => {
      const day = new Date(r.created_at).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
      if (!byDay[day]) byDay[day] = { bpm: [], spo2: [] };
      byDay[day].bpm.push(r.bpm);
      byDay[day].spo2.push(r.spo2);
    });

    const days    = Object.keys(byDay).reverse();
    const avgBpm  = days.map(d => Math.round(byDay[d].bpm.reduce((a,b) => a+b, 0)  / byDay[d].bpm.length));
    const avgSpo2 = days.map(d => Math.round(byDay[d].spo2.reduce((a,b) => a+b, 0) / byDay[d].spo2.length));

    pulseChart.data.labels           = days;
    pulseChart.data.datasets[0].data = avgBpm;
    pulseChart.data.datasets[1].data = avgSpo2;
    pulseChart.update();

  } catch (err) {
    console.error("Load history error:", err);
  }
}