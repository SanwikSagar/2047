window.G = window.G || {};

G.World = (function () {
  const U = G.utils;
  let renderer, scene, camera;
  let bodies = {};
  let stations = {};
  let ship = null;
  let rover = null;
  let terrain = null;
  let terrainBody = null;
  let pois = [];
  let starField = null;
  let sunLight = null;
  let scanRing = null;
  let satelliteRef = null;
  let initialized = false;
  let time = 0;

  const bodyGroup = { current: null };

  function planetTexture(def) {
    const c = U.makeCanvas(256, 128);
    const g = c.getContext('2d');
    const base = def.color;
    g.fillStyle = base;
    g.fillRect(0, 0, 256, 128);
    const noise = U.makeNoise(def.seed);
    const img = g.getImageData(0, 0, 256, 128);
    const d = img.data;
    for (let y = 0; y <128; y++) {
      for (let x = 0; x < 256; x++) {
        const n = noise.fbm(x * 0.03, y * 0.06, 4);
        const i = (y * 256 + x) * 4;
        const f = 0.75 + n * 0.5;
        d[i] = U.clamp(d[i] * f, 0, 255);
        d[i + 1] = U.clamp(d[i + 1] * f, 0, 255);
        d[i + 2] = U.clamp(d[i + 2] * f, 0, 255);
      }
    }
    g.putImageData(img, 0, 0);
    if (def.id === 'moon' || def.id === 'mercury') {
      const rand = U.mulberry32(def.seed + 7);
      for (let i = 0; i < 40; i++) {
        const x = rand() * 256, y = rand() * 128, r = 2 + rand() * 8;
        const grad = g.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, 'rgba(60,60,66,0.55)');
        grad.addColorStop(0.7, 'rgba(90,90,96,0.25)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = grad;
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
      }
    }
    if (def.id === 'earth') {
      g.fillStyle = 'rgba(47,122,61,0.85)';
      const rand = U.mulberry32(def.seed + 13);
      for (let i = 0; i < 9; i++) {
        const x = rand() * 256, y = 20 + rand() * 88;
        g.beginPath();
        g.ellipse(x, y, 12 + rand() * 22, 7 + rand() * 12, rand() * 3, 0, Math.PI * 2);
        g.fill();
      }
      g.fillStyle = 'rgba(255,255,255,0.5)';
      for (let i = 0; i < 26; i++) {
        const x = rand() * 256, y = rand() * 128;
        g.beginPath();
        g.ellipse(x, y, 6 + rand() * 14, 2 + rand() * 4, rand() * 3, 0, Math.PI * 2);
        g.fill();
      }
    }
    if (def.id === 'mars') {
      g.fillStyle = 'rgba(138,50,16,0.5)';
      const rand = U.mulberry32(def.seed + 21);
      for (let i = 0; i < 12; i++) {
        const x = rand() * 256, y = rand() * 128;
        g.beginPath();
        g.ellipse(x, y, 10 + rand() * 20, 6 + rand() * 10, rand() * 3, 0, Math.PI * 2);
        g.fill();
      }
      g.fillStyle = 'rgba(240,240,240,0.85)';
      g.fillRect(0, 0, 256, 8);
      g.fillRect(0, 120, 256, 8);
    }
    if (def.id === 'saturn' || def.id === 'jupiter') {
      for (let y = 0; y < 128; y += 4) {
        g.fillStyle = 'rgba(' + (y % 8 === 0 ? '255,255,255' : '120,90,50') + ',0.12)';
        g.fillRect(0, y, 256, 2);
      }
    }
    const tex = new THREE.CanvasTexture(c);
    return tex;
  }

  function glowTexture(color) {
    let col = color;
    if (typeof color === 'number') {
      col = '#' + ('000000' + color.toString(16)).slice(-6);
    }
    const c = U.makeCanvas(128, 128);
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, col);
    grad.addColorStop(0.35, col + 'aa');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }

  function makeStars() {
    const count = 2200;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const rand = U.mulberry32(42);
    for (let i = 0; i < count; i++) {
      const r = 1800 + rand() * 1200;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      const b = 0.5 + rand() * 0.5;
      const tint = rand();
      col[i * 3] = b * (tint > 0.8 ? 1 : 0.9);
      col[i * 3 + 1] = b * 0.95;
      col[i * 3 + 2] = b * (tint < 0.2 ? 1 : 0.9);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({ size: 2.2, vertexColors: true, sizeAttenuation: false });
    starField = new THREE.Points(geo, mat);
    scene.add(starField);
  }

  function makeBody(def) {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({
      map: planetTexture(def),
      roughness: 0.9,
      metalness: 0.05
    });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(def.radius, 40, 28), mat);
    group.add(mesh);
    if (def.id === 'earth') {
      const atm = new THREE.Mesh(
        new THREE.SphereGeometry(def.radius * 1.06, 32, 24),
        new THREE.MeshBasicMaterial({ color: 0x4fa8ff, transparent: true, opacity: 0.14, side: THREE.BackSide })
      );
      group.add(atm);
    }
    if (def.id === 'sun') {
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTexture('#ffdd66'), transparent: true, opacity: 0.9, depthWrite: false
      }));
      glow.scale.set(def.radius * 5, def.radius * 5, 1);
      group.add(glow);
    }
    if (def.rings) {
      const ringGeo = new THREE.RingGeometry(def.radius * 1.4, def.radius * 2.3, 64);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xd8c8a0, side: THREE.DoubleSide, transparent: true, opacity: 0.55 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2.2;
      group.add(ring);
    }
    if (def.tilt) group.rotation.z = THREE.MathUtils.degToRad(def.tilt);
    scene.add(group);
    bodies[def.id] = { def: def, group: group, mesh: mesh, angle: def.angle };
    return bodies[def.id];
  }

  function makeStation(def) {
    const group = new THREE.Group();
    const hullMat = new THREE.MeshStandardMaterial({ color: 0x8a97a8, roughness: 0.5, metalness: 0.7 });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0x4fd8ff, roughness: 0.3, metalness: 0.4, emissive: 0x1a4a5c });
    const core = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 10, 12), hullMat);
    group.add(core);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(4.5, 0.7, 10, 24), hullMat);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x2a5a8a, roughness: 0.2, metalness: 0.8, emissive: 0x0a2a3a });
    for (let i = 0; i < 4; i++) {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(6, 0.15, 2.4), panelMat);
      const a = i * Math.PI / 2;
      panel.position.set(Math.cos(a) * 7, 0, Math.sin(a) * 7);
      panel.rotation.y = -a;
      group.add(panel);
    }
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffb347 }));
    beacon.position.y = 5.5;
    group.add(beacon);
    const light = new THREE.PointLight(0x4fd8ff, 0.8, 40);
    light.position.y = 3;
    group.add(light);
    scene.add(group);
    stations[def.id] = { def: def, group: group, angle: def.angle, beacon: beacon };
    return stations[def.id];
  }

  function makeShip() {
    const group = new THREE.Group();
    const hullMat = new THREE.MeshStandardMaterial({ color: 0xd8dee6, roughness: 0.35, metalness: 0.75 });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0x4fd8ff, roughness: 0.3, metalness: 0.5, emissive: 0x0e3a4a });
    const body = new THREE.Mesh(new THREE.ConeGeometry(1.1, 4.2, 12), hullMat);
    body.rotation.x = -Math.PI / 2;
    group.add(body);
    const cabin = new THREE.Mesh(new THREE.SphereGeometry(0.75, 14, 10), new THREE.MeshStandardMaterial({ color: 0x1a3a5c, roughness: 0.1, metalness: 0.9, emissive: 0x0a2a3a }));
    cabin.position.set(0, 0.55, 0.6);
    group.add(cabin);
    const wingGeo = new THREE.BoxGeometry(3.4, 0.12, 1.4);
    const wing = new THREE.Mesh(wingGeo, accentMat);
    wing.position.z = 1.1;
    group.add(wing);
    const engineMat = new THREE.MeshBasicMaterial({ color: 0x66d9ff });
    for (let i = -1; i <= 1; i += 2) {
      const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.4, 1.1, 10), hullMat);
      eng.rotation.x = Math.PI / 2;
      eng.position.set(i * 0.85, 0, 2.1);
      group.add(eng);
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.24, 1.2, 8), engineMat);
      flame.rotation.x = Math.PI / 2;
      flame.position.set(i * 0.85, 0, 3.1);
      flame.name = 'flame';
      group.add(flame);
    }
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture('#66d9ff'), transparent: true, opacity: 0.5, depthWrite: false }));
    glow.scale.set(3, 3, 1);
    glow.position.z = 2.6;
    glow.name = 'engineGlow';
    group.add(glow);
    scene.add(group);
    ship = { group: group, velocity: new THREE.Vector3(), flames: [] };
    group.traverse(function (o) { if (o.name === 'flame') ship.flames.push(o); });
    return ship;
  }

  function makeRover() {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xc8b060, roughness: 0.5, metalness: 0.6 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x3a4048, roughness: 0.7, metalness: 0.4 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 2.4), bodyMat);
    body.position.y = 0.75;
    group.add(body);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.3, 8), darkMat);
    mast.position.set(0, 1.6, -0.7);
    group.add(mast);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.2), darkMat);
    head.position.set(0, 2.25, -0.7);
    group.add(head);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x4fd8ff });
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), eyeMat);
    eye.position.set(0, 2.25, -0.58);
    group.add(eye);
    const wheelGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.24, 12);
    for (let x = -1; x <= 1; x += 2) {
      for (let z = -1; z <= 1; z += 2) {
        const w = new THREE.Mesh(wheelGeo, darkMat);
        w.rotation.z = Math.PI / 2;
        w.position.set(x * 0.95, 0.34, z * 0.85);
        w.name = 'wheel';
        group.add(w);
      }
    }
    const panel = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.06, 1.4), new THREE.MeshStandardMaterial({ color: 0x2a5a8a, roughness: 0.2, metalness: 0.8 }));
    panel.position.set(0, 1.06, 0.3);
    panel.rotation.x = -0.25;
    group.add(panel);
    group.visible = false;
    scene.add(group);
    rover = { group: group, speed: 0, heading: 0 };
    return rover;
  }

  function makeSatellite() {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0xb8c0cc, roughness: 0.4, metalness: 0.7 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 1.6), mat);
    group.add(body);
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x2a5a8a, roughness: 0.2, metalness: 0.8, emissive: 0x0a2a3a });
    for (let i = -1; i <= 1; i += 2) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.08, 1.2), panelMat);
      p.position.x = i * 2.6;
      group.add(p);
    }
    const dish = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat);
    dish.position.y = 1.1;
    dish.rotation.x = Math.PI;
    group.add(dish);
    group.position.set(30, 8, -20);
    group.userData.kind = 'satellite';
    if (bodies['earth']) bodies['earth'].group.add(group);
    else scene.add(group);
    satelliteRef = group;
    return satelliteRef;
  }
  function makeRock(scale, color) {
    const geo = new THREE.DodecahedronGeometry(scale, 0);
    const mat = new THREE.MeshStandardMaterial({ color: color || 0x8a8078, roughness: 0.95, metalness: 0.05, flatShading: true });
    const m = new THREE.Mesh(geo, mat);
    m.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    return m;
  }

  function makeMarker(color, icon) {
    const group = new THREE.Group();
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.5, 3.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x9aa4b0, roughness: 0.5, metalness: 0.6 })
    );
    pillar.position.y = 1.6;
    group.add(pillar);
    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 14, 10),
      new THREE.MeshBasicMaterial({ color: color })
    );
    orb.position.y = 3.8;
    group.add(orb);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(color), transparent: true, opacity: 0.7, depthWrite: false }));
    glow.scale.set(4, 4, 1);
    glow.position.y = 3.8;
    group.add(glow);
    const light = new THREE.PointLight(color, 0.7, 18);
    light.position.y = 3.8;
    group.add(light);
    group.userData.orb = orb;
    return group;
  }

  function makeCraterMesh(radius, depth) {
    const group = new THREE.Group();
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(radius, depth * 0.55, 8, 24),
      new THREE.MeshStandardMaterial({ color: 0x6a645c, roughness: 1 })
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.y = depth * 0.2;
    group.add(rim);
    const bowl = new THREE.Mesh(
      new THREE.CircleGeometry(radius, 24),
      new THREE.MeshStandardMaterial({ color: 0x55504a, roughness: 1 })
    );
    bowl.rotation.x = -Math.PI / 2;
    bowl.position.y = -depth;
    group.add(bowl);
    return group;
  }

  function terrainHeight(bodyId, x, z) {
    const def = G.PLANETS[bodyId];
    const noise = U.makeNoise(def.seed + 555);
    let h = noise.fbm(x * 0.012, z * 0.012, 4) * 6 - 2;
    h += noise.fbm(x * 0.05, z * 0.05, 2) * 1.2;
    const rand = U.mulberry32(def.seed + 999);
    const craters = [];
    for (let i = 0; i < 7; i++) {
      craters.push({ x: (rand() - 0.5) * 320, z: (rand() - 0.5) * 320, r: 8 + rand() * 16, d: 1 + rand() * 2 });
    }
    for (let i = 0; i < craters.length; i++) {
      const c = craters[i];
      const d = U.dist(x, z, c.x, c.z);
      if (d < c.r) {
        const t = d / c.r;
        h += (Math.cos(t * Math.PI) * 0.5 + 0.5) * c.d * 0.6 - (1 - t) * c.d * 0.4;
      } else if (d < c.r * 1.4) {
        const t = (d - c.r) / (c.r * 0.4);
        h += (1 - t) * c.d * 0.35;
      }
    }
    if (bodyId === 'mars') {
      const channel = Math.abs(z - Math.sin(x * 0.02) * 40);
      if (channel < 14) h -= (1 - channel / 14) * 3.5;
    }
    return h;
  }

  function buildTerrain(bodyId) {
    removeTerrain();
    const def = G.PLANETS[bodyId];
    const size = 400, segs = 110;
    const geo = new THREE.PlaneGeometry(size, size, segs, segs);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      pos.setY(i, terrainHeight(bodyId, x, z));
    }
    geo.computeVertexNormals();
    const baseColor = bodyId === 'mars' ? '#b06038' : '#9a948c';
    const mat = new THREE.MeshStandardMaterial({ color: baseColor, roughness: 1, metalness: 0 });
    terrain = new THREE.Mesh(geo, mat);
    terrainBody = bodyId;
    scene.add(terrain);
    buildPOIs(bodyId);
  }

  function groundY(x, z) {
    return terrainHeight(terrainBody, x, z);
  }

  function buildPOIs(bodyId) {
    clearPOIs();
    const rand = U.mulberry32(G.PLANETS[bodyId].seed + 31337);
    const add = function (obj, id, kind, name, x, z, knowledgeId) {
      const y = terrainHeight(bodyId, x, z);
      obj.position.set(x, y, z);
      scene.add(obj);
      pois.push({ obj: obj, id: id, kind: kind, name: name, knowledgeId: knowledgeId, radius: 5, scanned: false });
    };
    if (bodyId === 'moon') {
      const crater = makeCraterMesh(7, 2.2);
      add(crater, 'crater', 'crater', 'Impact Crater', 40, -30, 'moon.craters');
      const apollo = makeMarker(0xffd23f);
      add(apollo, 'apollo_marker', 'apollo_marker', 'Apollo 11 Historical Marker', -55, 45, 'apollo11');
      const ch1 = makeMarker(0x4fd8ff);
      add(ch1, 'ch1_marker', 'ch1_marker', 'Chandrayaan-1 Capsule', 70, 55, 'chandrayaan1');
      const ch2 = makeMarker(0x5dffa0);
      add(ch2, 'ch2_marker', 'ch2_marker', 'Chandrayaan-2 Capsule', -20, 80, 'chandrayaan2');
      const ch3 = makeMarker(0xffb347);
      add(ch3, 'ch3_marker', 'ch3_marker', 'Chandrayaan-3 Capsule', 90, -60, 'chandrayaan3');
      for (let i = 0; i < 10; i++) {
        const rock = makeRock(0.5 + rand() * 1.2);
        add(rock, 'rock_' + i, 'rock', 'Lunar Rock', (rand() - 0.5) * 300, (rand() - 0.5) * 300, 'moon.maria');
      }
    } else if (bodyId === 'mars') {
      const channel = makeMarker(0x5dffa0, true);
      add(channel, 'channel', 'channel', 'Dry River Channel', 35, 20, 'mars.water');
      const rock = makeMarker(0xffb347, true);
      add(rock, 'layered_rock', 'layered_rock', 'Layered Rock Formation', -45, -50, 'mars.rovers');
      const console_ = makeMarker(0x4fd8ff, true);
      add(console_, 'console', 'console', 'Evidence Console', 0, 0, 'science.method');
      for (let i = 0; i < 10; i++) {
        const r = makeRock(0.5 + rand() * 1.4, 0xa06040);
        add(r, 'mrock_' + i, 'rock', 'Martian Rock', (rand() - 0.5) * 300, (rand() - 0.5) * 300, 'mars.color');
      }
    }
  }

  function clearPOIs() {
    for (let i = 0; i < pois.length; i++) {
      scene.remove(pois[i].obj);
    }
    pois = [];
  }

  function removeTerrain() {
    if (terrain) {
      scene.remove(terrain);
      terrain.geometry.dispose();
      terrain.material.dispose();
      terrain = null;
      terrainBody = null;
    }
    clearPOIs();
  }

  function init(canvas) {
    if (initialized) return;
    if (!window.THREE) {
      G.UI.showThreeError();
      return;
    }
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x02040a);
    scene.fog = new THREE.FogExp2(0x02040a, 0.00045);
    camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 6000);
    camera.position.set(0, 30, 60);
    sunLight = new THREE.PointLight(0xfff2dd, 1.6, 0, 0);
    scene.add(sunLight);
    scene.add(new THREE.AmbientLight(0x334455, 0.7));
    const fill = new THREE.DirectionalLight(0x8899bb, 0.35);
    fill.position.set(-1, 0.5, -1);
    scene.add(fill);
    makeStars();
    const ids = Object.keys(G.PLANETS);
    for (let i = 0; i < ids.length; i++) makeBody(G.PLANETS[ids[i]]);
    const stIds = Object.keys(G.STATIONS);
    for (let i = 0; i < stIds.length; i++) makeStation(G.STATIONS[stIds[i]]);
    makeShip();
    makeRover();
    makeSatellite();
    scanRing = new THREE.Mesh(
      new THREE.RingGeometry(1.8, 2, 32),
      new THREE.MeshBasicMaterial({ color: 0x4fd8ff, transparent: true, opacity: 0, side: THREE.DoubleSide })
    );
    scene.add(scanRing);
    initialized = true;
    window.addEventListener('resize', onResize);
  }

  function onResize() {
    if (!renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function update(dt) {
    if (!initialized) return;
    time += dt;
    const ids = Object.keys(bodies);
    for (let i = 0; i < ids.length; i++) {
      const b = bodies[ids[i]];
      b.angle += b.def.speed * dt;
      let x, z;
      if (b.def.parent) {
        const p = bodies[b.def.parent];
        const px = Math.cos(p.angle) * p.def.distance;
        const pz = Math.sin(p.angle) * p.def.distance;
        x = px + Math.cos(b.angle) * b.def.distance;
        z = pz + Math.sin(b.angle) * b.def.distance;
      } else {
        x = Math.cos(b.angle) * b.def.distance;
        z = Math.sin(b.angle) * b.def.distance;
      }
      b.group.position.set(x, 0, z);
      b.mesh.rotation.y += dt * 0.05;
      b.worldPos = new THREE.Vector3(x, 0, z);
    }
    const stIds = Object.keys(stations);
    for (let i = 0; i < stIds.length; i++) {
      const s = stations[stIds[i]];
      s.angle += s.def.speed * dt;
      const p = bodies[s.def.parent];
      const px = p.group.position.x, pz = p.group.position.z;
      s.group.position.set(px + Math.cos(s.angle) * s.def.distance, 0, pz + Math.sin(s.angle) * s.def.distance);
      s.group.rotation.y += dt * 0.1;
      s.worldPos = s.group.position;
      if (s.beacon) s.beacon.material.color.setHex(Math.sin(time * 4) > 0 ? 0xffb347 : 0x8a5a20);
    }
    if (starField) starField.rotation.y += dt * 0.002;
    for (let i = 0; i < pois.length; i++) {
      const o = pois[i];
      if (o.obj.userData.orb) {
        o.obj.userData.orb.position.y = 3.8 + Math.sin(time * 2 + i) * 0.25;
      }
    }
    if (scanRing) {
      scanRing.material.opacity = Math.max(0, scanRing.material.opacity - dt * 1.5);
      scanRing.rotation.z += dt * 2;
    }
  }

  function pulseScanRing(pos, color) {
    scanRing.position.copy(pos);
    scanRing.material.color.setHex(color || 0x4fd8ff);
    scanRing.material.opacity = 0.9;
  }

  function nearestBody(pos, maxDist) {
    let best = null, bestD = maxDist || 60;
    const ids = Object.keys(bodies);
    for (let i = 0; i < ids.length; i++) {
      const b = bodies[ids[i]];
      if (!b.worldPos) continue;
      const d = pos.distanceTo(b.worldPos) - b.def.radius;
      if (d < bestD) { bestD = d; best = b; }
    }
    return best ? { body: best, dist: bestD } : null;
  }

  function nearestStation(pos, maxDist) {
    let best = null, bestD = maxDist || 30;
    const ids = Object.keys(stations);
    for (let i = 0; i < ids.length; i++) {
      const s = stations[ids[i]];
      if (!s.worldPos) continue;
      const d = pos.distanceTo(s.worldPos);
      if (d < bestD) { bestD = d; best = s; }
    }
    return best ? { station: best, dist: bestD } : null;
  }

  function nearestPOI(pos, maxDist) {
    let best = null, bestD = maxDist || 25;
    for (let i = 0; i < pois.length; i++) {
      const p = pois[i];
      const d = pos.distanceTo(p.obj.position);
      if (d < bestD) { bestD = d; best = p; }
    }
    return best ? { poi: best, dist: bestD } : null;
  }

  function satellite() {
    return satelliteRef;
  }

  return {
    init: init, update: update,
    get scene() { return scene; },
    get camera() { return camera; },
    get renderer() { return renderer; },
    get ship() { return ship; },
    get rover() { return rover; },
    get bodies() { return bodies; },
    get stations() { return stations; },
    get pois() { return pois; },
    get terrainBody() { return terrainBody; },
    buildTerrain: buildTerrain, removeTerrain: removeTerrain,
    groundY: groundY, terrainHeight: terrainHeight,
    pulseScanRing: pulseScanRing,
    nearestBody: nearestBody, nearestStation: nearestStation, nearestPOI: nearestPOI,
    satellite: satellite,
    isReady: function () { return initialized; }
  };
})();
