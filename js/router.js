/**
 * Job Notification App — Client-side router
 * History API, no full page reloads. Active link does not navigate.
 */

(function () {
  var PLACEHOLDER_SUBTEXT = "This section will be built in the next step.";

  var routes = {
    "/": { title: "Home", heading: "Home" },
    "/dashboard": { title: "Dashboard", heading: "Dashboard" },
    "/settings": { title: "Settings", heading: "Settings" },
    "/saved": { title: "Saved", heading: "Saved" },
    "/digest": { title: "Digest", heading: "Digest" },
    "/proof": { title: "Proof", heading: "Proof" }
  };

  function getPath() {
    return window.location.pathname.replace(/\/$/, "") || "/";
  }

  function renderPlaceholder(data) {
    return (
      '<section class="context-header">' +
      '<h2 class="context-headline">' + escapeHtml(data.heading) + "</h2>" +
      '<p class="context-subtext">' + escapeHtml(PLACEHOLDER_SUBTEXT) + "</p>" +
      "</section>"
    );
  }

  function render404() {
    return (
      '<section class="context-header">' +
      '<h2 class="context-headline">Page Not Found</h2>' +
      '<p class="context-subtext">The page you are looking for does not exist.</p>' +
      "</section>"
    );
  }

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function updateDocumentTitle(title) {
    document.title = title ? title + " — Job Notification App" : "Job Notification App";
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

  function render(path) {
    var normalized = path.replace(/\/$/, "") || "/";
    var data = routes[normalized];
    var app = document.getElementById("app");
    if (!app) return;

    if (data) {
      app.innerHTML = renderPlaceholder(data);
      updateDocumentTitle(data.title);
    } else {
      app.innerHTML = render404();
      updateDocumentTitle("Page Not Found");
    }

    setActiveNav(normalized);
    closeMobileNav();
  }

  function handleClick(e) {
    var a = e.target.closest('a[data-path]');
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
