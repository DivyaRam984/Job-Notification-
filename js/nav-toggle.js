/**
 * Job Notification App — Mobile nav toggle
 * Opens/closes hamburger menu. Same design rules (no animation noise).
 */

(function () {
  function init() {
    var toggle = document.getElementById("nav-toggle");
    var nav = document.getElementById("nav-links");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    document.addEventListener("click", function (e) {
      if (nav.classList.contains("is-open") && !toggle.contains(e.target) && !nav.contains(e.target)) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
