window.G = window.G || {};

G.Ship = (function () {
  const U = G.utils;
  const keys = {};
  let camYaw = 0, camPitch = 0.35, camDist = 16;
  let dragging = false, lastX = 0, lastY = 0;
  let active = false;
  let thrustSndTimer = 0;
  let onFirstMove = null;
  let moved = false;

  function bind(canvas) {
    window.addEventListener('keydown', function (e) {
      keys[e.code] = true;
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(e.code) >= 0) {
        if (active) e.preventDefault();
      }
    });
    window.addEventListener('keyup', function (e) { keys[e.code] = false; });
    canvas.addEventListener('mousedown', function (e) {
      if (!active) return;
      dragging = true; lastX = e.clientX; lastY = e.clientY;
    });
    window.addEventListener('mouseup', function () { dragging = false; });
    window.addEventListener('mousemove', function (e) {
      if (!active || !dragging) return;
      camYaw -= (e.clientX - lastX) * 0.005;
      camPitch = U.clamp(camPitch + (e.clientY - lastY) * 0.004, -0.2, 1.2);
      lastX = e.clientX; lastY = e.clientY;
    });
    canvas.addEventListener('wheel', function (e) {
      if (!active) return;
      camDist = U.clamp(camDist + e.deltaY * 0.02, 8, 60);
    }, { passive: true });
  }

  function activate() { active = true; }
  function deactivate() { active = false; }

  function update(dt) {
    const ship = G.World.ship;
    if (!ship) return;
    const group = ship.group;
    const accel = 26;
    const fwd = new THREE.Vector3(-Math.sin(camYaw), 0, -Math.cos(camYaw));
    const right = new THREE.Vector3(-fwd.z, 0, fwd.x);
    const up = new THREE.Vector3(0, 1, 0);
    let thrusting = false;

    if (active) {
      if (keys['KeyW'] || keys['ArrowUp']) { ship.velocity.addScaledVector(fwd, accel * dt); thrusting = true; }
      if (keys['KeyS'] || keys['ArrowDown']) { ship.velocity.addScaledVector(fwd, -accel * 0.6 * dt); thrusting = true; }
      if (keys['KeyA'] || keys['ArrowLeft']) { ship.velocity.addScaledVector(right, -accel * 0.7 * dt); thrusting = true; }
      if (keys['KeyD'] || keys['ArrowRight']) { ship.velocity.addScaledVector(right, accel * 0.7 * dt); thrusting = true; }
      if (keys['KeyR']) { ship.velocity.addScaledVector(up, accel * 0.5 * dt); thrusting = true; }
      if (keys['KeyF']) { ship.velocity.addScaledVector(up, -accel * 0.5 * dt); thrusting = true; }
      if (keys['Space']) { ship.velocity.multiplyScalar(Math.max(0, 1 - dt * 3)); }
    }

    ship.velocity.multiplyScalar(Math.max(0, 1 - dt * 0.35));
    const maxSpeed = 42;
    if (ship.velocity.length() > maxSpeed) ship.velocity.setLength(maxSpeed);
    group.position.addScaledVector(ship.velocity, dt);

    const speed = ship.velocity.length();
    const targetQ = new THREE.Quaternion();
    if (speed > 0.5) {
      const look = group.position.clone().add(ship.velocity);
      const m = new THREE.Matrix4().lookAt(group.position, look, up);
      targetQ.setFromRotationMatrix(m);
    }
    group.quaternion.slerp(targetQ, Math.min(1, dt * 4));

    const flameScale = 0.6 + Math.min(1.5, speed / 20);
    for (let i = 0; i < ship.flames.length; i++) {
      ship.flames[i].scale.set(1, 1, flameScale * (0.9 + Math.random() * 0.2));
      ship.flames[i].visible = speed > 1;
    }

    thrustSndTimer -= dt;
    if (thrusting && thrustSndTimer <= 0) {
      G.Audio.play('thruster');
      thrustSndTimer = 0.28;
    }

    if (thrusting && !moved) {
      moved = true;
      if (onFirstMove) onFirstMove();
    }

    const cam = G.World.camera;
    const cx = group.position.x + Math.sin(camYaw) * Math.cos(camPitch) * camDist;
    const cy = group.position.y + Math.sin(camPitch) * camDist + 2;
    const cz = group.position.z + Math.cos(camYaw) * Math.cos(camPitch) * camDist;
    cam.position.lerp(new THREE.Vector3(cx, cy, cz), Math.min(1, dt * 5));
    cam.lookAt(group.position.x, group.position.y + 1, group.position.z);

    const near = G.World.nearestBody(group.position, 90);
    return { speed: speed, nearBody: near };
  }

  function position() {
    return G.World.ship.group.position;
  }

  function teleport(x, y, z) {
    G.World.ship.group.position.set(x, y, z);
    G.World.ship.velocity.set(0, 0, 0);
  }

  function setFirstMoveCb(cb) { onFirstMove = cb; }

  return {
    bind: bind, activate: activate, deactivate: deactivate, update: update,
    position: position, teleport: teleport, setFirstMoveCb: setFirstMoveCb,
    isMoving: function () { return moved; }
  };
})();
