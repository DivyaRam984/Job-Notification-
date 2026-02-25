/**
 * Job Notification Tracker — Daily Digest: generate, store, render, copy, email draft
 */
window.initDigest = function () {
  var DIGEST_PREFIX = "jobTrackerDigest_";
  var jobs = window.JOBS || [];
  var Prefs = window.JobTrackerPreferences;
  var Status = window.JobTrackerStatus;
  var noPrefsEl = document.getElementById("digest-no-prefs");
  var updatesWrapEl = document.getElementById("digest-status-updates-wrap");
  var actionsTopEl = document.getElementById("digest-actions-top");
  var cardWrapEl = document.getElementById("digest-card-wrap");
  var noMatchesEl = document.getElementById("digest-no-matches");
  var actionsBottomEl = document.getElementById("digest-actions-bottom");

  function getTodayKey() {
    var d = new Date();
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }

  function getStoredDigest(key) {
    try {
      var raw = localStorage.getItem(DIGEST_PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setStoredDigest(key, data) {
    try {
      localStorage.setItem(DIGEST_PREFIX + key, JSON.stringify(data));
    } catch (e) {}
  }

  function computeMatchScore(job, prefs) {
    if (!prefs) return 0;
    var score = 0;
    var roleKeywords = (prefs.roleKeywords || "").split(",").map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean);
    var titleLower = (job.title || "").toLowerCase();
    var descLower = (job.description || "").toLowerCase();

    if (roleKeywords.length) {
      for (var i = 0; i < roleKeywords.length; i++) {
        if (titleLower.indexOf(roleKeywords[i]) !== -1) { score += 25; break; }
      }
    }
    if (roleKeywords.length) {
      for (var j = 0; j < roleKeywords.length; j++) {
        if (descLower.indexOf(roleKeywords[j]) !== -1) { score += 15; break; }
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
            score += 15; k = job.skills.length; break;
          }
        }
      }
    }
    if (typeof job.postedDaysAgo === "number" && job.postedDaysAgo <= 2) score += 5;
    if (job.source === "LinkedIn") score += 5;
    return Math.min(100, score);
  }

  function generateDigest() {
    var prefs = Prefs ? Prefs.get() : null;
    var list = jobs.map(function (j) {
      var copy = Object.assign({}, j);
      copy._score = computeMatchScore(j, prefs);
      return copy;
    });
    list.sort(function (a, b) {
      var diff = (b._score || 0) - (a._score || 0);
      if (diff !== 0) return diff;
      return (a.postedDaysAgo || 0) - (b.postedDaysAgo || 0);
    });
    return list.slice(0, 10);
  }

  function formatDateForKey(key) {
    var parts = key.split("-");
    if (parts.length !== 3) return key;
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var m = parseInt(parts[1], 10) - 1;
    var day = parseInt(parts[2], 10);
    var year = parts[0];
    return months[m] + " " + day + ", " + year;
  }

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function formatUpdateDate(iso) {
    if (!iso) return "";
    try {
      var d = new Date(iso);
      var m = d.getMonth() + 1;
      var day = d.getDate();
      var y = d.getFullYear();
      return m + "/" + day + "/" + y;
    } catch (e) {
      return iso;
    }
  }

  function renderStatusUpdates() {
    if (!updatesWrapEl || !Status) return;
    var list = Status.getUpdates();
    if (!list.length) {
      updatesWrapEl.innerHTML = "";
      updatesWrapEl.hidden = true;
      return;
    }
    updatesWrapEl.hidden = false;
    var html = '<h3 class="digest-updates__title">Recent Status Updates</h3><ul class="digest-updates__list">';
    list.forEach(function (u) {
      html +=
        "<li class=\"digest-updates__item\">" +
        "<span class=\"digest-updates__job\">" + escapeHtml(u.title || "") + " at " + escapeHtml(u.company || "") + "</span>" +
        " <span class=\"digest-updates__status digest-updates__status--" + (u.status || "").replace(/\s+/g, "-").toLowerCase() + "\">" + escapeHtml(u.status || "") + "</span>" +
        " <span class=\"digest-updates__date\">" + escapeHtml(formatUpdateDate(u.dateChanged)) + "</span>" +
        "</li>";
    });
    html += "</ul>";
    updatesWrapEl.innerHTML = html;
  }

  function digestToPlainText(list, dateLabel) {
    var lines = ["Top 10 Jobs For You — 9AM Digest", dateLabel, ""];
    list.forEach(function (j, idx) {
      lines.push((idx + 1) + ". " + (j.title || "") + " at " + (j.company || ""));
      lines.push("   Location: " + (j.location || "") + " | Experience: " + (j.experience || "") + " | Match: " + (j._score != null ? j._score : 0));
      lines.push("   Apply: " + (j.applyUrl || ""));
      lines.push("");
    });
    lines.push("This digest was generated based on your preferences.");
    return lines.join("\n");
  }

  function renderDigestCard(list, dateKey) {
    var dateLabel = formatDateForKey(dateKey);
    var html =
      '<div class="digest-card">' +
      '<h2 class="digest-card__title">Top 10 Jobs For You — 9AM Digest</h2>' +
      '<p class="digest-card__date">' + escapeHtml(dateLabel) + "</p>" +
      '<ol class="digest-card__list">';
    list.forEach(function (j) {
      html +=
        '<li class="digest-card__item">' +
        '<div class="digest-card__item-header">' +
        '<span class="digest-card__item-title">' + escapeHtml(j.title || "") + "</span>" +
        '<span class="digest-card__item-score">' + (j._score != null ? j._score : 0) + "</span>" +
        "</div>" +
        '<p class="digest-card__item-meta">' + escapeHtml(j.company || "") + " · " + escapeHtml(j.location || "") + " · " + escapeHtml(j.experience || "") + "</p>" +
        '<a href="' + escapeHtml(j.applyUrl || "#") + '" class="btn btn-primary digest-card__apply" target="_blank" rel="noopener">Apply</a>' +
        "</li>";
    });
    html +=
      "</ol>" +
      '<p class="digest-card__footer">This digest was generated based on your preferences.</p>' +
      "</div>";
    cardWrapEl.innerHTML = html;
  }

  function showState(hasPrefs, digestList) {
    if (!hasPrefs) {
      if (noPrefsEl) noPrefsEl.hidden = false;
      if (actionsTopEl) actionsTopEl.hidden = true;
      cardWrapEl.innerHTML = "";
      if (noMatchesEl) noMatchesEl.hidden = true;
      if (actionsBottomEl) actionsBottomEl.hidden = true;
      return;
    }
    if (noPrefsEl) noPrefsEl.hidden = true;
    if (actionsTopEl) actionsTopEl.hidden = false;

    if (!digestList || digestList.length === 0) {
      cardWrapEl.innerHTML = "";
      if (noMatchesEl) noMatchesEl.hidden = false;
      if (actionsBottomEl) actionsBottomEl.hidden = true;
      return;
    }
    if (noMatchesEl) noMatchesEl.hidden = true;
    if (actionsBottomEl) actionsBottomEl.hidden = false;
  }

  function doGenerate() {
    var hasPrefs = Prefs && Prefs.hasStored();
    if (!hasPrefs) {
      showState(false);
      return;
    }
    var dateKey = getTodayKey();
    var existing = getStoredDigest(dateKey);
    var list;
    if (existing && Array.isArray(existing) && existing.length > 0) {
      list = existing;
    } else {
      list = generateDigest();
      setStoredDigest(dateKey, list);
    }
    if (list.length === 0) {
      showState(true, []);
      return;
    }
    showState(true, list);
    renderDigestCard(list, dateKey);
    attachCopyAndEmail(list, dateKey);
  }

  function attachCopyAndEmail(list, dateKey) {
    var dateLabel = formatDateForKey(dateKey);
    var copyBtn = document.getElementById("digest-copy-btn");
    var emailBtn = document.getElementById("digest-email-btn");
    if (copyBtn) {
      copyBtn.onclick = function () {
        var text = digestToPlainText(list, dateLabel);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () { copyBtn.textContent = "Copied"; setTimeout(function () { copyBtn.textContent = "Copy Digest to Clipboard"; }, 2000); });
        } else {
          copyBtn.textContent = "Copied";
          setTimeout(function () { copyBtn.textContent = "Copy Digest to Clipboard"; }, 2000);
        }
      };
    }
    if (emailBtn) {
      var subject = "My 9AM Job Digest";
      var body = digestToPlainText(list, dateLabel);
      emailBtn.href = "mailto:?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      emailBtn.setAttribute("target", "_blank");
      emailBtn.setAttribute("rel", "noopener");
    }
  }

  function run() {
    var hasPrefs = Prefs && Prefs.hasStored();
    if (!hasPrefs) {
      showState(false);
      return;
    }
    var dateKey = getTodayKey();
    var existing = getStoredDigest(dateKey);
    if (existing && Array.isArray(existing) && existing.length > 0) {
      showState(true, existing);
      renderDigestCard(existing, dateKey);
      attachCopyAndEmail(existing, dateKey);
    } else {
      showState(true, null);
      cardWrapEl.innerHTML = "";
    }
    var genBtn = document.getElementById("digest-generate-btn");
    if (genBtn) {
      genBtn.onclick = doGenerate;
    }
    renderStatusUpdates();
  }

  run();
};
