/**
 * Job Notification Tracker — Test checklist state (localStorage: jobTrackerTestStatus)
 */
window.JobTrackerTestStatus = {
  STORAGE_KEY: "jobTrackerTestStatus",
  ITEM_KEYS: [
    "preferences-persist",
    "match-score",
    "show-only-matches",
    "save-job-persist",
    "apply-new-tab",
    "status-update-persist",
    "status-filter",
    "digest-top-10",
    "digest-persists",
    "no-console-errors"
  ],

  getMap: function () {
    try {
      var raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return {};
      var o = JSON.parse(raw);
      return typeof o === "object" && o !== null ? o : {};
    } catch (e) {
      return {};
    }
  },

  get: function (key) {
    var map = this.getMap();
    return map[key] === true;
  },

  set: function (key, checked) {
    var map = this.getMap();
    map[key] = !!checked;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(map));
    } catch (e) {}
  },

  getPassedCount: function () {
    var map = this.getMap();
    var n = 0;
    this.ITEM_KEYS.forEach(function (k) {
      if (map[k] === true) n++;
    });
    return n;
  },

  allPassed: function () {
    return this.getPassedCount() === this.ITEM_KEYS.length;
  },

  reset: function () {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {}
  }
};
