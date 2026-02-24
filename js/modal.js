/**
 * Job Notification Tracker — Job detail modal (description + skills)
 */
(function () {
  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function getModal() {
    var el = document.getElementById("job-modal");
    if (el) return el;
    el = document.createElement("div");
    el.id = "job-modal";
    el.className = "modal";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML =
      '<div class="modal__backdrop" aria-hidden="true"></div>' +
      '<div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="job-modal-title">' +
      '<div class="modal__header">' +
      '<h2 id="job-modal-title" class="modal__title"></h2>' +
      '<button type="button" class="modal__close" aria-label="Close">&times;</button>' +
      "</div>" +
      '<div class="modal__body">' +
      '<p class="modal__company"></p>' +
      '<div class="modal__description"></div>' +
      '<div class="modal__skills-wrap">' +
      '<h3 class="modal__skills-heading">Skills</h3>' +
      '<div class="modal__skills"></div>' +
      "</div>" +
      "</div>" +
      "</div>";
    document.body.appendChild(el);

    el.querySelector(".modal__backdrop").addEventListener("click", close);
    el.querySelector(".modal__close").addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && el.getAttribute("aria-hidden") !== "true") close();
    });
    return el;
  }

  function close() {
    var el = document.getElementById("job-modal");
    if (el) {
      el.setAttribute("aria-hidden", "true");
      el.classList.remove("modal--open");
    }
  }

  function open(job) {
    var el = getModal();
    if (!job) return;
    el.querySelector(".modal__title").textContent = job.title || "";
    el.querySelector(".modal__company").textContent = job.company || "";
    el.querySelector(".modal__description").innerHTML = "<p>" + escapeHtml((job.description || "").replace(/\n/g, "</p><p>")) + "</p>";
    var skillsWrap = el.querySelector(".modal__skills-wrap");
    var skillsEl = el.querySelector(".modal__skills");
    if (job.skills && job.skills.length) {
      skillsEl.innerHTML = job.skills.map(function (s) { return '<span class="modal__skill-tag">' + escapeHtml(s) + "</span>"; }).join(" ");
      if (skillsWrap) skillsWrap.style.display = "";
    } else {
      skillsEl.innerHTML = "";
      if (skillsWrap) skillsWrap.style.display = "none";
    }
    el.setAttribute("aria-hidden", "false");
    el.classList.add("modal--open");
    el.querySelector(".modal__close").focus();
  }

  window.openJobModal = open;
  window.closeJobModal = close;
})();
