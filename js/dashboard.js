/**
 * Job Notification Tracker — Dashboard: filter bar, job cards, View/Save/Apply, modal
 */
window.initDashboard = function () {
  var STORAGE_KEY = "jobTrackerSavedIds";
  var jobs = window.JOBS || [];
  var container = document.getElementById("job-cards-container");
  var emptyEl = document.getElementById("job-cards-empty");
  if (!container) return;

  function getSavedIds() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function setSavedIds(ids) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch (e) {}
  }

  function toggleSaved(id) {
    var ids = getSavedIds();
    var i = ids.indexOf(id);
    if (i === -1) ids.push(id);
    else ids.splice(i, 1);
    setSavedIds(ids);
  }

  function isSaved(id) {
    return getSavedIds().indexOf(id) !== -1;
  }

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function fillLocationDropdown() {
    var sel = document.getElementById("filter-location");
    if (!sel) return;
    var locations = [];
    jobs.forEach(function (j) {
      if (j.location && locations.indexOf(j.location) === -1) locations.push(j.location);
    });
    locations.sort();
    locations.forEach(function (loc) {
      var opt = document.createElement("option");
      opt.value = loc;
      opt.textContent = loc;
      sel.appendChild(opt);
    });
  }

  function getFilterState() {
    return {
      keyword: (document.getElementById("filter-keyword") && document.getElementById("filter-keyword").value) || "",
      location: (document.getElementById("filter-location") && document.getElementById("filter-location").value) || "",
      mode: (document.getElementById("filter-mode") && document.getElementById("filter-mode").value) || "",
      experience: (document.getElementById("filter-experience") && document.getElementById("filter-experience").value) || "",
      source: (document.getElementById("filter-source") && document.getElementById("filter-source").value) || "",
      sort: (document.getElementById("filter-sort") && document.getElementById("filter-sort").value) || "latest"
    };
  }

  function filterAndSortJobs() {
    var f = getFilterState();
    var keyword = f.keyword.trim().toLowerCase();
    var list = jobs.filter(function (j) {
      if (keyword) {
        var match = (j.title && j.title.toLowerCase().indexOf(keyword) !== -1) ||
          (j.company && j.company.toLowerCase().indexOf(keyword) !== -1);
        if (!match) return false;
      }
      if (f.location && j.location !== f.location) return false;
      if (f.mode && j.mode !== f.mode) return false;
      if (f.experience && j.experience !== f.experience) return false;
      if (f.source && j.source !== f.source) return false;
      return true;
    });
    list = list.slice().sort(function (a, b) {
      var aDays = typeof a.postedDaysAgo === "number" ? a.postedDaysAgo : 0;
      var bDays = typeof b.postedDaysAgo === "number" ? b.postedDaysAgo : 0;
      return f.sort === "oldest" ? bDays - aDays : aDays - bDays;
    });
    return list;
  }

  function postedLabel(days) {
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    return days + " days ago";
  }

  function renderCards(list) {
    var savedIds = getSavedIds();
    if (list.length === 0) {
      container.innerHTML = "";
      if (emptyEl) {
        emptyEl.hidden = false;
        emptyEl.textContent = "No jobs match your search.";
      }
      return;
    }
    if (emptyEl) emptyEl.hidden = true;
    var html = "";
    list.forEach(function (j) {
      var saved = savedIds.indexOf(j.id) !== -1;
      html +=
        '<article class="job-card card" data-job-id="' + escapeHtml(j.id) + '">' +
        '<div class="job-card__header">' +
        '<h3 class="job-card__title">' + escapeHtml(j.title) + "</h3>" +
        '<span class="job-card__company">' + escapeHtml(j.company) + "</span>" +
        "</div>" +
        '<div class="job-card__meta">' +
        '<span class="job-card__location">' + escapeHtml(j.location) + " · " + escapeHtml(j.mode) + "</span>" +
        '<span class="job-card__experience">' + escapeHtml(j.experience) + "</span>" +
        "</div>" +
        '<div class="job-card__salary">' + escapeHtml(j.salaryRange || "") + "</div>" +
        '<div class="job-card__footer">' +
        '<span class="badge job-card__source">' + escapeHtml(j.source || "") + "</span>" +
        '<span class="job-card__posted">' + escapeHtml(postedLabel(j.postedDaysAgo)) + "</span>" +
        "</div>" +
        '<div class="job-card__actions">' +
        '<button type="button" class="btn btn-secondary job-card__btn" data-action="view">View</button>' +
        '<button type="button" class="btn btn-secondary job-card__btn" data-action="save" data-job-id="' + escapeHtml(j.id) + '">' + (saved ? "Saved" : "Save") + "</button>" +
        '<a href="' + escapeHtml(j.applyUrl || "#") + '" class="btn btn-primary job-card__btn" target="_blank" rel="noopener" data-action="apply">Apply</a>' +
        "</div>" +
        "</article>";
    });
    container.innerHTML = html;

    container.querySelectorAll("[data-action=view]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var card = btn.closest(".job-card");
        var id = card && card.getAttribute("data-job-id");
        var job = jobs.filter(function (j) { return j.id === id; })[0];
        if (job) window.openJobModal && window.openJobModal(job);
      });
    });
    container.querySelectorAll("[data-action=save]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-job-id");
        if (!id) return;
        toggleSaved(id);
        btn.textContent = isSaved(id) ? "Saved" : "Save";
      });
    });
  }

  function onFilterChange() {
    renderCards(filterAndSortJobs());
  }

  fillLocationDropdown();
  renderCards(filterAndSortJobs());

  ["filter-keyword", "filter-location", "filter-mode", "filter-experience", "filter-source", "filter-sort"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("change", onFilterChange);
  });
  var keywordEl = document.getElementById("filter-keyword");
  if (keywordEl) keywordEl.addEventListener("input", onFilterChange);
};
