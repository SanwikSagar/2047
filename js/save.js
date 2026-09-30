window.G = window.G || {};

G.Save = (function () {
  const KEY = 'orbita2047_save';
  const SETTINGS_KEY = 'orbita2047_settings';

  const DEFAULT_SETTINGS = {
    voice: true,
    rate: 1.0,
    music: 0.5,
    sfx: 0.8,
    reducedMotion: false,
    highContrast: false,
    textSize: 'normal'
  };

  function defaultState() {
    return {
      profile: null,
      xp: 0,
      missionIndex: 0,
      missionStep: 0,
      completedMissions: [],
      knowledge: {},
      badges: [],
      visited: [],
      questionsAsked: 0,
      quizStats: {},
      upgrades: { scanner: 0, storage: 0, solar: 0, comms: 0 },
      fuel: 100,
      power: 100,
      settings: Object.assign({}, DEFAULT_SETTINGS)
    };
  }

  let state = defaultState();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        state = Object.assign(defaultState(), parsed);
        state.settings = Object.assign({}, DEFAULT_SETTINGS, parsed.settings || {});
      }
    } catch (e) {
      state = defaultState();
    }
    return state;
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) { }
  }

  function wipe() {
    state = defaultState();
    try { localStorage.removeItem(KEY); } catch (e) { }
  }

  function get() { return state; }

  function setProfile(p) { state.profile = p; save(); }

  function addXp(amount) {
    state.xp += amount;
    save();
    return rank();
  }

  function rank() {
    const ranks = G.RANKS;
    let r = ranks[0];
    for (let i = 0; i < ranks.length; i++) {
      if (state.xp >= ranks[i].xp) r = ranks[i];
    }
    return r;
  }

  function hasKnowledge(id) {
    return !!state.knowledge[id];
  }

  function unlockKnowledge(id, level) {
    if (!state.knowledge[id]) {
      state.knowledge[id] = { level: level || 'seen', scans: 1 };
      save();
      return true;
    }
    state.knowledge[id].scans++;
    if (level === 'scanned') state.knowledge[id].level = 'scanned';
    save();
    return false;
  }

  function setKnowledgeLevel(id, level) {
    if (state.knowledge[id]) {
      state.knowledge[id].level = level;
      save();
    }
  }

  function hasBadge(id) {
    return state.badges.indexOf(id) >= 0;
  }

  function awardBadge(id) {
    if (!hasBadge(id)) {
      state.badges.push(id);
      save();
      return true;
    }
    return false;
  }

  function visit(id) {
    if (state.visited.indexOf(id) < 0) {
      state.visited.push(id);
      save();
    }
  }

  function completeMission(id) {
    if (state.completedMissions.indexOf(id) < 0) {
      state.completedMissions.push(id);
    }
  }

  function recordQuestion() {
    state.questionsAsked++;
    save();
  }

  function recordQuiz(id, correct) {
    if (!state.quizStats[id]) state.quizStats[id] = { attempts: 0, correct: 0 };
    state.quizStats[id].attempts++;
    if (correct) state.quizStats[id].correct++;
    save();
  }

  function setSettings(s) {
    state.settings = Object.assign({}, state.settings, s);
    save();
  }

  return {
    load: load, save: save, wipe: wipe, get: get,
    setProfile: setProfile, addXp: addXp, rank: rank,
    hasKnowledge: hasKnowledge, unlockKnowledge: unlockKnowledge, setKnowledgeLevel: setKnowledgeLevel,
    hasBadge: hasBadge, awardBadge: awardBadge,
    visit: visit, completeMission: completeMission,
    recordQuestion: recordQuestion, recordQuiz: recordQuiz,
    setSettings: setSettings
  };
})();
