/**
 * Job Notification Tracker — Preferences (localStorage: jobTrackerPreferences)
 */
window.JobTrackerPreferences = {
  STORAGE_KEY: "jobTrackerPreferences",

  defaults: function () {
    return {
      roleKeywords: "",
      preferredLocations: [],
      preferredMode: [],
      experienceLevel: "",
      skills: "",
      minMatchScore: 40
    };
  },

  get: function () {
    try {
      var raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return this.defaults();
      var p = JSON.parse(raw);
      return {
        roleKeywords: typeof p.roleKeywords === "string" ? p.roleKeywords : "",
        preferredLocations: Array.isArray(p.preferredLocations) ? p.preferredLocations : [],
        preferredMode: Array.isArray(p.preferredMode) ? p.preferredMode : [],
        experienceLevel: typeof p.experienceLevel === "string" ? p.experienceLevel : "",
        skills: typeof p.skills === "string" ? p.skills : "",
        minMatchScore: typeof p.minMatchScore === "number" ? Math.max(0, Math.min(100, p.minMatchScore)) : 40
      };
    } catch (e) {
      return this.defaults();
    }
  },

  set: function (prefs) {
    try {
      var p = this.defaults();
      if (prefs.roleKeywords !== undefined) p.roleKeywords = String(prefs.roleKeywords).trim();
      if (prefs.preferredLocations !== undefined) p.preferredLocations = Array.isArray(prefs.preferredLocations) ? prefs.preferredLocations : [];
      if (prefs.preferredMode !== undefined) p.preferredMode = Array.isArray(prefs.preferredMode) ? prefs.preferredMode : [];
      if (prefs.experienceLevel !== undefined) p.experienceLevel = String(prefs.experienceLevel).trim();
      if (prefs.skills !== undefined) p.skills = String(prefs.skills).trim();
      if (prefs.minMatchScore !== undefined) p.minMatchScore = Math.max(0, Math.min(100, Number(prefs.minMatchScore) || 40));
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(p));
      return p;
    } catch (e) {
      return this.get();
    }
  },

  isSet: function () {
    var p = this.get();
    return p.roleKeywords.length > 0 || p.preferredLocations.length > 0 || p.preferredMode.length > 0 ||
      p.experienceLevel.length > 0 || p.skills.length > 0;
  },

  hasStored: function () {
    return localStorage.getItem(this.STORAGE_KEY) !== null;
  }
};
