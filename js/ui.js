window.G = window.G || {};

G.UI = (function () {
  const U = G.utils;
  let koraOpen = false;
  let mapOpen = false;
  let currentStation = null;
  let currentNpc = null;

  function notify(text, type) {
    const area = U.el('notification-area');
    const n = document.createElement('div');
    n.className = 'notification ' + (type || 'info');
    n.textContent = text;
    area.appendChild(n);
    setTimeout(function () { n.classList.add('fadeout'); }, 2600);
    setTimeout(function () { if (n.parentNode) n.parentNode.removeChild(n); }, 3100);
  }

  function discoveryToast(title, text) {
    const t = U.el('discovery-toast');
    t.querySelector('.discovery-text').textContent = text;
    t.classList.remove('hidden');
    t.classList.remove('fadeout');
    setTimeout(function () { t.classList.add('fadeout'); }, 3200);
    setTimeout(function () { t.classList.add('hidden'); }, 3800);
  }

  function koraSay(text) {
    addKoraMessage(text, 'kora');
    const st = G.Save.get();
    if (st.settings.voice) {
      G.Audio.speak(text, st.settings.rate);
    }
    const mini = U.el('kora-mini-text');
    if (mini) mini.textContent = text.length > 60 ? text.slice(0, 60) + '...' : text;
  }

  function addKoraMessage(text, who) {
    const box = U.el('kora-messages');
    if (!box) return;
    const div = document.createElement('div');
    div.className = 'kora-msg ' + who;
    const tag = document.createElement('span');
    tag.className = 'msg-tag';
    tag.textContent = who === 'kora' ? 'KORA' : 'You';
    div.appendChild(tag);
    div.appendChild(document.createTextNode(text));
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  }

  function openKora() {
    koraOpen = true;
    U.show('kora-panel');
    U.el('kora-input').focus();
    renderSuggestions();
  }

  function closeKora() {
    koraOpen = false;
    U.hide('kora-panel');
    G.Voice.stop();
    U.hide('kora-listening');
    U.el('kora-mic').classList.remove('listening');
  }

  function toggleKora() {
    if (koraOpen) closeKora(); else openKora();
  }

  function renderSuggestions() {
    const box = U.el('kora-suggestions');
    box.innerHTML = '';
    const sugg = G.KORA_LINES.suggestions;
    for (let i = 0; i < sugg.length; i++) {
      const chip = document.createElement('button');
      chip.className = 'suggestion-chip';
      chip.textContent = sugg[i];
      chip.onclick = function () { sendKora(sugg[i]); };
      box.appendChild(chip);
    }
  }

  function sendKora(text) {
    if (!text || !text.trim()) return;
    addKoraMessage(text, 'player');
    G.Save.recordQuestion();
    G.Audio.play('radio');
    const res = G.Kora.respond(text);
    setTimeout(function () {
      koraSay(res.text);
      if (res.topic && res.topic.id) {
        G.Save.unlockKnowledge(res.topic.id, 'seen');
        G.Journal.refresh();
      }
      checkQuestionBadge();
    }, 500);
  }

  function checkQuestionBadge() {
    if (G.Save.get().questionsAsked >= 10) {
      if (G.Save.awardBadge('question_machine')) {
        discoveryToast('Badge Earned', 'Question Machine');
        G.Audio.play('badge');
      }
    }
  }

  function initKoraPanel() {
    U.el('kora-send').onclick = function () {
      const inp = U.el('kora-input');
      sendKora(inp.value);
      inp.value = '';
    };
    U.el('kora-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        sendKora(this.value);
        this.value = '';
      }
    });
    U.el('kora-mic').onclick = function () {
      if (!G.Voice.available()) {
        koraSay(G.KORA_LINES.voiceUnavailable[0]);
        return;
      }
      const btn = this;
      if (G.Voice.isListening()) {
        G.Voice.stop();
        btn.classList.remove('listening');
        U.hide('kora-listening');
        return;
      }
      btn.classList.add('listening');
      U.show('kora-listening');
      const ok = G.Voice.start(function (transcript) {
        addKoraMessage(transcript, 'player');
        G.Save.recordQuestion();
        const res = G.Kora.respond(transcript);
        setTimeout(function () { koraSay(res.text); }, 400);
      }, function () {
        btn.classList.remove('listening');
        U.hide('kora-listening');
      });
      if (!ok) {
        btn.classList.remove('listening');
        U.hide('kora-listening');
        koraSay(G.KORA_LINES.voiceUnavailable[0]);
      }
    };
  }

  function updateObjective() {
    const m = G.Missions.current();
    const step = G.Missions.currentStep();
    if (!m) {
      U.el('objective-text').textContent = 'Expedition Complete';
      U.el('objective-steps').innerHTML = '';
      return;
    }
    U.el('objective-text').textContent = m.title;
    let html = '';
    for (let i = 0; i < m.steps.length; i++) {
      const cls = i < G.Save.get().missionStep ? 'step-done' : i === G.Save.get().missionStep ? 'step-active' : '';
      const mark = i < G.Save.get().missionStep ? '&#10003; ' : i === G.Save.get().missionStep ? '&#9654; ' : '&#9679; ';
      html += '<div class="' + cls + '">' + mark + m.steps[i].text + '</div>';
    }
    U.el('objective-steps').innerHTML = html;
  }

  function updateHUD() {
    const st = G.Save.get();
    U.el('hud-rank-name').textContent = G.Save.rank().name;
    U.el('status-fuel').textContent = Math.round(st.fuel) + '%';
    U.el('status-power').textContent = Math.round(st.power) + '%';
    const near = G.World.nearestBody(G.Ship.position(), 200);
    let dest = 'Deep Space';
    if (near) {
      dest = near.body.def.name;
      if (near.dist < near.body.def.radius + 30) dest += ' — Near';
    }
    U.el('hud-dest-name').textContent = dest;
  }

  function setInteract(text) {
    const el = U.el('hud-interact');
    if (text) {
      el.innerHTML = text;
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  }
  function openMap() {
    mapOpen = true;
    U.show('map-panel');
    drawMap();
  }

  function closeMap() {
    mapOpen = false;
    U.hide('map-panel');
  }

  function toggleMap() {
    if (mapOpen) closeMap(); else openMap();
  }

  function drawMap() {
    const canvas = U.el('map-canvas');
    const g = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    g.fillStyle = '#02060e';
    g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(79,216,255,0.12)';
    g.lineWidth = 1;
    const scale = 0.85;
    const ids = Object.keys(G.PLANETS);
    for (let i = 0; i < ids.length; i++) {
      const p = G.PLANETS[ids[i]];
      if (p.parent) continue;
      g.beginPath();
      g.arc(cx, cy, p.distance * scale, 0, Math.PI * 2);
      g.stroke();
    }
    const sunGrad = g.createRadialGradient(cx, cy, 0, cx, cy, 26);
    sunGrad.addColorStop(0, '#ffe873');
    sunGrad.addColorStop(1, '#f0a830');
    g.fillStyle = sunGrad;
    g.beginPath(); g.arc(cx, cy, 18, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ffd23f';
    g.font = 'bold 11px sans-serif';
    g.textAlign = 'center';
    g.fillText('SUN', cx, cy + 34);

    const st = G.Save.get();
    const unlocked = ['earth', 'moon', 'mars'];
    const shipPos = G.Ship.position();
    let shipBody = null, shipD = 1e9;
    for (let i = 0; i < ids.length; i++) {
      const p = G.PLANETS[ids[i]];
      const b = G.World.bodies[p.id];
      if (!b || !b.worldPos) continue;
      const d = shipPos.distanceTo(b.worldPos);
      if (d < shipD) { shipD = d; shipBody = p; }
    }

    for (let i = 0; i < ids.length; i++) {
      const p = G.PLANETS[ids[i]];
      const b = G.World.bodies[p.id];
      if (!b || !b.worldPos) continue;
      const x = cx + (b.worldPos.x / (p.distance || 1)) * p.distance * scale;
      const y = cy + (b.worldPos.z / (p.distance || 1)) * p.distance * scale;
      const isUnlocked = unlocked.indexOf(p.id) >= 0;
      const isCurrent = shipBody && shipBody.id === p.id;
      g.fillStyle = isUnlocked ? p.color : 'rgba(120,130,145,0.5)';
      g.beginPath(); g.arc(x, y, Math.max(4, p.radius * 0.55), 0, Math.PI * 2); g.fill();
      g.fillStyle = isUnlocked ? '#d8f2ff' : 'rgba(160,170,185,0.6)';
      g.font = (isCurrent ? 'bold ' : '') + '11px sans-serif';
      g.fillText(p.name + (isUnlocked ? '' : ' (locked)'), x, y + Math.max(10, p.radius * 0.55 + 8));
      if (isCurrent) {
        g.strokeStyle = '#ffb347';
        g.lineWidth = 2;
        g.beginPath(); g.arc(x, y, Math.max(8, p.radius * 0.55 + 5), 0, Math.PI * 2); g.stroke();
        g.lineWidth = 1;
      }
    }

    const stIds = Object.keys(G.STATIONS);
    for (let i = 0; i < stIds.length; i++) {
      const s = G.World.stations[stIds[i]];
      if (!s || !s.worldPos) continue;
      const p = G.PLANETS[s.def.parent];
      const x = cx + (s.worldPos.x / (p.distance || 1)) * p.distance * scale;
      const y = cy + (s.worldPos.z / (p.distance || 1)) * p.distance * scale;
      g.fillStyle = '#4fd8ff';
      g.fillRect(x - 4, y - 4, 8, 8);
      g.font = '10px sans-serif';
      g.fillText(s.def.name, x, y + 14);
    }

    const m = G.Missions.current();
    if (m) {
      const step = G.Missions.currentStep();
      let legend = 'Current mission: ' + m.title;
      if (step) legend += ' — ' + step.text;
      U.el('map-legend').innerHTML = '<span class="legend-target">' + legend + '</span><br>Click a planet to travel there (unlocked destinations only).';
    } else {
      U.el('map-legend').textContent = 'All missions complete.';
    }

    canvas.onclick = function (e) {
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (W / rect.width);
      const my = (e.clientY - rect.top) * (H / rect.height);
      for (let i = 0; i < ids.length; i++) {
        const p = G.PLANETS[ids[i]];
        if (unlocked.indexOf(p.id) < 0) continue;
        const b = G.World.bodies[p.id];
        if (!b || !b.worldPos) continue;
        const x = cx + (b.worldPos.x / (p.distance || 1)) * p.distance * scale;
        const y = cy + (b.worldPos.z / (p.distance || 1)) * p.distance * scale;
        if (U.dist(mx, my, x, y) < 16) {
          travelTo(p.id);
          return;
        }
      }
    };
  }

  function travelTo(bodyId) {
    const p = G.PLANETS[bodyId];
    const b = G.World.bodies[bodyId];
    if (!b || !b.worldPos) return;
    const st = G.Save.get();
    if (st.fuel < 15) {
      notify('Not enough fuel! Visit a station to refuel.', 'bad');
      G.Audio.play('error');
      return;
    }
    st.fuel = Math.max(0, st.fuel - 15);
    G.Save.save();
    G.Audio.play('dock');
    G.Game.fadeOut(function () {
      const offset = p.radius + 26;
      const dir = b.worldPos.clone().normalize();
      G.Ship.teleport(b.worldPos.x + dir.x * offset, 10, b.worldPos.z + dir.z * offset);
      G.Game.fadeIn();
      G.Save.visit(bodyId);
      G.Kora.setContext(bodyId);
      G.Missions.onTravel(bodyId);
      G.UI.notify('Arrived at ' + p.name, 'info');
      G.Audio.startMusic(bodyId === 'earth' ? 'earth' : 'deep');
      checkExplorerBadge();
    });
  }

  function checkExplorerBadge() {
    const st = G.Save.get();
    if (st.visited.indexOf('earth') >= 0 && st.visited.indexOf('moon') >= 0 && st.visited.indexOf('mars') >= 0) {
      if (G.Save.awardBadge('solar_system_explorer')) {
        discoveryToast('Badge Earned', 'Solar System Explorer');
        G.Audio.play('badge');
      }
    }
  }
  function openScanPanel(poi) {
    const info = G.Scanner.infoFor(poi.kind);
    if (!info) return;
    U.show('scan-panel');
    U.el('scan-title').textContent = info.name;
    U.el('scan-subtitle').textContent = info.type;
    let html = '<div class="scan-target-name">' + info.name + '</div>';
    html += '<div class="scan-target-type">' + info.type + '</div>';
    html += '<div class="scan-observation">' + info.observation + '</div>';
    html += '<div class="scan-tags">';
    for (let i = 0; i < info.tags.length; i++) {
      html += '<span class="scan-tag">' + info.tags[i] + '</span>';
    }
    html += '</div>';
    if (info.knowledgeId && !G.Save.hasKnowledge(info.knowledgeId)) {
      html += '<div class="scan-unlock">Topic unlocked: ' + info.knowledgeId + '</div>';
    }
    html += '<div class="scan-progress-bar"><div class="scan-progress-fill" id="scan-fill"></div></div>';
    html += '<div class="scan-kora-line">' + info.kora + '</div>';
    U.el('scan-body').innerHTML = html;
  }

  function updateScanPanel() {
    const fill = U.el('scan-fill');
    if (fill) fill.style.width = Math.round(G.Scanner.progress() * 100) + '%';
  }

  function closeScanPanel() { U.hide('scan-panel'); }

  function openNpc(npc) {
    currentNpc = npc;
    U.show('npc-panel');
    U.el('npc-name').textContent = npc.name;
    U.el('npc-role').textContent = npc.role;
    U.el('npc-icon').innerHTML = npc.icon;
    renderNpcGreeting();
  }

  function renderNpcGreeting() {
    const npc = currentNpc;
    if (!npc) return;
    const body = U.el('npc-body');
    body.innerHTML = '<div class="npc-dialogue"><span class="npc-name-tag">' + npc.name + ':</span> ' + npc.greeting + '</div>';
    const opts = document.createElement('div');
    opts.className = 'npc-options';
    const b1 = document.createElement('button');
    b1.className = 'npc-option';
    b1.textContent = 'Ask a question';
    b1.onclick = function () { renderNpcQuestion(0); };
    opts.appendChild(b1);
    const b2 = document.createElement('button');
    b2.className = 'npc-option';
    b2.textContent = 'Chat about science';
    b2.onclick = function () {
      body.innerHTML = '<div class="npc-dialogue"><span class="npc-name-tag">' + npc.name + ':</span> ' + npc.greeting + '</div>';
      body.appendChild(opts);
      G.UI.notify('Speaking with ' + npc.name, 'info');
      G.Missions.onNpc();
    };
    opts.appendChild(b2);
    body.appendChild(opts);
  }

  function renderNpcQuestion(qi) {
    const npc = currentNpc;
    if (!npc || !npc.dialogue[qi]) return;
    const q = npc.dialogue[qi];
    const body = U.el('npc-body');
    body.innerHTML = '<div class="npc-dialogue"><span class="npc-name-tag">' + npc.name + ':</span> ' + q.prompt + '</div>';
    const opts = document.createElement('div');
    opts.className = 'npc-options';
    for (let i = 0; i < q.options.length; i++) {
      (function (opt, idx) {
        const b = document.createElement('button');
        b.className = 'npc-option';
        b.textContent = opt.text;
        b.onclick = function () {
          G.Audio.play(opt.correct ? 'success' : 'error');
          body.innerHTML = '<div class="npc-dialogue"><span class="npc-name-tag">' + npc.name + ':</span> ' + opt.response + '</div>';
          const next = document.createElement('div');
          next.className = 'npc-options';
          if (qi + 1 < npc.dialogue.length) {
            const nb = document.createElement('button');
            nb.className = 'npc-option';
            nb.textContent = 'Next question';
            nb.onclick = function () { renderNpcQuestion(qi + 1); };
            next.appendChild(nb);
          }
          const done = document.createElement('button');
          done.className = 'npc-option';
          done.textContent = 'Thank you';
          done.onclick = function () {
            G.Missions.onNpc();
            closeNpc();
            if (currentStation) renderStation();
          };
          next.appendChild(done);
          body.appendChild(next);
          if (opt.correct) {
            G.Save.addXp(15);
            G.UI.notify('+15 XP', 'good');
          }
        };
        opts.appendChild(b);
      })(q.options[i], i);
    }
    body.appendChild(opts);
  }

  function closeNpc() {
    currentNpc = null;
    U.hide('npc-panel');
  }

  function openStation(station) {
    currentStation = station;
    U.show('station-panel');
    U.el('station-name').textContent = station.def.name;
    renderStation();
  }

  function renderStation() {
    const s = currentStation;
    if (!s) return;
    const st = G.Save.get();
    const body = U.el('station-body');
    let html = '<div class="npc-dialogue">' + s.def.desc + '</div>';
    html += '<div class="station-service"><div><div class="ss-name">Refuel</div><div class="ss-desc">Fill your fuel tanks (current: ' + Math.round(st.fuel) + '%)</div></div>';
    html += '<button id="ss-refuel" ' + (st.fuel > 95 ? 'disabled' : '') + '>Refuel</button></div>';
    html += '<div class="station-service"><div><div class="ss-name">Recharge</div><div class="ss-desc">Restore ship power (current: ' + Math.round(st.power) + '%)</div></div>';
    html += '<button id="ss-recharge" ' + (st.power > 95 ? 'disabled' : '') + '>Recharge</button></div>';
    html += '<div class="station-service"><div><div class="ss-name">Rest</div><div class="ss-desc">Save your expedition progress</div></div>';
    html += '<button id="ss-save">Save</button></div>';
    const step = G.Missions.currentStep();
    if (step && step.type === 'quiz') {
      html += '<div class="station-service"><div><div class="ss-name">Knowledge Check</div><div class="ss-desc">The crew would like to test what you learned</div></div>';
      html += '<button id="ss-quiz">Start</button></div>';
    }
    if (step && step.type === 'npc') {
      html += '<div class="station-service"><div><div class="ss-name">Crew Member</div><div class="ss-desc">Someone on the station wants to speak with you</div></div>';
      html += '<button id="ss-npc">Talk</button></div>';
    }
    body.innerHTML = html;
    if (step && step.type === 'quiz') {
      U.el('ss-quiz').onclick = function () {
        const m = G.Missions.current();
        if (m) {
          G.Quiz.start(m.questions.length ? m.questions : ['q_veh_1', 'q_veh_2'], function () {
            G.Missions.onQuiz();
            renderStation();
          });
        }
      };
    }
    if (step && step.type === 'npc') {
      U.el('ss-npc').onclick = function () {
        const npc = G.NPCS[step.target];
        if (npc) G.UI.openNpc(npc);
      };
    }
    U.el('ss-refuel').onclick = function () {
      st.fuel = 100;
      G.Save.save();
      G.Audio.play('success');
      G.Missions.onRefuel();
      G.UI.notify('Fuel tanks full', 'good');
      renderStation();
    };
    U.el('ss-recharge').onclick = function () {
      st.power = 100;
      G.Save.save();
      G.Audio.play('success');
      G.UI.notify('Power restored', 'good');
      renderStation();
    };
    U.el('ss-save').onclick = function () {
      G.Save.save();
      G.Audio.play('click');
      G.UI.notify('Progress saved', 'good');
    };
  }

  function closeStation() {
    currentStation = null;
    U.hide('station-panel');
  }
  function initProfileScreen() {
    const avatars = U.el('avatar-options');
    avatars.innerHTML = '';
    for (let i = 1; i <= 4; i++) {
      const d = document.createElement('div');
      d.className = 'option-item' + (i === 1 ? ' selected' : '');
      d.innerHTML = '<img src="assets/img/avatar_' + i + '.svg" alt="avatar ' + i + '">';
      d.onclick = function () {
        avatars.querySelectorAll('.option-item').forEach(function (x) { x.classList.remove('selected'); });
        d.classList.add('selected');
      };
      avatars.appendChild(d);
    }
    const accents = U.el('accent-options');
    accents.innerHTML = '';
    const colors = ['#4fd8ff', '#ffb347', '#5dffa0', '#ff6b81'];
    for (let i = 0; i < colors.length; i++) {
      const d = document.createElement('div');
      d.className = 'option-item' + (i === 0 ? ' selected' : '');
      d.innerHTML = '<div class="swatch" style="background:' + colors[i] + '"></div>';
      d.onclick = function () {
        accents.querySelectorAll('.option-item').forEach(function (x) { x.classList.remove('selected'); });
        d.classList.add('selected');
      };
      accents.appendChild(d);
    }
    const helmets = U.el('helmet-options');
    helmets.innerHTML = '';
    const helmetNames = ['Classic', 'Visor', 'Aero'];
    for (let i = 0; i < helmetNames.length; i++) {
      const d = document.createElement('div');
      d.className = 'option-item' + (i === 0 ? ' selected' : '');
      d.textContent = helmetNames[i];
      d.style.fontSize = '11px';
      d.onclick = function () {
        helmets.querySelectorAll('.option-item').forEach(function (x) { x.classList.remove('selected'); });
        d.classList.add('selected');
      };
      helmets.appendChild(d);
    }
    const badges = U.el('badge-options');
    badges.innerHTML = '';
    const badgeImgs = ['badge_star', 'badge_rocket', 'badge_planet', 'badge_telescope'];
    for (let i = 0; i < badgeImgs.length; i++) {
      const d = document.createElement('div');
      d.className = 'option-item' + (i === 0 ? ' selected' : '');
      d.innerHTML = '<img src="assets/img/' + badgeImgs[i] + '.svg" alt="badge">';
      d.onclick = function () {
        badges.querySelectorAll('.option-item').forEach(function (x) { x.classList.remove('selected'); });
        d.classList.add('selected');
      };
      badges.appendChild(d);
    }
  }

  function getProfileChoices() {
    function sel(container) {
      const s = container.querySelector('.selected');
      return s ? Array.prototype.indexOf.call(container.children, s) : 0;
    }
    return {
      avatar: sel(U.el('avatar-options')) + 1,
      accent: ['#4fd8ff', '#ffb347', '#5dffa0', '#ff6b81'][sel(U.el('accent-options'))],
      helmet: sel(U.el('helmet-options')),
      badge: sel(U.el('badge-options'))
    };
  }

  function initSettings() {
    const st = G.Save.get();
    const s = st.settings;
    const voiceBtn = U.el('set-voice');
    voiceBtn.textContent = s.voice ? 'On' : 'Off';
    voiceBtn.className = 'toggle' + (s.voice ? ' on' : '');
    voiceBtn.onclick = function () {
      s.voice = !s.voice;
      G.Save.setSettings({ voice: s.voice });
      voiceBtn.textContent = s.voice ? 'On' : 'Off';
      voiceBtn.className = 'toggle' + (s.voice ? ' on' : '');
      if (!s.voice) G.Audio.stopSpeak();
    };
    U.el('set-rate').value = s.rate;
    U.el('set-rate-val').textContent = s.rate.toFixed(1);
    U.el('set-rate').oninput = function () {
      s.rate = parseFloat(this.value);
      U.el('set-rate-val').textContent = s.rate.toFixed(1);
      G.Save.setSettings({ rate: s.rate });
    };
    U.el('set-music').value = s.music;
    U.el('set-music-val').textContent = Math.round(s.music * 100) + '%';
    U.el('set-music').oninput = function () {
      s.music = parseFloat(this.value);
      U.el('set-music-val').textContent = Math.round(s.music * 100) + '%';
      G.Save.setSettings({ music: s.music });
      G.Audio.setVolumes(s.music, s.sfx);
    };
    U.el('set-sfx').value = s.sfx;
    U.el('set-sfx-val').textContent = Math.round(s.sfx * 100) + '%';
    U.el('set-sfx').oninput = function () {
      s.sfx = parseFloat(this.value);
      U.el('set-sfx-val').textContent = Math.round(s.sfx * 100) + '%';
      G.Save.setSettings({ sfx: s.sfx });
      G.Audio.setVolumes(s.music, s.sfx);
    };
    const motionBtn = U.el('set-motion');
    motionBtn.textContent = s.reducedMotion ? 'On' : 'Off';
    motionBtn.className = 'toggle' + (s.reducedMotion ? ' on' : '');
    motionBtn.onclick = function () {
      s.reducedMotion = !s.reducedMotion;
      G.Save.setSettings({ reducedMotion: s.reducedMotion });
      document.body.classList.toggle('reduced-motion', s.reducedMotion);
      motionBtn.textContent = s.reducedMotion ? 'On' : 'Off';
      motionBtn.className = 'toggle' + (s.reducedMotion ? ' on' : '');
    };
    const contrastBtn = U.el('set-contrast');
    contrastBtn.textContent = s.highContrast ? 'On' : 'Off';
    contrastBtn.className = 'toggle' + (s.highContrast ? ' on' : '');
    contrastBtn.onclick = function () {
      s.highContrast = !s.highContrast;
      G.Save.setSettings({ highContrast: s.highContrast });
      document.body.classList.toggle('high-contrast', s.highContrast);
      contrastBtn.textContent = s.highContrast ? 'On' : 'Off';
      contrastBtn.className = 'toggle' + (s.highContrast ? ' on' : '');
    };
    U.el('set-textsize').value = s.textSize;
    U.el('set-textsize').onchange = function () {
      s.textSize = this.value;
      G.Save.setSettings({ textSize: s.textSize });
      document.body.classList.toggle('text-large', s.textSize === 'large');
      document.body.classList.toggle('text-xlarge', s.textSize === 'xlarge');
    };
    U.el('set-wipe').onclick = function () {
      if (confirm('Erase all saved progress? This cannot be undone.')) {
        G.Save.wipe();
        location.reload();
      }
    };
  }

  function applySettings() {
    const s = G.Save.get().settings;
    document.body.classList.toggle('reduced-motion', s.reducedMotion);
    document.body.classList.toggle('high-contrast', s.highContrast);
    document.body.classList.toggle('text-large', s.textSize === 'large');
    document.body.classList.toggle('text-xlarge', s.textSize === 'xlarge');
    G.Audio.setVolumes(s.music, s.sfx);
  }

  function showThreeError() {
    U.el('menu-screen').innerHTML = '<div class="panel large"><h2>3D Engine Failed to Load</h2><p class="panel-sub">The game needs the Three.js library. Check your internet connection and reload the page.</p></div>';
  }

  return {
    notify: notify, discoveryToast: discoveryToast, koraSay: koraSay,
    addKoraMessage: addKoraMessage,
    openKora: openKora, closeKora: closeKora, toggleKora: toggleKora,
    initKoraPanel: initKoraPanel,
    updateObjective: updateObjective, updateHUD: updateHUD, setInteract: setInteract,
    openMap: openMap, closeMap: closeMap, toggleMap: toggleMap, drawMap: drawMap,
    travelTo: travelTo,
    openScanPanel: openScanPanel, updateScanPanel: updateScanPanel, closeScanPanel: closeScanPanel,
    openNpc: openNpc, closeNpc: closeNpc,
    openStation: openStation, closeStation: closeStation,
    initProfileScreen: initProfileScreen, getProfileChoices: getProfileChoices,
    initSettings: initSettings, applySettings: applySettings,
    showThreeError: showThreeError
  };
})();
