window.G = window.G || {};

G.Game = (function () {
  const U = G.utils;
  let mode = 'menu';
  let clock = null;
  let interactTarget = null;
  let landed = false;
  let docked = null;
  let briefingShown = false;

  function boot() {
    G.Save.load();
    const canvas = U.el('game-canvas');
    G.World.init(canvas);
    G.Ship.bind(canvas);
    G.Rover.bind(canvas);
    G.UI.initKoraPanel();
    G.UI.initProfileScreen();
    G.UI.initSettings();
    G.UI.applySettings();
    bindMenus();
    bindActions();
    bindKeys();
    clock = { last: performance.now() };
    requestAnimationFrame(loop);
    if (G.Save.get().profile) {
      U.el('btn-continue').disabled = false;
    } else {
      U.el('btn-continue').disabled = true;
    }
  }

  function bindMenus() {
    U.el('btn-new-game').onclick = function () {
      G.Audio.unlock();
      G.Audio.play('click');
      if (G.Save.get().profile) {
        if (!confirm('Start a new expedition? Your current save will be erased.')) return;
        G.Save.wipe();
      }
      showScreen('profile-screen');
    };
    U.el('btn-continue').onclick = function () {
      G.Audio.unlock();
      G.Audio.play('click');
      startPlay(true);
    };
    U.el('btn-settings').onclick = function () {
      G.Audio.play('click');
      U.show('settings-panel');
    };
    U.el('btn-howto').onclick = function () {
      G.Audio.play('click');
      U.show('howto-panel');
    };
    U.el('btn-profile-back').onclick = function () {
      G.Audio.play('click');
      showScreen('menu-screen');
    };
    U.el('btn-profile-done').onclick = function () {
      G.Audio.play('success');
      const name = U.el('profile-name').value.trim() || 'Explorer';
      const choices = G.UI.getProfileChoices();
      G.Save.setProfile({ name: name, avatar: choices.avatar, accent: choices.accent, helmet: choices.helmet, badge: choices.badge });
      showBriefing();
    };
    U.el('btn-briefing-go').onclick = function () {
      G.Audio.play('dock');
      startPlay(false);
    };
    U.el('btn-report-submit').onclick = submitReport;
    U.el('btn-credits-menu').onclick = function () {
      G.Audio.play('click');
      U.hide('hud');
      const profile = G.Save.get().profile;
      G.Save.wipe();
      if (profile) G.Save.setProfile(profile);
      showScreen('menu-screen');
      mode = 'menu';
    };
    document.querySelectorAll('.panel-close').forEach(function (btn) {
      btn.onclick = function () {
        G.Audio.play('click');
        U.hide(btn.getAttribute('data-close'));
        if (btn.getAttribute('data-close') === 'kora-panel') G.UI.closeKora();
      };
    });
  }

  function bindActions() {
    U.el('btn-scan').onclick = function () { doScan(); };
    U.el('btn-map').onclick = function () { G.UI.toggleMap(); };
    U.el('btn-rover').onclick = function () { doRoverAction(); };
    U.el('btn-journal').onclick = function () { G.Journal.open(); };
    U.el('btn-kora').onclick = function () { G.UI.toggleKora(); };
    U.el('hud-kora-mini').onclick = function () { G.UI.toggleKora(); };
  }

  function bindKeys() {
    window.addEventListener('keydown', function (e) {
      if (mode !== 'play') return;
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA')) return;
      switch (e.code) {
        case 'KeyM': G.UI.toggleMap(); break;
        case 'KeyJ': G.Journal.open(); break;
        case 'KeyK': G.UI.toggleKora(); break;
        case 'KeyQ': doScan(); break;
        case 'KeyE': doInteract(); break;
        case 'KeyR': doRoverAction(); break;
        case 'Escape':
          if (!U.el('map-panel').classList.contains('hidden')) G.UI.closeMap();
          else if (!U.el('journal-panel').classList.contains('hidden')) G.Journal.close();
          else if (!U.el('kora-panel').classList.contains('hidden')) G.UI.closeKora();
          else if (!U.el('scan-panel').classList.contains('hidden')) G.UI.closeScanPanel();
          else if (!U.el('npc-panel').classList.contains('hidden')) G.UI.closeNpc();
          else if (!U.el('station-panel').classList.contains('hidden')) G.UI.closeStation();
          break;
      }
      if (mode === 'play' && !landed) G.Rover.down(e);
    });
    window.addEventListener('keyup', function (e) {
      G.Rover.up(e);
    });
  }

  function showScreen(id) {
    ['menu-screen', 'profile-screen', 'briefing-screen', 'report-screen', 'credits-screen'].forEach(function (s) {
      U.hide(s);
    });
    if (id) U.show(id);
  }

  function showBriefing() {
    showScreen('briefing-screen');
    const st = G.Save.get();
    const m = G.MISSIONS[st.missionIndex];
    let text = 'Junior Explorer ' + st.profile.name + ',\n\n';
    text += 'You have been selected for the Solar System Knowledge Expedition. ';
    text += 'Your ship, the EX-01 Explorer, is equipped with a rover, a science scanner, and me — KORA, your Knowledge and Orbital Reconnaissance Assistant.\n\n';
    if (m) {
      text += 'Your first mission: ' + m.title + '\n' + m.concept + '\n\n';
    }
    text += 'Remember: explore first, explain second. Wrong answers never end the game — they teach us something.\n\nGood luck, explorer.';
    U.el('briefing-text').textContent = text;
  }

  function startPlay(isContinue) {
    showScreen(null);
    U.show('hud');
    mode = 'play';
    landed = false;
    docked = null;
    G.World.removeTerrain();
    G.Rover.hide();
    G.Ship.activate();
    G.Audio.unlock();
    G.Audio.startMusic('earth');
    const st = G.Save.get();
    if (!isContinue || !briefingShown) {
      briefingShown = true;
      G.Missions.start();
    } else {
      G.UI.koraSay('Welcome back, ' + st.profile.name + '. Resuming expedition. Current mission: ' + (G.Missions.current() ? G.Missions.current().title : 'Complete'));
    }
    G.UI.updateObjective();
    G.UI.updateHUD();
    G.Save.visit('earth');
    G.Ship.setFirstMoveCb(G.Missions.onMove);
    const earth = G.World.bodies['earth'];
    if (earth && earth.worldPos) {
      G.Ship.teleport(earth.worldPos.x + 45, 12, earth.worldPos.z + 20);
    }
  }

  function fadeOut(cb) {
    const f = U.el('fade-overlay');
    f.classList.add('active');
    setTimeout(function () {
      cb();
    }, 650);
  }

  function fadeIn() {
    const f = U.el('fade-overlay');
    f.classList.remove('active');
  }

  function doScan() {
    if (mode !== 'play' || G.Scanner.isScanning()) return;
    let target = null;
    if (landed) {
      const near = G.World.nearestPOI(G.Rover.position(), 22);
      if (near) target = near.poi;
    } else {
      const sat = G.World.satellite();
      if (sat) {
        const d = G.Ship.position().distanceTo(sat.position);
        if (d < 45) target = { obj: sat, id: 'satellite', kind: 'satellite', name: 'Training Satellite', radius: 4, scanned: false };
      }
      if (!target) {
        const near = G.World.nearestPOI(G.Ship.position(), 40);
        if (near) target = near.poi;
      }
    }
    if (!target) {
      G.UI.notify('No scannable object in range', 'info');
      return;
    }
    if (target.scanned) {
      G.UI.notify('Already scanned: ' + (target.name || 'object'), 'info');
      G.UI.openScanPanel(target);
      return;
    }
    if (G.Scanner.startScan(target)) {
      G.UI.openScanPanel(target);
      G.Audio.play('ping');
    }
  }

  function doInteract() {
    if (mode !== 'play') return;
    if (interactTarget) {
      interactTarget();
      interactTarget = null;
      return;
    }
    if (landed) {
      const near = G.World.nearestPOI(G.Rover.position(), 20);
      if (near && !near.poi.scanned) {
        doScan();
      }
      return;
    }
    const nearStation = G.World.nearestStation(G.Ship.position(), 22);
    if (nearStation) {
      dock(nearStation.station);
      return;
    }
    const nearBody = G.World.nearestBody(G.Ship.position(), 1e9);
    if (nearBody && nearBody.dist < nearBody.body.def.radius + 14 && nearBody.body.def.terrain) {
      land(nearBody.body);
      return;
    }
    G.UI.notify('Nothing to interact with nearby', 'info');
  }

  function dock(station) {
    G.Audio.play('dock');
    G.UI.notify('Docked at ' + station.def.name, 'good');
    G.UI.openStation(station);
    G.Save.visit(station.def.id);
    G.Missions.onDock(station.def.id);
  }

  function land(body) {
    G.Audio.play('land');
    fadeOut(function () {
      landed = true;
      G.Ship.deactivate();
      G.Rover.activate();
      G.World.buildTerrain(body.def.id);
      G.Rover.place(0, 0);
      const rp = G.Rover.position();
      G.Ship.teleport(rp.x, rp.y + 22, rp.z);
      G.Save.visit(body.def.id);
      G.Kora.setContext(body.def.id);
      G.Missions.onLand(body.def.id);
      G.UI.notify('Landed on ' + body.def.name + '. Rover deployed.', 'good');
      G.UI.koraSay('Touchdown on ' + body.def.name + '. Gravity here is ' + (body.def.gravity || 'moderate') + '. Drive with WASD, scan with Q, and please avoid the rocks.');
      fadeIn();
    });
  }

  function doRoverAction() {
    if (mode !== 'play') return;
    if (!landed) {
      G.UI.notify('You must land first — approach a planet surface and press E', 'info');
      return;
    }
    const roverPos = G.Rover.position();
    const shipPos = G.Ship.position();
    if (U.dist(roverPos.x, roverPos.z, shipPos.x, shipPos.z) < 30) {
      returnToShip();
    } else {
      G.UI.notify('Drive back to your ship (within 30m) and press R to return', 'info');
    }
  }

  function returnToShip() {
    G.Audio.play('dock');
    fadeOut(function () {
      landed = false;
      G.Rover.deactivate();
      G.Rover.hide();
      G.World.removeTerrain();
      G.Ship.activate();
      G.Missions.onReturnShip();
      G.UI.notify('Rover recovered. Back aboard the EX-01.', 'good');
      fadeIn();
    });
  }
  function updateInteract() {
    if (mode !== 'play') {
      G.UI.setInteract(null);
      return;
    }
    let text = null;
    if (landed) {
      const near = G.World.nearestPOI(G.Rover.position(), 20);
      if (near && !near.poi.scanned) {
        text = 'Press E or Q to scan: ' + near.poi.name;
        interactTarget = function () { doScan(); };
      } else {
        const roverPos = G.Rover.position();
        const shipPos = G.Ship.position();
        if (U.dist(roverPos.x, roverPos.z, shipPos.x, shipPos.z) < 30) {
          text = 'Press R to return to your ship';
          interactTarget = function () { doRoverAction(); };
        }
      }
    } else {
      const nearStation = G.World.nearestStation(G.Ship.position(), 22);
      if (nearStation) {
        text = 'Press E to dock at ' + nearStation.station.def.name;
        interactTarget = function () { dock(nearStation.station); };
      } else {
        const nearBody = G.World.nearestBody(G.Ship.position(), 1e9);
        if (nearBody && nearBody.dist < nearBody.body.def.radius + 14 && nearBody.body.def.terrain) {
          text = 'Press E to land on ' + nearBody.body.def.name;
          interactTarget = function () { land(nearBody.body); };
        }
      }
    }
    G.UI.setInteract(text);
  }

  function loop(now) {
    requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - clock.last) / 1000);
    clock.last = now;
    if (!G.World.isReady()) return;
    G.World.update(dt);
    if (mode === 'play') {
      let info = null;
      if (landed) {
        info = G.Rover.update(dt);
      } else {
        info = G.Ship.update(dt);
      }
      if (info) {
        const st = G.Save.get();
        if (info.speed > 2) {
          st.fuel = Math.max(0, st.fuel - dt * 0.25);
          st.power = Math.max(0, st.power - dt * 0.1);
        }
        if (st.fuel < 20 && Math.random() < dt * 0.05) {
          G.UI.koraSay('Fuel is getting low, ' + ((st.profile && st.profile.name) || 'Explorer') + '. Consider docking at a station soon.');
        }
      }
      const scanRes = G.Scanner.update(dt);
      if (scanRes) {
        if (scanRes.finished) {
          G.UI.closeScanPanel();
        } else {
          G.UI.updateScanPanel();
        }
      }
      updateInteract();
      G.UI.updateHUD();
      if (Math.random() < dt * 0.002) G.Save.save();
    } else {
      const cam = G.World.camera;
      const t = now * 0.00004;
      const earth = G.World.bodies['earth'];
      if (earth && earth.worldPos) {
        cam.position.set(
          earth.worldPos.x + Math.cos(t) * 90,
          30 + Math.sin(t * 2.3) * 10,
          earth.worldPos.z + Math.sin(t) * 90
        );
        cam.lookAt(earth.worldPos.x, 0, earth.worldPos.z);
      }
    }
  }

  function openReport() {
    mode = 'report';
    showScreen('report-screen');
    const st = G.Save.get();
    const body = U.el('report-body');
    const planets = ['moon', 'mars'];
    const history = ['apollo11', 'chandrayaan3'];
    const concepts = ['gravity.concept', 'mars.water', 'science.method', 'orbit.concept'];
    let html = '';
    html += '<div class="report-group"><h3>Choose a planet or moon you explored</h3><div class="report-options" data-group="planet">';
    for (let i = 0; i < planets.length; i++) {
      const p = G.PLANETS[planets[i]];
      html += '<button class="report-opt" data-group="planet" data-val="' + p.id + '">' + p.name + '</button>';
    }
    html += '</div></div>';
    html += '<div class="report-group"><h3>Choose a historical mission</h3><div class="report-options" data-group="history">';
    for (let i = 0; i < history.length; i++) {
      const t = G.KNOWLEDGE.find(function (k) { return k.id === history[i]; });
      if (t) html += '<button class="report-opt" data-group="history" data-val="' + t.id + '">' + t.topic + '</button>';
    }
    html += '</div></div>';
    html += '<div class="report-group"><h3>Choose a scientific concept</h3><div class="report-options" data-group="concept">';
    for (let i = 0; i < concepts.length; i++) {
      const t = G.KNOWLEDGE.find(function (k) { return k.id === concepts[i]; });
      if (t) html += '<button class="report-opt" data-group="concept" data-val="' + t.id + '">' + t.topic + '</button>';
    }
    html += '</div></div>';
    body.innerHTML = html;
    body.querySelectorAll('.report-opt').forEach(function (btn) {
      btn.onclick = function () {
        const group = this.getAttribute('data-group');
        body.querySelectorAll('.report-opt[data-group="' + group + '"]').forEach(function (b) { b.classList.remove('selected'); });
        this.classList.add('selected');
      };
    });
  }

  function submitReport() {
    const body = U.el('report-body');
    const sel = body.querySelectorAll('.report-opt.selected');
    if (sel.length < 3) {
      G.UI.notify('Please select one option from each group', 'bad');
      G.Audio.play('error');
      return;
    }
    G.Audio.play('success');
    G.Missions.onReport();
    showCredits();
  }

  function showCredits() {
    mode = 'credits';
    showScreen('credits-screen');
    const st = G.Save.get();
    const m = G.MISSIONS[st.missionIndex - 1];
    let text = 'Explorer: ' + (st.profile ? st.profile.name : 'Unknown') + '\n';
    text += 'Final Rank: ' + G.Save.rank().name + '\n';
    text += 'Missions Completed: ' + st.completedMissions.length + ' / ' + G.MISSIONS.length + '\n';
    text += 'Knowledge Topics: ' + Object.keys(st.knowledge).length + ' / ' + G.KNOWLEDGE.length + '\n';
    text += 'Badges Earned: ' + st.badges.length + ' / ' + G.BADGES.length + '\n';
    text += 'Questions Asked: ' + st.questionsAsked + '\n\n';
    text += 'What I saw: the Moon, Mars, and the stations between.\n';
    text += 'What I measured: craters, channels, rocks and signals.\n';
    text += 'What I learned: that science is asking questions and following evidence.\n';
    text += 'Where I learned it: out there.';
    U.el('credits-text').textContent = text;
    G.Audio.startMusic('discovery');
    G.Audio.speak('Mission complete. You started by asking where the Moon was. You ended by explaining why it has craters. Acceptable progress.', st.settings.rate);
  }

  document.addEventListener('DOMContentLoaded', boot);

  return {
    fadeOut: fadeOut, fadeIn: fadeIn,
    showCredits: showCredits, openReport: openReport,
    get mode() { return mode; }
  };
})();
