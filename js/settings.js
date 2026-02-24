/**
 * Job Notification Tracker — Settings: save/load preferences (jobTrackerPreferences)
 */
window.initSettings = function () {
  var Prefs = window.JobTrackerPreferences;
  var jobs = window.JOBS || [];
  if (!Prefs) return;

  function getEl(id) {
    return document.getElementById(id);
  }

  function fillLocationOptions() {
    var sel = getEl("settings-preferredLocations");
    if (!sel) return;
    var locations = [];
    jobs.forEach(function (j) {
      if (j.location && locations.indexOf(j.location) === -1) locations.push(j.location);
    });
    locations.sort();
    sel.innerHTML = "";
    locations.forEach(function (loc) {
      var opt = document.createElement("option");
      opt.value = loc;
      opt.textContent = loc;
      sel.appendChild(opt);
    });
  }

  function prefillForm() {
    var p = Prefs.get();
    var roleEl = getEl("settings-roleKeywords");
    if (roleEl) roleEl.value = p.roleKeywords || "";

    var locEl = getEl("settings-preferredLocations");
    if (locEl) {
      for (var i = 0; i < locEl.options.length; i++) {
        locEl.options[i].selected = p.preferredLocations.indexOf(locEl.options[i].value) !== -1;
      }
    }

    var modeChecks = document.querySelectorAll('input[name="settings-mode"]');
    modeChecks.forEach(function (cb) {
      cb.checked = p.preferredMode.indexOf(cb.value) !== -1;
    });

    var expEl = getEl("settings-experienceLevel");
    if (expEl) expEl.value = p.experienceLevel || "";

    var skillsEl = getEl("settings-skills");
    if (skillsEl) skillsEl.value = p.skills || "";

    var scoreEl = getEl("settings-minMatchScore");
    var scoreValEl = getEl("settings-minMatchScore-value");
    if (scoreEl) {
      scoreEl.value = String(p.minMatchScore);
      if (scoreValEl) scoreValEl.textContent = p.minMatchScore;
    }
  }

  function saveFromForm() {
    var roleEl = getEl("settings-roleKeywords");
    var locEl = getEl("settings-preferredLocations");
    var modeChecks = document.querySelectorAll('input[name="settings-mode"]:checked');
    var expEl = getEl("settings-experienceLevel");
    var skillsEl = getEl("settings-skills");
    var scoreEl = getEl("settings-minMatchScore");

    var preferredLocations = [];
    if (locEl) {
      for (var i = 0; i < locEl.options.length; i++) {
        if (locEl.options[i].selected) preferredLocations.push(locEl.options[i].value);
      }
    }
    var preferredMode = [];
    modeChecks.forEach(function (cb) {
      preferredMode.push(cb.value);
    });

    Prefs.set({
      roleKeywords: roleEl ? roleEl.value.trim() : "",
      preferredLocations: preferredLocations,
      preferredMode: preferredMode,
      experienceLevel: expEl ? expEl.value.trim() : "",
      skills: skillsEl ? skillsEl.value.trim() : "",
      minMatchScore: scoreEl ? Math.max(0, Math.min(100, parseInt(scoreEl.value, 10) || 40)) : 40
    });
  }

  fillLocationOptions();
  prefillForm();

  var scoreEl = getEl("settings-minMatchScore");
  var scoreValEl = getEl("settings-minMatchScore-value");
  if (scoreEl && scoreValEl) {
    scoreEl.addEventListener("input", function () {
      scoreValEl.textContent = scoreEl.value;
    });
  }

  var saveBtn = getEl("settings-save");
  if (saveBtn) {
    saveBtn.addEventListener("click", function () {
      saveFromForm();
    });
  }
};
