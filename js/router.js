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
      '<p class="context-subtext">Configure your job preferences. (Placeholder — no logic yet.)</p>' +
      '</section>' +
      '<section class="page-content">' +
      '<div class="card settings-card">' +
      '<div class="form-field">' +
      '<label class="form-label" for="settings-role">Role keywords</label>' +
      '<input type="text" id="settings-role" class="input" placeholder="e.g. Product Manager, Frontend" />' +
      "</div>" +
      '<div class="form-field">' +
      '<label class="form-label" for="settings-locations">Preferred locations</label>' +
      '<input type="text" id="settings-locations" class="input" placeholder="e.g. San Francisco, Remote" />' +
      "</div>" +
      '<div class="form-field">' +
      '<label class="form-label" for="settings-mode">Mode</label>' +
      '<select id="settings-mode" class="input input--select">' +
      '<option value="">Select…</option>' +
      '<option value="remote">Remote</option>' +
      '<option value="hybrid">Hybrid</option>' +
      '<option value="onsite">Onsite</option>' +
      "</select>" +
      "</div>" +
      '<div class="form-field">' +
      '<label class="form-label" for="settings-experience">Experience level</label>' +
      '<select id="settings-experience" class="input input--select">' +
      '<option value="">Select…</option>' +
      '<option value="entry">Entry</option>' +
      '<option value="mid">Mid</option>' +
      '<option value="senior">Senior</option>' +
      '<option value="lead">Lead</option>' +
      "</select>" +
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
      '<div class="filter-bar">' +
      '<input type="text" id="filter-keyword" class="input filter-bar__input" placeholder="Search title or company" />' +
      '<select id="filter-location" class="input input--select filter-bar__select"><option value="">Location</option></select>' +
      '<select id="filter-mode" class="input input--select filter-bar__select"><option value="">Mode</option><option value="Remote">Remote</option><option value="Hybrid">Hybrid</option><option value="Onsite">Onsite</option></select>' +
      '<select id="filter-experience" class="input input--select filter-bar__select"><option value="">Experience</option><option value="Fresher">Fresher</option><option value="0-1">0-1</option><option value="1-3">1-3</option><option value="3-5">3-5</option></select>' +
      '<select id="filter-source" class="input input--select filter-bar__select"><option value="">Source</option><option value="LinkedIn">LinkedIn</option><option value="Naukri">Naukri</option><option value="Indeed">Indeed</option></select>' +
      '<select id="filter-sort" class="input input--select filter-bar__select"><option value="latest">Latest</option><option value="oldest">Oldest</option></select>' +
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
      '<section class="page-content">' +
      '<div class="empty-state">' +
      '<h3 class="empty-state__title">Daily digest coming soon</h3>' +
      '<p class="empty-state__message">You’ll receive a daily summary of matched jobs at 9AM. This feature will be built in a later step.</p>' +
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
    "/proof": { title: "Proof", render: renderProof }
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
