/**
 * Job Notification Tracker — Test checklist page (/jt/07-test) and Ship page (/jt/08-ship)
 */
window.JobTrackerTestItems = [
  { key: "preferences-persist", label: "Preferences persist after refresh", tip: "Save on Settings, refresh, confirm form is prefilled." },
  { key: "match-score", label: "Match score calculates correctly", tip: "Set preferences, check dashboard badges match expected bands (80+ green, etc.)." },
  { key: "show-only-matches", label: "\"Show only matches\" toggle works", tip: "Enable toggle on Dashboard; list should filter by min score." },
  { key: "save-job-persist", label: "Save job persists after refresh", tip: "Save a job on Dashboard, refresh; it should appear on Saved." },
  { key: "apply-new-tab", label: "Apply opens in new tab", tip: "Click Apply on a job card; link opens in new tab." },
  { key: "status-update-persist", label: "Status update persists after refresh", tip: "Change status on a card, refresh; status should remain." },
  { key: "status-filter", label: "Status filter works correctly", tip: "Set status filter on Dashboard; only jobs with that status show." },
  { key: "digest-top-10", label: "Digest generates top 10 by score", tip: "Generate digest on Digest page; exactly 10 jobs, ordered by score." },
  { key: "digest-persists", label: "Digest persists for the day", tip: "Generate digest, refresh Digest page; same digest loads." },
  { key: "no-console-errors", label: "No console errors on main pages", tip: "Open Dashboard, Saved, Settings, Digest; check console for errors." }
];

window.initTestPage = function () {
  var TestStatus = window.JobTrackerTestStatus;
  var summaryEl = document.getElementById("test-summary");
  var warningEl = document.getElementById("test-warning");
  var listEl = document.getElementById("test-checklist-list");
  var resetBtn = document.getElementById("test-reset-btn");
  if (!listEl) return;

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function updateSummary() {
    var n = TestStatus ? TestStatus.getPassedCount() : 0;
    if (summaryEl) summaryEl.textContent = "Tests Passed: " + n + " / 10";
    if (warningEl) warningEl.hidden = n >= 10;
  }

  function renderList() {
    var items = window.JobTrackerTestItems || [];
    var html = "";
    items.forEach(function (item) {
      var checked = TestStatus && TestStatus.get(item.key);
      html +=
        "<li class=\"test-checklist__item\">" +
        "<label class=\"test-checklist__label\">" +
        "<input type=\"checkbox\" class=\"test-checklist__input\" data-test-key=\"" + escapeHtml(item.key) + "\"" + (checked ? " checked" : "") + " />" +
        "<span class=\"test-checklist__text\">" + escapeHtml(item.label) + "</span>" +
        (item.tip ? " <span class=\"test-checklist__tip\" title=\"" + escapeHtml(item.tip) + "\">How to test</span>" : "") +
        "</label>" +
        "</li>";
    });
    listEl.innerHTML = html;

    listEl.querySelectorAll(".test-checklist__input").forEach(function (cb) {
      cb.addEventListener("change", function () {
        var key = cb.getAttribute("data-test-key");
        if (TestStatus && key) TestStatus.set(key, cb.checked);
        updateSummary();
      });
    });
  }

  updateSummary();
  renderList();

  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      if (TestStatus) TestStatus.reset();
      renderList();
      updateSummary();
    });
  }
};

window.initShipPage = function () {
  var TestStatus = window.JobTrackerTestStatus;
  var contentEl = document.getElementById("ship-content");
  if (!contentEl) return;

  var allPassed = TestStatus && TestStatus.allPassed();
  if (allPassed) {
    contentEl.innerHTML =
      "<div class=\"ship-unlocked card\">" +
      "<h3 class=\"ship-unlocked__title\">All tests passed</h3>" +
      "<p class=\"ship-unlocked__text\">You may proceed to ship.</p>" +
      "</div>";
  } else {
    contentEl.innerHTML =
      "<div class=\"ship-locked card\">" +
      "<h3 class=\"ship-locked__title\">Complete all tests before shipping.</h3>" +
      "<p class=\"ship-locked__text\">Go to <a href=\"/jt/07-test\" data-path=\"/jt/07-test\" class=\"ship-locked__link\">Test Checklist</a> and check all 10 items.</p>" +
      "</div>";
  }
};
