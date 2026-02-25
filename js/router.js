/**
 * Job Notification Tracker — Client-side router
 * History API, no full page reloads. Active link does not navigate.
 */

(function () {
  function getPath() {
    return window.location.pathname.replace(/\/$/, "") || "/";
  }

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function updateDocumentTitle(title) {
    document.title = title ? title + " — Job Notification Tracker" : "Job Notification Tracker";
  }

  function setActiveNav(path) {
    var links = document.querySelectorAll(".nav-links a[data-path]");
    links.forEach(function (a) {
      var linkPath = a.getAttribute("data-path");
      if (linkPath === path) {
        a.classList.add("is-active");
      } else {
        a.classList.remove("is-active");
      }
    });
  }

  function closeMobileNav() {
    var nav = document.getElementById("nav-links");
    var toggle = document.getElementById("nav-toggle");
    if (nav) nav.classList.remove("is-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }

  /* ——— Landing (/) ——— */
  function renderLanding() {
    return (
      '<section class="context-header">' +
      '<h2 class="context-headline">Stop Missing The Right Jobs.</h2>' +
      '<p class="context-subtext">Precision-matched job discovery delivered daily at 9AM.</p>' +
      '<p class="landing-cta-wrap">' +
      '<a href="/settings" class="btn btn-primary" data-path="/settings">Start Tracking</a>' +
      "</p>" +
      "</section>"
    );
  }

  /* ——— Settings ——— */
  function renderSettings() {
    return (
      '<section class="context-header">' +
      '<h2 class="context-headline">Settings</h2>' +
      '<p class="context-subtext">Configure your job preferences. Saved to this device.</p>' +
      '</section>' +
      '<section class="page-content">' +
      '<div class="card settings-card">' +
      '<div class="form-field form-field--first">' +
      '<label class="form-label" for="settings-roleKeywords">Role keywords</label>' +
      '<input type="text" id="settings-roleKeywords" class="input" placeholder="e.g. React, Java, Frontend (comma-separated)" autocomplete="off" />' +
      "</div>" +
      '<div class="form-field">' +
      '<label class="form-label" for="settings-preferredLocations">Preferred locations</label>' +
      '<select id="settings-preferredLocations" class="input input--multiselect" multiple size="6">' +
      "</select>" +
      '<span class="form-hint">Hold Ctrl/Cmd to select multiple.</span>' +
      "</div>" +
      '<div class="form-field">' +
      '<span class="form-label">Preferred mode</span>' +
      '<div class="checkbox-group">' +
      '<label class="checkbox-label"><input type="checkbox" name="settings-mode" value="Remote" /> Remote</label>' +
      '<label class="checkbox-label"><input type="checkbox" name="settings-mode" value="Hybrid" /> Hybrid</label>' +
      '<label class="checkbox-label"><input type="checkbox" name="settings-mode" value="Onsite" /> Onsite</label>' +
      "</div>" +
      "</div>" +
      '<div class="form-field">' +
      '<label class="form-label" for="settings-experienceLevel">Experience level</label>' +
      '<select id="settings-experienceLevel" class="input input--select">' +
      '<option value="">Any</option>' +
      '<option value="Fresher">Fresher</option>' +
      '<option value="0-1">0-1 years</option>' +
      '<option value="1-3">1-3 years</option>' +
      '<option value="3-5">3-5 years</option>' +
      "</select>" +
      "</div>" +
      '<div class="form-field">' +
      '<label class="form-label" for="settings-skills">Skills</label>' +
      '<input type="text" id="settings-skills" class="input" placeholder="e.g. Python, SQL, React (comma-separated)" />' +
      "</div>" +
      '<div class="form-field">' +
      '<label class="form-label" for="settings-minMatchScore">Minimum match score <span id="settings-minMatchScore-value">40</span></label>' +
      '<input type="range" id="settings-minMatchScore" class="input-range" min="0" max="100" value="40" />' +
      "</div>" +
      '<div class="form-actions">' +
      '<button type="button" id="settings-save" class="btn btn-primary">Save preferences</button>' +
      "</div>" +
      "</div>" +
      "</section>"
    );
  }

  /* ——— Dashboard ——— */
  function renderDashboard() {
    return (
      '<section class="context-header">' +
      '<h2 class="context-headline">Dashboard</h2>' +
      '<p class="context-subtext">Your matched jobs at a glance.</p>' +
      "</section>" +
      '<section class="page-content">' +
      '<div id="dashboard-prefs-banner" class="prefs-banner" hidden>Set your preferences to activate intelligent matching.</div>' +
      '<div class="filter-bar">' +
      '<input type="text" id="filter-keyword" class="input filter-bar__input" placeholder="Search title or company" />' +
      '<select id="filter-location" class="input input--select filter-bar__select"><option value="">Location</option></select>' +
      '<select id="filter-mode" class="input input--select filter-bar__select"><option value="">Mode</option><option value="Remote">Remote</option><option value="Hybrid">Hybrid</option><option value="Onsite">Onsite</option></select>' +
      '<select id="filter-experience" class="input input--select filter-bar__select"><option value="">Experience</option><option value="Fresher">Fresher</option><option value="0-1">0-1</option><option value="1-3">1-3</option><option value="3-5">3-5</option></select>' +
      '<select id="filter-source" class="input input--select filter-bar__select"><option value="">Source</option><option value="LinkedIn">LinkedIn</option><option value="Naukri">Naukri</option><option value="Indeed">Indeed</option></select>' +
      '<select id="filter-status" class="input input--select filter-bar__select"><option value="">All</option><option value="Not Applied">Not Applied</option><option value="Applied">Applied</option><option value="Rejected">Rejected</option><option value="Selected">Selected</option></select>' +
      '<select id="filter-sort" class="input input--select filter-bar__select"><option value="latest">Latest</option><option value="oldest">Oldest</option><option value="match">Match Score</option><option value="salary">Salary</option></select>' +
      "</div>" +
      '<div class="dashboard-toggle-wrap">' +
      '<label class="toggle-label">' +
      '<input type="checkbox" id="filter-only-matches" class="toggle-input" />' +
      '<span class="toggle-text">Show only jobs above my threshold</span>' +
      "</label>" +
      "</div>" +
      '<div id="job-cards-container" class="job-cards"></div>' +
      '<div id="job-cards-empty" class="job-cards-empty" hidden>No jobs match your search.</div>' +
      "</section>"
    );
  }

  /* ——— Saved ——— */
  function renderSaved() {
    return (
      '<section class="context-header">' +
      '<h2 class="context-headline">Saved</h2>' +
      '<p class="context-subtext">Jobs you’ve saved for later.</p>' +
      "</section>" +
      '<section class="page-content">' +
      '<div id="saved-jobs-container" class="job-cards"></div>' +
      '<div id="saved-empty-state" class="empty-state" hidden>' +
      '<h3 class="empty-state__title">Nothing saved yet</h3>' +
      '<p class="empty-state__message">When you save jobs from the dashboard, they will appear here.</p>' +
      "</div>" +
      "</section>"
    );
  }

  /* ——— Digest ——— */
  function renderDigest() {
    return (
      '<section class="context-header">' +
      '<h2 class="context-headline">Digest</h2>' +
      '<p class="context-subtext">Your daily summary.</p>' +
      "</section>" +
      '<section class="page-content digest-page">' +
      '<div id="digest-no-prefs" class="digest-block digest-block--no-prefs" hidden>Set preferences to generate a personalized digest.</div>' +
      '<div id="digest-status-updates-wrap" class="digest-status-updates"></div>' +
      '<div id="digest-actions-top">' +
      '<p class="digest-note">Demo Mode: Daily 9AM trigger simulated manually.</p>' +
      '<button type="button" id="digest-generate-btn" class="btn btn-primary">Generate Today\'s 9AM Digest (Simulated)</button>' +
      "</div>" +
      '<div id="digest-card-wrap"></div>' +
      '<div id="digest-no-matches" class="digest-block digest-block--no-matches" hidden>No matching roles today. Check again tomorrow.</div>' +
      '<div id="digest-actions-bottom" class="digest-actions-bottom" hidden>' +
      '<button type="button" id="digest-copy-btn" class="btn btn-secondary">Copy Digest to Clipboard</button>' +
      '<a id="digest-email-btn" href="#" class="btn btn-secondary">Create Email Draft</a>' +
      "</div>" +
      "</section>"
    );
  }

  /* ——— Proof ——— */
  function renderProof() {
    return (
      '<section class="context-header">' +
      '<h2 class="context-headline">Proof</h2>' +
      '<p class="context-subtext">Placeholder for artifact collection. No logic yet.</p>' +
      "</section>"
    );
  }

  /* ——— Test checklist (/jt/07-test) ——— */
  function renderTest() {
    return (
      '<section class="context-header">' +
      '<h2 class="context-headline">Test Checklist</h2>' +
      '<p class="context-subtext">Verify all items before shipping.</p>' +
      "</section>" +
      '<section class="page-content">' +
      '<div class="test-summary" id="test-summary">Tests Passed: 0 / 10</div>' +
      '<div id="test-warning" class="test-warning" hidden>Resolve all issues before shipping.</div>' +
      '<div class="test-checklist card">' +
      '<ul id="test-checklist-list" class="test-checklist__list"></ul>' +
      '<button type="button" id="test-reset-btn" class="btn btn-secondary">Reset Test Status</button>' +
      "</div>" +
      "</section>"
    );
  }

  /* ——— Ship (/jt/08-ship) ——— */
  function renderShip() {
    return (
      '<section class="context-header">' +
      '<h2 class="context-headline">Ship</h2>' +
      '<p class="context-subtext">Final gate before shipping.</p>' +
      "</section>" +
      '<section class="page-content">' +
      '<div id="ship-content"></div>' +
      "</section>"
    );
  }

  /* ——— 404 ——— */
  function render404() {
    return (
      '<section class="context-header">' +
      '<h2 class="context-headline">Page Not Found</h2>' +
      '<p class="context-subtext">The page you are looking for does not exist.</p>' +
      "</section>"
    );
  }

  var routeHandlers = {
    "/": { title: "Home", render: renderLanding },
    "/dashboard": { title: "Dashboard", render: renderDashboard },
    "/settings": { title: "Settings", render: renderSettings },
    "/saved": { title: "Saved", render: renderSaved },
    "/digest": { title: "Digest", render: renderDigest },
    "/proof": { title: "Proof", render: renderProof },
    "/jt/07-test": { title: "Test Checklist", render: renderTest },
    "/jt/08-ship": { title: "Ship", render: renderShip }
  };

  function render(path) {
    var normalized = path.replace(/\/$/, "") || "/";
    var app = document.getElementById("app");
    if (!app) return;

    var route = routeHandlers[normalized];
    if (route) {
      app.innerHTML = route.render();
      updateDocumentTitle(route.title);
    } else {
      app.innerHTML = render404();
      updateDocumentTitle("Page Not Found");
    }

    setActiveNav(normalized);
    closeMobileNav();

    if (normalized === "/dashboard" && window.initDashboard) window.initDashboard();
    if (normalized === "/saved" && window.initSaved) window.initSaved();
    if (normalized === "/settings" && window.initSettings) window.initSettings();
    if (normalized === "/digest" && window.initDigest) window.initDigest();
    if (normalized === "/jt/07-test" && window.initTestPage) window.initTestPage();
    if (normalized === "/jt/08-ship" && window.initShipPage) window.initShipPage();
  }

  function handleClick(e) {
    var a = e.target.closest("a[data-path]");
    if (!a) return;
    var path = a.getAttribute("data-path");
    var current = getPath();
    if (path === current) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    window.history.pushState({ path: path }, "", path === "/" ? "/" : path);
    render(path);
  }

  function handlePopState() {
    render(getPath());
  }

  function init() {
    var app = document.getElementById("app");
    if (!app) return;

    render(getPath());

    document.addEventListener("click", handleClick);
    window.addEventListener("popstate", handlePopState);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
