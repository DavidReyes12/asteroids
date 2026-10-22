'use strict';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = 800;
const H = 600;

// ── Input ─────────────────────────────────────────────────────────────────────
const keys = {};
const justPressed = {};

window.addEventListener('keydown', e => {
  justPressed[e.code] = !keys[e.code];
  keys[e.code] = true;
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code))
    e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

function pressed(code) {
  const val = justPressed[code];
  justPressed[code] = false;
  return val;
}

// ── Utils ─────────────────────────────────────────────────────────────────────
const wrap  = (v, max) => ((v % max) + max) % max;
const dist  = (a, b)   => Math.hypot(a.x - b.x, a.y - b.y);
const rand  = (min, max) => min + Math.random() * (max - min);
const randInt = (min, max) => Math.floor(rand(min, max + 1));

// ── Bullet ────────────────────────────────────────────────────────────────────
class Bullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    const SPEED = 520;
    this.vx = Math.cos(angle) * SPEED;
    this.vy = Math.sin(angle) * SPEED;
    this.ttl  = 1.1;
    this.radius = 2;
    this.dead = false;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── Asteroid ──────────────────────────────────────────────────────────────────
const RADII  = [0, 16, 30, 50];   // por tamaño 1, 2, 3
const SPEEDS = [0, 85, 55, 32];   // velocidad base por tamaño
const POINTS = [0, 100, 50, 20];  // puntos por tamaño

// Estrella fugaz (asteroide especial)
const FUGAZ_RADIUS       = 10;
const FUGAZ_SPEED_MIN    = 220;   // px/s (los normales van a 32–100)
const FUGAZ_SPEED_MAX    = 320;
const FUGAZ_TTL          = 6;     // segundos antes de desvanecerse
const FUGAZ_POINTS       = 250;
const FUGAZ_INTERVAL_MIN = 8;     // segundos de espera entre apariciones
const FUGAZ_INTERVAL_MAX = 15;

class Asteroid {
  constructor(x, y, size = 3) {
    this.x    = x;
    this.y    = y;
    this.size = size;
    this.radius = RADII[size];
    this.points = POINTS[size];
    this.dead = false;

    const angle = rand(0, Math.PI * 2);
    const speed = SPEEDS[size] + rand(-15, 15);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.rotSpeed = rand(-1.2, 1.2);
    this.rot = rand(0, Math.PI * 2);

    // Polígono irregular
    const n = randInt(8, 13);
    this.verts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = this.radius * rand(0.6, 1.0);
      this.verts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
  }

  update(dt) {
    this.x   = wrap(this.x + this.vx * dt, W);
    this.y   = wrap(this.y + this.vy * dt, H);
    this.rot += this.rotSpeed * dt;
  }

