window.G = window.G || {};

G.Rover = (function () {
  const U = G.utils;
  const keys = {};
  let active = false;
  let camYaw = 0, camPitch = 0.5, camDist = 14;
  let dragging = false, lastX = 0, lastY = 0;
  let wheelSpin = 0;

  function bind(canvas) {
    canvas.addEventListener('mousedown', function (e) {
      if (!active) return;
      dragging = true; lastX = e.clientX; lastY = e.clientY;
    });
    window.addEventListener('mouseup', function () { dragging = false; });
    window.addEventListener('mousemove', function (e) {
      if (!active || !dragging) return;
      camYaw -= (e.clientX - lastX) * 0.005;
      camPitch = U.clamp(camPitch + (e.clientY - lastY) * 0.004, 0.1, 1.3);
      lastX = e.clientX; lastY = e.clientY;
    });
    canvas.addEventListener('wheel', function (e) {
      if (!active) return;
      camDist = U.clamp(camDist + e.deltaY * 0.02, 7, 40);
    }, { passive: true });
  }

  function activate() { active = true; }
  function deactivate() { active = false; }

  function place(x, z) {
    const rover = G.World.rover;
    const y = G.World.groundY(x, z);
    rover.group.position.set(x, y, z);
    rover.group.visible = true;
    rover.speed = 0;
    rover.heading = 0;
  }

  function hide() {
    G.World.rover.group.visible = false;
  }

  function update(dt) {
    const rover = G.World.rover;
    if (!rover || !rover.group.visible) return null;
    const group = rover.group;
    const maxSpeed = 14;
    let accel = 0;

    if (active) {
      if (keys['KeyW'] || keys['ArrowUp']) accel = 16;
      if (keys['KeyS'] || keys['ArrowDown']) accel = -10;
      if (keys['KeyA'] || keys['ArrowLeft']) rover.heading += dt * 1.8;
      if (keys['KeyD'] || keys['ArrowRight']) rover.heading -= dt * 1.8;
    }

    rover.speed += accel * dt;
    rover.speed *= Math.max(0, 1 - dt * 2.2);
    rover.speed = U.clamp(rover.speed, -maxSpeed * 0.5, maxSpeed);

    const dx = Math.sin(rover.heading) * rover.speed * dt;
    const dz = Math.cos(rover.heading) * rover.speed * dt;
    const nx = group.position.x + dx;
    const nz = group.position.z + dz;
    const curY = group.position.y;
    const newY = G.World.groundY(nx, nz);
    const slope = Math.abs(newY - curY);
    if (slope < 2.5) {
      group.position.x = nx;
      group.position.z = nz;
      group.position.y = U.lerp(curY, newY, Math.min(1, dt * 8));
    } else {
      rover.speed *= 0.5;
    }

    group.rotation.y = rover.heading;
    wheelSpin += rover.speed * dt * 2;
    group.children.forEach(function (c) {
      if (c.name === 'wheel') c.rotation.x = wheelSpin;
    });

    const cam = G.World.camera;
    const cx = group.position.x + Math.sin(camYaw) * Math.cos(camPitch) * camDist;
    const cy = group.position.y + Math.sin(camPitch) * camDist + 2;
    const cz = group.position.z + Math.cos(camYaw) * Math.cos(camPitch) * camDist;
    cam.position.lerp(new THREE.Vector3(cx, cy, cz), Math.min(1, dt * 5));
    cam.lookAt(group.position.x, group.position.y + 1.5, group.position.z);

    const near = G.World.nearestPOI(group.position, 20);
    return { speed: Math.abs(rover.speed), nearPOI: near };
  }

  function position() {
    return G.World.rover.group.position;
  }

  function down(e) { keys[e.code] = true; }
  function up(e) { keys[e.code] = false; }

  return {
    bind: bind, activate: activate, deactivate: deactivate,
    update: update, place: place, hide: hide, position: position,
    down: down, up: up
  };
})();
