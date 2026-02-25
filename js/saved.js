/**
 * Job Notification Tracker — Saved page: render from localStorage, premium empty state
 */
window.initSaved = function () {
  var STORAGE_KEY = "jobTrackerSavedIds";
  var jobs = window.JOBS || [];
  var Status = window.JobTrackerStatus;
  var container = document.getElementById("saved-jobs-container");
  var emptyState = document.getElementById("saved-empty-state");
  if (!container) return;

  function getJobStatus(jobId) {
    return Status && Status.get(jobId) || "Not Applied";
  }

  function getSavedIds() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function postedLabel(days) {
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    return (days || 0) + " days ago";
  }

  var savedIds = getSavedIds();
  var savedJobs = jobs.filter(function (j) { return savedIds.indexOf(j.id) !== -1; });

  if (savedJobs.length === 0) {
    container.innerHTML = "";
    if (emptyState) emptyState.hidden = false;
    return;
  }

  if (emptyState) emptyState.hidden = true;
  var html = "";
  savedJobs.forEach(function (j) {
    var jobStatus = getJobStatus(j.id);
    var statusClass = "status-select--" + jobStatus.replace(/\s+/g, "-").toLowerCase();
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
      '<a href="' + escapeHtml(j.applyUrl || "#") + '" class="btn btn-primary job-card__btn" target="_blank" rel="noopener">Apply</a>' +
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
};
