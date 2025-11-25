const defaultJobs = [
  { id: 1, title: "Software Engineer" },
  { id: 2, title: "UI/UX Designer" },
  { id: 3, title: "Fullstack Developer"}
];

const defaultApplicants = [
  {
    id: 1,
    name: "Lugh Tuatha De",
    position: "Software Engineer",
    email: "lugh@example.com",
    phone: "+1 111 222 3333",
    address: "Maramag City",
    resume: "Lugh_Resume.pdf",
    status: "shortlisted",
    photo: "applicant1.jpg"
  },
  {
    id: 2,
    name: "Jimby Lp",
    position: "UI/UX Designer",
    email: "jimbs@example.com",
    phone: "+1 222 333 4444",
    address: "Cagayan De Oro City",
    resume: "Jimby_Resume.pdf",
    status: "shortlisted",
    photo: "applicant2.jpg"
  }
];

function loadData() {
  if (!localStorage.getItem("jobs")) {
    localStorage.setItem("jobs", JSON.stringify(defaultJobs));
  }
  if (!localStorage.getItem("applicants")) {
    localStorage.setItem("applicants", JSON.stringify(defaultApplicants));
  }
}

function getJobs() {
  return JSON.parse(localStorage.getItem("jobs") || "[]");
}

function getApplicants() {
  return JSON.parse(localStorage.getItem("applicants") || "[]");
}

function saveJobs(jobs) {
  localStorage.setItem("jobs", JSON.stringify(jobs));
}

function saveApplicants(apps) {
  localStorage.setItem("applicants", JSON.stringify(apps));
}

function goTo(page) {
  window.location.href = page;
}

function logout() {
  // If you want to keep data but remove session, change this.
  localStorage.removeItem("isLoggedIn");
  goTo("loginpage.html");
}

function handleLogin() {
  // basic visual validation (no server)
  const email = document.querySelector("#emailInput")?.value?.trim();
  const pw = document.querySelector("#passwordInput")?.value?.trim();
  if (!email || !pw) {
    alert("Please enter email and password (any values will work in this demo).");
    return;
  }
  // mark logged in and redirect
  localStorage.setItem("isLoggedIn", "1");
  goTo("dashboard.html");
}

function addJob(title) {
  const jobs = getJobs();
  const newJob = {
    id: Date.now(),
    title: title
  };
  jobs.push(newJob);
  saveJobs(jobs);
}

function viewApplicant(id) {
  localStorage.setItem("selectedApplicantId", String(id));
  goTo("applicantdetailspage.html");
}

function scheduleInterview(id) {
  alert("Interview scheduled for applicant ID: " + id);
}

function hireApplicant(id) {
  // mark applicant as hired (simple)
  const apps = getApplicants();
  const idx = apps.findIndex(a => a.id === Number(id));
  if (idx >= 0) {
    apps[idx].status = "hired";
    saveApplicants(apps);
    alert(apps[idx].name + " has been marked as hired.");
    // if on details page, update status display after hiring
    const statusEl = document.querySelector("#appStatus");
    if (statusEl) statusEl.innerText = "hired";
  } else {
    alert("Applicant not found.");
  }
}

/* Simple guard — redirect to login if not logged in (except login page) */
function ensureAuth(page) {
  if (page !== "loginpage.html") {
    const logged = localStorage.getItem("isLoggedIn");
    if (!logged) {
      goTo("loginpage.html");
      return false;
    }
  }
  return true;
}

