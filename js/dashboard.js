/**
 * Job Notification Tracker — Dashboard: filter bar, match score, job cards, View/Save/Apply
 */
window.initDashboard = function () {
  var STORAGE_KEY = "jobTrackerSavedIds";
  var jobs = window.JOBS || [];
  var Prefs = window.JobTrackerPreferences;
  var Status = window.JobTrackerStatus;
  var container = document.getElementById("job-cards-container");
  var emptyEl = document.getElementById("job-cards-empty");
  var bannerEl = document.getElementById("dashboard-prefs-banner");
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

  /**
   * Match score (deterministic). Cap at 100.
   * +25 roleKeyword in title, +15 in description, +15 location, +10 mode, +10 experience,
   * +15 skills overlap, +5 postedDaysAgo<=2, +5 source LinkedIn.
   */
  function computeMatchScore(job, prefs) {
    if (!prefs) return 0;
    var score = 0;
    var roleKeywords = (prefs.roleKeywords || "").split(",").map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean);
    var titleLower = (job.title || "").toLowerCase();
    var descLower = (job.description || "").toLowerCase();

    if (roleKeywords.length) {
      for (var i = 0; i < roleKeywords.length; i++) {
        if (titleLower.indexOf(roleKeywords[i]) !== -1) {
          score += 25;
          break;
        }
      }
    }
    if (roleKeywords.length) {
      for (var j = 0; j < roleKeywords.length; j++) {
        if (descLower.indexOf(roleKeywords[j]) !== -1) {
          score += 15;
          break;
        }
      }
    }
    if (Array.isArray(prefs.preferredLocations) && prefs.preferredLocations.length && job.location) {
      if (prefs.preferredLocations.indexOf(job.location) !== -1) score += 15;
    }
    if (Array.isArray(prefs.preferredMode) && prefs.preferredMode.length && job.mode) {
      if (prefs.preferredMode.indexOf(job.mode) !== -1) score += 10;
    }
    if (prefs.experienceLevel && job.experience === prefs.experienceLevel) score += 10;
    var userSkills = (prefs.skills || "").split(",").map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean);
    if (userSkills.length && Array.isArray(job.skills)) {
      for (var k = 0; k < job.skills.length; k++) {
        var js = String(job.skills[k]).toLowerCase();
        for (var u = 0; u < userSkills.length; u++) {
          if (js.indexOf(userSkills[u]) !== -1 || userSkills[u].indexOf(js) !== -1) {
            score += 15;
            k = job.skills.length;
            break;
          }
        }
      }
    }
    if (typeof job.postedDaysAgo === "number" && job.postedDaysAgo <= 2) score += 5;
    if (job.source === "LinkedIn") score += 5;

    return Math.min(100, score);
  }

  function scoreBadgeClass(score) {
    if (score >= 80) return "score-badge--high";
    if (score >= 60) return "score-badge--medium";
    if (score >= 40) return "score-badge--neutral";
    return "score-badge--low";
  }

  function extractSalaryNumber(salaryRange) {
    if (!salaryRange || typeof salaryRange !== "string") return 0;
    var m = salaryRange.match(/(\d+)\s*k/i);
    if (m) return parseInt(m[1], 10);
    m = salaryRange.match(/(\d+)\s*[–\-]\s*(\d+)/);
    if (m) return parseInt(m[1], 10);
    m = salaryRange.match(/(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
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
    var onlyMatchesEl = document.getElementById("filter-only-matches");
    return {
      keyword: (document.getElementById("filter-keyword") && document.getElementById("filter-keyword").value) || "",
      location: (document.getElementById("filter-location") && document.getElementById("filter-location").value) || "",
      mode: (document.getElementById("filter-mode") && document.getElementById("filter-mode").value) || "",
      experience: (document.getElementById("filter-experience") && document.getElementById("filter-experience").value) || "",
      source: (document.getElementById("filter-source") && document.getElementById("filter-source").value) || "",
      status: (document.getElementById("filter-status") && document.getElementById("filter-status").value) || "",
      sort: (document.getElementById("filter-sort") && document.getElementById("filter-sort").value) || "latest",
      onlyMatches: onlyMatchesEl ? onlyMatchesEl.checked : false
    };
  }

  function getJobStatus(jobId) {
    return Status && Status.get(jobId) || "Not Applied";
  }

  function filterAndSortJobs() {
    var f = getFilterState();
    var prefs = Prefs ? Prefs.get() : null;
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

    list = list.map(function (j) {
      var copy = Object.assign({}, j);
      copy._score = computeMatchScore(j, prefs);
      return copy;
    });

    if (f.onlyMatches && prefs) {
      var threshold = typeof prefs.minMatchScore === "number" ? prefs.minMatchScore : 40;
      list = list.filter(function (j) { return j._score >= threshold; });
    }
    if (f.status) {
      list = list.filter(function (j) { return getJobStatus(j.id) === f.status; });
    }

    var sort = f.sort || "latest";
    list = list.slice().sort(function (a, b) {
      if (sort === "match") return (b._score || 0) - (a._score || 0);
      if (sort === "salary") {
        var an = extractSalaryNumber(a.salaryRange);
        var bn = extractSalaryNumber(b.salaryRange);
        return bn - an;
      }
      var aDays = typeof a.postedDaysAgo === "number" ? a.postedDaysAgo : 0;
      var bDays = typeof b.postedDaysAgo === "number" ? b.postedDaysAgo : 0;
      return sort === "oldest" ? bDays - aDays : aDays - bDays;
    });
    return list;
  }

  function postedLabel(days) {
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    return days + " days ago";
  }

  function updateBanner() {
    if (!bannerEl) return;
    bannerEl.hidden = Prefs && Prefs.hasStored();
  }

  function renderCards(list) {
    var savedIds = getSavedIds();
    if (list.length === 0) {
      container.innerHTML = "";
      if (emptyEl) {
        emptyEl.hidden = false;
        emptyEl.textContent = "No roles match your criteria. Adjust filters or lower threshold.";
      }
      return;
    }
    if (emptyEl) emptyEl.hidden = true;
    var html = "";
    list.forEach(function (j) {
      var saved = savedIds.indexOf(j.id) !== -1;
      var score = j._score != null ? j._score : 0;
      var scoreClass = scoreBadgeClass(score);
      var jobStatus = getJobStatus(j.id);
      var statusClass = "status-select--" + jobStatus.replace(/\s+/g, "-").toLowerCase();
      html +=
        '<article class="job-card card" data-job-id="' + escapeHtml(j.id) + '">' +
        '<div class="job-card__header">' +
        '<div class="job-card__header-text">' +
        '<h3 class="job-card__title">' + escapeHtml(j.title) + "</h3>" +
        '<span class="job-card__company">' + escapeHtml(j.company) + "</span>" +
        "</div>" +
        '<span class="score-badge ' + scoreClass + '" aria-label="Match score ' + score + '">' + score + "</span>" +
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
        '<div class="job-card__status">' +
        '<label class="job-card__status-label">Status</label>' +
        '<select class="status-select ' + statusClass + '" data-job-id="' + escapeHtml(j.id) + '" data-action="status">' +
        '<option value="Not Applied"' + (jobStatus === "Not Applied" ? " selected" : "") + '>Not Applied</option>' +
        '<option value="Applied"' + (jobStatus === "Applied" ? " selected" : "") + '>Applied</option>' +
        '<option value="Rejected"' + (jobStatus === "Rejected" ? " selected" : "") + '>Rejected</option>' +
        '<option value="Selected"' + (jobStatus === "Selected" ? " selected" : "") + '>Selected</option>' +
        "</select>" +
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
    container.querySelectorAll("select[data-action=status]").forEach(function (sel) {
      sel.addEventListener("change", function () {
        var id = sel.getAttribute("data-job-id");
        var status = sel.value;
        if (!id || !Status) return;
        var job = jobs.filter(function (j) { return j.id === id; })[0];
        Status.set(id, status);
        Status.pushUpdate(id, job ? job.title : "", job ? job.company : "", status);
        if (window.showStatusToast) window.showStatusToast(status);
        sel.className = "status-select status-select--" + status.replace(/\s+/g, "-").toLowerCase();
      });
    });
  }

  function onFilterChange() {
    updateBanner();
    renderCards(filterAndSortJobs());
  }

  fillLocationDropdown();
  updateBanner();
  renderCards(filterAndSortJobs());

  ["filter-location", "filter-mode", "filter-experience", "filter-source", "filter-status", "filter-sort"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("change", onFilterChange);
  });
  var keywordEl = document.getElementById("filter-keyword");
  if (keywordEl) keywordEl.addEventListener("input", onFilterChange);
  var onlyMatchesEl = document.getElementById("filter-only-matches");
  if (onlyMatchesEl) onlyMatchesEl.addEventListener("change", onFilterChange);
};
// ===== Slider Color Logic =====
const minMatchInput = document.getElementById("min-match");

function updateSliderColor(value) {
  let color;

  if (value >= 80) {
    color = "#22c55e"; // green
  } else if (value >= 60) {
    color = "#f59e0b"; // amber
  } else if (value >= 40) {
    color = "#6b7280"; // neutral
  } else {
    color = "#9ca3af"; // grey
  }

  minMatchInput.style.background =
    `linear-gradient(to right, ${color} ${value}%, #e5e7eb ${value}%)`;

  document.documentElement.style.setProperty('--slider-color', color);
}

if (minMatchInput) {
  minMatchInput.addEventListener("input", function () {
    updateSliderColor(this.value);
  });

  updateSliderColor(minMatchInput.value);
}