  split() {
    if (this.size <= 1) return [];
    return [
      new Asteroid(this.x, this.y, this.size - 1),
      new Asteroid(this.x, this.y, this.size - 1),
    ];
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    ctx.moveTo(this.verts[0][0], this.verts[0][1]);
    for (let i = 1; i < this.verts.length; i++)
      ctx.lineTo(this.verts[i][0], this.verts[i][1]);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

// ── Estrella fugaz (asteroide especial) ─────────────────────────────────────
// Más rápida que lo normal, sin fragmentos y se desvanece sola con el tiempo.
class EstrellaFugaz extends Asteroid {
  constructor() {
    super(1); // hereda el polígono irregular pequeño
    this.radius = FUGAZ_RADIUS;
    this.points = FUGAZ_POINTS;
    this.ttl  = FUGAZ_TTL;
    this.dead = false;

    // Entra por un borde aleatorio, cruzando la pantalla
    const lado   = randInt(0, 3);       // 0 sup, 1 der, 2 inf, 3 izq
    const margen = this.radius + 4;
    let dir;
    if      (lado === 0) { this.x = rand(0, W); this.y = -margen;      dir = Math.PI / 2  + rand(-0.4, 0.4); }
    else if (lado === 1) { this.x = W + margen; this.y = rand(0, H);  dir = Math.PI      + rand(-0.4, 0.4); }
    else if (lado === 2) { this.x = rand(0, W); this.y = H + margen;  dir = -Math.PI / 2 + rand(-0.4, 0.4); }
    else                 { this.x = -margen;      this.y = rand(0, H); dir =                  rand(-0.4, 0.4); }

    const speed = rand(FUGAZ_SPEED_MIN, FUGAZ_SPEED_MAX);
    this.vx = Math.cos(dir) * speed;
    this.vy = Math.sin(dir) * speed;
  }

  update(dt) {
    super.update(dt);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    // Parpadeo al final de su vida
    if (this.ttl < 1 && Math.floor(this.ttl * 8) % 2 === 0) return;

    // Estela: línea de brillo hacia atrás según su velocidad
    const vel = Math.hypot(this.vx, this.vy);
    ctx.strokeStyle = 'rgba(255, 210, 90, 0.5)';
    ctx.lineWidth   = 2;
    ctx.lineCap     = 'round';
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - (this.vx / vel) * 28, this.y - (this.vy / vel) * 28);
    ctx.stroke();

    // Cuerpo dorado tenue sobre la silueta base
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.strokeStyle = '#ffcc55';
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    ctx.moveTo(this.verts[0][0], this.verts[0][1]);
    for (let i = 1; i < this.verts.length; i++)
      ctx.lineTo(this.verts[i][0], this.verts[i][1]);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

// ── Skins de la nave ──────────────────────────────────────────────────────────
// Cada skin define nombre, color de trazo, color del propulsor y silueta
// (polígono de vértices). La primera es la silueta clásica del Asteroids.
const SKINS = [
  {
    nombre: 'CLÁSICA',
    color: '#fff',
    llama: 'rgba(255, 130, 0, 0.85)',
    verts: [[ 20,  0], [-12, -9], [ -7,  0], [-12,  9]],   // triángulo con muesca
  },
  {
    nombre: 'BÓLIDO',
    color: '#ff5566',
    llama: 'rgba(255, 90, 100, 0.85)',
    verts: [[ 22,  0], [-10, -6], [-16,  0], [-10,  6]],   // flecha alargada
  },
  {
    nombre: 'TÓXICA',
    color: '#66ff66',
    llama: 'rgba(90, 255, 90, 0.85)',
    verts: [[ 20,  0], [  2, -9], [-14, -11], [ -8,  0], [-14, 11], [  2,  9]], // delta con muesca doble
  },
  {
    nombre: 'FOTÓN',
    color: '#66ccff',
    llama: 'rgba(120, 220, 255, 0.85)',
    verts: [[ 20,  0], [ -4, -10], [-14, -4], [-14,  4], [ -4, 10]], // ovni puntiagudo
  },
];

// Índice de skin activa, recordado entre sesiones
let skinIndex = 0;
let skinToast = 0;   // segundos restantes para mostrar el nombre en pantalla

try {
  const guardado = parseInt(localStorage.getItem('asteroids_skin'), 10);
  if (Number.isInteger(guardado) && guardado >= 0 && guardado < SKINS.length)
    skinIndex = guardado;
} catch (e) { /* localStorage bloqueado: se usa la skin clásica */ }

function nextSkin() {
  skinIndex   = (skinIndex + 1) % SKINS.length;
  skinToast   = 1.5;
  try { localStorage.setItem('asteroids_skin', String(skinIndex)); }
  catch (e) { /* sin persistencia: la skin vale para esta sesión */ }
}

// ── Ship ──────────────────────────────────────────────────────────────────────
class Ship {
  constructor() { this.reset(); }

  reset() {
    this.x      = W / 2;
    this.y      = H / 2;
    this.angle  = -Math.PI / 2;
    this.vx     = 0;
    this.vy     = 0;
    this.radius = 12;
    this.thrusting     = false;
    this.invincible    = 3;
    this.shootCooldown = 0;
    this.speedBoost    = 0;
    this.dead          = false;
  }

  update(dt) {
    if (this.dead) return;
    if (this.invincible    > 0) this.invincible    -= dt;
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
    if (this.speedBoost    > 0) this.speedBoost    -= dt;

    const ROT   = 3.5;   // rad/s
    const THRUST = 260;  // px/s²
    const DRAG   = 0.987;
    // Power-up "Velocidad": empuje duplicado por 5 segundos
    const thrustEff = this.speedBoost > 0 ? THRUST * BOOST_MULT : THRUST;

    if (keys['ArrowLeft'])  this.angle -= ROT * dt;
    if (keys['ArrowRight']) this.angle += ROT * dt;

    this.thrusting = !!keys['ArrowUp'];
    if (this.thrusting) {
      this.vx += Math.cos(this.angle) * thrustEff * dt;
      this.vy += Math.sin(this.angle) * thrustEff * dt;
    }

    this.vx *= DRAG;
    this.vy *= DRAG;
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
  }

  tryShoot() {
    if (this.shootCooldown > 0 || this.dead) return [];
    this.shootCooldown = 0.2;
    const NOSE = 21;
    const ox = this.x + Math.cos(this.angle) * NOSE;
    const oy = this.y + Math.sin(this.angle) * NOSE;
    return [new Bullet(ox, oy, this.angle)];
  }

  draw() {
    if (this.dead) return;
    // Parpadeo durante invencibilidad de reaparición
    if (this.invincible > 0 && Math.floor(this.invincible * 8) % 2 === 0) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    const skin = SKINS[skinIndex];
    ctx.strokeStyle = skin.color;
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';

    // Silueta según la skin activa
    ctx.beginPath();
    ctx.moveTo(skin.verts[0][0], skin.verts[0][1]);
    for (let i = 1; i < skin.verts.length; i++)
      ctx.lineTo(skin.verts[i][0], skin.verts[i][1]);
    ctx.closePath();
    ctx.stroke();

    // Llama del propulsor (color de la skin; cian durante el boost de velocidad)
    if (this.thrusting && Math.random() > 0.35) {
      ctx.beginPath();
      ctx.moveTo(-8, -4);
      ctx.lineTo(-8 - rand(6, 14), 0);
      ctx.lineTo(-8,  4);
      ctx.strokeStyle = this.speedBoost > 0
        ? 'rgba(0, 200, 255, 0.85)'
        : skin.llama;
      ctx.stroke();
    }

    ctx.restore();
  }
}

// ── Partículas (explosión) ────────────────────────────────────────────────────
class Particle {
  constructor(x, y) {
    this.x  = x;
    this.y  = y;
    const angle = rand(0, Math.PI * 2);
    const speed = rand(30, 130);
    this.vx   = Math.cos(angle) * speed;
    this.vy   = Math.sin(angle) * speed;
    this.life = rand(0.4, 1.1);
    this.ttl  = this.life;
    this.dead = false;
  }

  update(dt) {
    this.x  += this.vx * dt;
    this.y  += this.vy * dt;
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    const alpha = this.ttl / this.life;
    ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.vx * 0.05, this.y - this.vy * 0.05);
    ctx.stroke();
  }
}

// ── PowerUp (Velocidad) ───────────────────────────────────────────────────────
const DROP_CHANCE = 0.15;  // probabilidad de drop al destruir un asteroide
const BOOST_TIME  = 5;     // duración del boost en segundos
const BOOST_MULT  = 2;     // multiplicador de empuje

class PowerUp {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    const angle = rand(0, Math.PI * 2);
    const speed = rand(20, 40);
    this.vx     = Math.cos(angle) * speed;
    this.vy     = Math.sin(angle) * speed;
    this.ttl    = 10;
    this.radius = 14;
    this.dead   = false;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    // Parpadeo al final de su vida
    if (this.ttl < 2 && Math.floor(this.ttl * 6) % 2 === 0) return;

    const r = this.radius;
    ctx.strokeStyle = '#ff8200';
    ctx.fillStyle   = 'rgba(255, 130, 0, 0.15)';
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';

    ctx.beginPath();
    ctx.moveTo( 0, -r);
    ctx.lineTo( r,  0);
    ctx.lineTo( 0,  r);
    ctx.lineTo(-r,  0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle   = '#ff8200';
    ctx.font        = 'bold 13px monospace';
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('V', this.x, this.y + 1);
    ctx.textBaseline = 'alphabetic';
  }
}

// ── Estado del juego ──────────────────────────────────────────────────────────
let ship, bullets, asteroids, particles, powerups;
let score, lives, level;
let state;      // 'playing' | 'dead' | 'gameover'
let deadTimer;
let fugazTimer; // cuenta atrás para la próxima estrella fugaz

function spawnAsteroids(count) {
  const SAFE_DIST = 130;
  for (let i = 0; i < count; i++) {
    let x, y;
    do {
      x = rand(0, W);
      y = rand(0, H);
    } while (Math.hypot(x - W / 2, y - H / 2) < SAFE_DIST);
    asteroids.push(new Asteroid(x, y, 3));
  }
}

function initGame() {
  ship          = new Ship();
  bullets   = [];
  asteroids = [];
  particles = [];
  powerups  = [];
  score  = 0;
  lives  = 3;
  level  = 1;
  state  = 'playing';
  fugazTimer = rand(FUGAZ_INTERVAL_MIN, FUGAZ_INTERVAL_MAX);
  spawnAsteroids(4);
}

function nextLevel() {
  level++;
  bullets   = [];
  particles = [];
  powerups  = [];
  ship.reset();
  spawnAsteroids(3 + level);
}

function explode(x, y, count = 8) {
  for (let i = 0; i < count; i++) particles.push(new Particle(x, y));
}

function killShip() {
  explode(ship.x, ship.y, 14);
  ship.dead = true;
  lives--;
  if (lives <= 0) {
    state = 'gameover';
  } else {
    state     = 'dead';
    deadTimer = 2;
  }
}

// ── Update ────────────────────────────────────────────────────────────────────
function update(dt) {
  if (skinToast > 0) skinToast -= dt;

  if (state === 'gameover') {
    if (pressed('Space')) initGame();
    particles.forEach(p => p.update(dt));
    powerups.forEach(pu => pu.update(dt));
    particles = particles.filter(p => !p.dead);
    powerups  = powerups.filter(pu => !pu.dead);
    return;
  }

  if (state === 'dead') {
    deadTimer -= dt;
    particles.forEach(p => p.update(dt));
    asteroids.forEach(a => a.update(dt));
    powerups.forEach(pu => pu.update(dt));
    particles = particles.filter(p => !p.dead);
    powerups  = powerups.filter(pu => !pu.dead);
    if (deadTimer <= 0) { state = 'playing'; ship.reset(); }
    return;
  }

  // Cambiar de skin
  if (pressed('KeyS')) nextSkin();

  // Disparar
  if (pressed('Space')) {
    bullets.push(...ship.tryShoot());
  }

  // Estrella fugaz: aparición temporizada (máximo 1 en pantalla)
  fugazTimer -= dt;
  if (fugazTimer <= 0) {
    fugazTimer = rand(FUGAZ_INTERVAL_MIN, FUGAZ_INTERVAL_MAX);
    if (!asteroids.some(a => a instanceof EstrellaFugaz))
      asteroids.push(new EstrellaFugaz());
  }

  ship.update(dt);
  bullets.forEach(b => b.update(dt));
  asteroids.forEach(a => a.update(dt));
  particles.forEach(p => p.update(dt));
  powerups.forEach(pu => pu.update(dt));

  bullets   = bullets.filter(b => !b.dead);
  particles = particles.filter(p => !p.dead);
  powerups  = powerups.filter(pu => !pu.dead);

  // Bala vs asteroide
  const newAsteroids = [];
  for (const b of bullets) {
    for (const a of asteroids) {
      if (!a.dead && !b.dead && dist(b, a) < a.radius) {
        b.dead = true;
        a.dead = true;
        score += a.points;
        explode(a.x, a.y, a.size * 5);
        newAsteroids.push(...a.split());
        // Drop del power-up "Velocidad"
        if (Math.random() < DROP_CHANCE)
          powerups.push(new PowerUp(a.x, a.y));
      }
    }
  }
  asteroids = asteroids.filter(a => !a.dead).concat(newAsteroids);
  bullets   = bullets.filter(b => !b.dead);

  // Nave vs asteroide
  if (ship.invincible <= 0) {
    for (const a of asteroids) {
      if (dist(ship, a) < ship.radius + a.radius * 0.82) {
        killShip();
        break;
      }
    }
  }

  // Nave vs power-up
  for (const pu of powerups) {
    if (dist(ship, pu) < ship.radius + pu.radius) {
      pu.dead = true;
      ship.speedBoost = BOOST_TIME;
      explode(pu.x, pu.y, 6);
    }
  }
  powerups = powerups.filter(pu => !pu.dead);

  // Nivel completado
  if (asteroids.length === 0) nextLevel();
}

// ── Draw ──────────────────────────────────────────────────────────────────────
function drawLifeIcon(x, y) {
  const skin = SKINS[skinIndex];
  const s = 0.45; // escala respecto a la silueta de la nave
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-Math.PI / 2);
  ctx.strokeStyle = skin.color;
  ctx.lineWidth   = 1.2;
  ctx.lineJoin    = 'round';
  ctx.beginPath();
  ctx.moveTo(skin.verts[0][0] * s, skin.verts[0][1] * s);
  for (let i = 1; i < skin.verts.length; i++)
    ctx.lineTo(skin.verts[i][0] * s, skin.verts[i][1] * s);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawHUD() {
  ctx.fillStyle = '#fff';
  ctx.font = '15px monospace';

  ctx.textAlign = 'left';
  ctx.fillText(`SCORE  ${score}`, 14, 26);

  ctx.textAlign = 'center';
  ctx.fillText(`NIVEL ${level}`, W / 2, 26);

  for (let i = 0; i < lives; i++)
    drawLifeIcon(W - 16 - i * 22, 18);

  if (ship.speedBoost > 0) {
    ctx.fillStyle = 'rgba(0, 200, 255, 0.9)';
    ctx.textAlign = 'left';
    ctx.fillText(`VELOCIDAD ${ship.speedBoost.toFixed(1)}s`, 14, H - 16);
  }

  // Aviso al cambiar de skin
  if (skinToast > 0) {
    const a = Math.min(1, skinToast / 0.5).toFixed(2);
    ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
    ctx.font      = 'bold 15px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`SKIN: ${SKINS[skinIndex].nombre}`, W / 2, 48);
    ctx.font = '15px monospace';
  }
}

function drawOverlay(title, sub) {
  ctx.textAlign   = 'center';
  ctx.fillStyle   = '#fff';
  ctx.font        = 'bold 46px monospace';
  ctx.fillText(title, W / 2, H / 2 - 18);
  ctx.font        = '18px monospace';
  ctx.fillStyle   = 'rgba(255,255,255,0.65)';
  ctx.fillText(sub, W / 2, H / 2 + 22);
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  particles.forEach(p => p.draw());
  powerups.forEach(pu => pu.draw());
  asteroids.forEach(a => a.draw());
  bullets.forEach(b => b.draw());
  ship.draw();

  drawHUD();

  if (state === 'gameover')
    drawOverlay('GAME OVER', `PUNTAJE: ${score}   —   ESPACIO PARA REINICIAR`);
}

// ── Loop principal ────────────────────────────────────────────────────────────
let lastTime = null;

function loop(ts) {
  const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

initGame();
requestAnimationFrame(loop);