/* DOM wiring */
document.addEventListener("DOMContentLoaded", () => {
  loadData();

  const page = window.location.pathname.split("/").pop();

  if (!ensureAuth(page)) return;

  /* --- loginpage.html --- */
  if (page === "loginpage.html") {
    const loginBtn = document.querySelector("#loginBtn");
    if (loginBtn) loginBtn.onclick = handleLogin;
    return;
  }

  /* --- dashboard.html --- */
  if (page === "dashboard.html") {
    // counts
    const applicants = getApplicants();
    const jobs = getJobs();

    const jobCountEl = document.querySelector("#jobCount");
    const applicantCountEl = document.querySelector("#applicantCount");
    const interviewCountEl = document.querySelector("#interviewCount");

    if (jobCountEl) jobCountEl.innerText = jobs.length;
    if (applicantCountEl) applicantCountEl.innerText = applicants.length;
    if (interviewCountEl) interviewCountEl.innerText = 1; // simulated

    // nav buttons
    const btnApplicants = document.querySelector("#goApplicants");
    const btnJobs = document.querySelector("#goJobs");
    const btnLogout = document.querySelector("#logoutBtn");

    if (btnApplicants) btnApplicants.onclick = () => goTo("applicantlistpage.html");
    if (btnJobs) btnJobs.onclick = () => goTo("jobmanagementpage.html");
    if (btnLogout) btnLogout.onclick = logout;

    // make recent applicant cards clickable if present
    document.querySelectorAll("[data-applicant-id]").forEach(el => {
      el.addEventListener("click", () => {
        const id = el.getAttribute("data-applicant-id");
        if (id) viewApplicant(Number(id));
      });
    });

    return;
  }

  /* --- applicantlistpage.html --- */
  if (page === "applicantlistpage.html") {
    const listContainer = document.querySelector("#applicantList");
    const backBtn = document.querySelector("#backDashboard");
    const applicants = getApplicants();

    if (listContainer) {
      if (applicants.length === 0) {
        listContainer.innerHTML = `<div class="text-center text-stone-600">No applicants yet.</div>`;
      } else {
        listContainer.innerHTML = applicants.map(app => `
          <button data-applicant-id="${app.id}" class="w-full bg-white rounded-2xl p-5 flex items-center gap-4 hover:shadow-lg border border-stone-300 mb-4">
            <img src="${app.photo}" alt="${app.name}" class="w-20 h-20 rounded-full object-cover border-4 border-stone-200" />
            <div class="flex-1 text-left">
              <h3 class="text-stone-900 mb-1">${app.name}</h3>
              <p class="text-stone-600">${app.position}</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        `).join("");
        // attach click handlers
        document.querySelectorAll("[data-applicant-id]").forEach(el => {
          el.onclick = () => viewApplicant(Number(el.getAttribute("data-applicant-id")));
        });
      }
    }

    if (backBtn) backBtn.onclick = () => goTo("dashboard.html");
    return;
  }

  /* --- applicantdetailspage.html --- */
  if (page === "applicantdetailspage.html") {
    const id = Number(localStorage.getItem("selectedApplicantId"));
    const applicants = getApplicants();
    const app = applicants.find(a => a.id === id);

    if (app) {
      const setText = (sel, txt) => { const el = document.querySelector(sel); if (el) el.innerText = txt; };
      const setSrc = (sel, src) => { const el = document.querySelector(sel); if (el) el.src = src; };

      setText("#appName", app.name);
      setText("#appPosition", app.position);
      setText("#appEmail", app.email);
      setText("#appPhone", app.phone);
      setText("#appAddress", app.address);
      setText("#appResume", app.resume);
      setText("#appStatus", app.status || "");
      setSrc("#appPhoto", app.photo || "applicant1.jpg");
    } else {
      alert("Applicant not found.");
    }

    const backBtn = document.querySelector("#backBtn");
    const scheduleBtn = document.querySelector("#scheduleBtn");
    const hireBtn = document.querySelector("#hireBtn");

    if (backBtn) backBtn.onclick = () => goTo("applicantlistpage.html");
    if (scheduleBtn && app) scheduleBtn.onclick = () => scheduleInterview(id);
    if (hireBtn && app) hireBtn.onclick = () => hireApplicant(id);

    return;
  }

  /* --- jobmanagementpage.html --- */
  if (page === "jobmanagementpage.html") {
    const jobListContainer = document.querySelector("#jobList");
    const addBtn = document.querySelector("#addJobBtn");
    const input = document.querySelector("#jobTitleInput");
    const backBtn = document.querySelector("#backDashboard");

    const renderJobs = () => {
      const jobs = getJobs();
      if (!jobListContainer) return;
      if (jobs.length === 0) {
        jobListContainer.innerHTML = `<div class="text-center text-stone-600">No jobs yet.</div>`;
      } else {
        jobListContainer.innerHTML = jobs.map(j => `
          <div class="bg-white rounded-2xl px-6 py-5 border border-stone-300 mb-3 flex justify-between items-center">
            <div>${j.title}</div>
            <div>
              <button onclick="alert('Viewing candidates for ${j.title}')" class="px-3 py-1 rounded-full border text-sm">View</button>
            </div>
          </div>
        `).join("");
      }
    };

    if (addBtn) {
      addBtn.onclick = () => {
        const title = input?.value?.trim();
        if (!title) {
          alert("Enter a job title.");
          return;
        }
        addJob(title);
        input.value = "";
        renderJobs();
      };
    }

    if (backBtn) backBtn.onclick = () => goTo("dashboard.html");

    renderJobs();
    return;
  }

});
