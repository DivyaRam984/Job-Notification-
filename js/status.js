/**
 * Job Notification Tracker — Job status tracking (localStorage)
 * jobTrackerStatus = { jobId: status }
 * jobTrackerStatusUpdates = [ { jobId, title, company, status, dateChanged } ]
 */
window.JobTrackerStatus = {
  STATUS_KEY: "jobTrackerStatus",
  UPDATES_KEY: "jobTrackerStatusUpdates",
  MAX_UPDATES: 50,
  VALID: ["Not Applied", "Applied", "Rejected", "Selected"],

  getMap: function () {
    try {
      var raw = localStorage.getItem(this.STATUS_KEY);
      if (!raw) return {};
      var o = JSON.parse(raw);
      return typeof o === "object" && o !== null ? o : {};
    } catch (e) {
      return {};
    }
  },

  get: function (jobId) {
    var map = this.getMap();
    var s = map[jobId];
    if (this.VALID.indexOf(s) !== -1) return s;
    return "Not Applied";
  },

  set: function (jobId, status) {
    if (this.VALID.indexOf(status) === -1) return;
    var map = this.getMap();
    map[jobId] = status;
    try {
      localStorage.setItem(this.STATUS_KEY, JSON.stringify(map));
    } catch (e) {}
  },

  getUpdates: function () {
    try {
      var raw = localStorage.getItem(this.UPDATES_KEY);
      if (!raw) return [];
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  },

  pushUpdate: function (jobId, title, company, status) {
    var list = this.getUpdates();
    list.unshift({
      jobId: jobId,
      title: title || "",
      company: company || "",
      status: status,
      dateChanged: new Date().toISOString()
    });
    list = list.slice(0, this.MAX_UPDATES);
    try {
      localStorage.setItem(this.UPDATES_KEY, JSON.stringify(list));
    } catch (e) {}
  }
};

/**
 * Non-blocking toast: "Status updated: {status}". Auto-disappear.
 */
window.showStatusToast = function (status) {
  var msg = "Status updated: " + status;
  var el = document.createElement("div");
  el.className = "status-toast";
  el.setAttribute("role", "status");
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(function () {
    el.classList.add("status-toast--visible");
  });
  setTimeout(function () {
    el.classList.remove("status-toast--visible");
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 200);
  }, 2500);
};
