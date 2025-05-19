let particles = [];
let previousMouse;
let attracting = false;
let releasedBurst = false;
let freezeTimer = 0;
let frozen = false;

const normalMagnetStrength = 0.1;
const clickMagnetStrength = 2.0;
const damping = 0.90;
const frozenDamping = 0.5;

const bounds = 300;
let attractStartTime = 0;
const attractDuration = 2000;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();
  colorMode(HSB, 360, 255, 255);
  initializeParticles();
  previousMouse = createVector(mouseX, mouseY);
}

function initializeParticles() {
  particles = [];
  for (let i = 0; i < 1000; i++) {
    let p = new Particle(
      random(-bounds, bounds),
      random(-bounds, bounds),
      random(-bounds, bounds)
    );
    p.targetPos = null; // Reset target on re-initialization
    particles.push(p);
  }
}

function draw() {
  background(240, 20, 30, 40);
  orbitControl();

  drawBoxWireframe(bounds * 2);

  ambientLight(80);
  pointLight(255, 255, 255, 0, 0, 300);

  let currentMouse = createVector(mouseX - width / 2, mouseY - height / 2, 0);
  let mouseVelocity = p5.Vector.sub(currentMouse, previousMouse);

  if (releasedBurst && !frozen) {
    if (millis() - freezeTimer > 1500) {
      frozen = true;
    }
  }

  for (let p of particles) {
    p.update();
    p.interact(currentMouse, mouseVelocity);
    p.bounce();
    p.show(currentMouse);
  }

  previousMouse = currentMouse.copy();
}

function drawBoxWireframe(size) {
  push();
  noFill();
  stroke(255, 80);
  strokeWeight(1);
  box(size);
  pop();
}

class Particle {
  constructor(x, y, z) {
    this.pos = createVector(x, y, z);
    this.vel = createVector(0, 0, 0);
    this.acc = createVector(0, 0, 0);
    this.baseSize = random(2, 4);
    this.greyTone = random(150, 220);
    this.targetPos = null; // For final disperse target
  }

  applyForce(force) {
    this.acc.add(force);
  }

  interact(mousePos, mouseVel) {
    let dir = p5.Vector.sub(mousePos, this.pos);
    let dist = dir.mag();
    dir.normalize();

    if (attracting) {
      let elapsed = millis() - attractStartTime;
      let strength = constrain(elapsed / attractDuration, 0, 1) * clickMagnetStrength;
      let attraction = dir.copy();
      attraction.mult(strength * 200 / max(dist, 10));
      this.applyForce(attraction);
      releasedBurst = false;
      frozen = false;
      this.targetPos = null; // Reset target
    } else if (releasedBurst && !frozen) {
      if (!this.targetPos) {
        this.targetPos = createVector(
          random(-bounds, bounds),
          random(-bounds, bounds),
          random(-bounds, bounds)
        );
      }
      let toTarget = p5.Vector.sub(this.targetPos, this.pos);
      toTarget.mult(0.05); // Smooth move
      this.applyForce(toTarget);
    } else if (!attracting && !releasedBurst) {
      if (dist < 400) {
        let subtleAttraction = dir.copy();
        subtleAttraction.mult(normalMagnetStrength * 200 / constrain(dist * dist, 50, 50000));
        this.applyForce(subtleAttraction);
      }
    }

    let mouseInfluence = mouseVel.copy();
    mouseInfluence.mult(0.02);
    this.applyForce(mouseInfluence);
  }

  bounce() {
    if (abs(this.pos.x) > bounds) {
      this.pos.x = constrain(this.pos.x, -bounds, bounds);
      this.vel.x *= -0.8;
    }
    if (abs(this.pos.y) > bounds) {
      this.pos.y = constrain(this.pos.y, -bounds, bounds);
      this.vel.y *= -0.8;
    }
    if (abs(this.pos.z) > bounds) {
      this.pos.z = constrain(this.pos.z, -bounds, bounds);
      this.vel.z *= -0.8;
    }
  }

  update() {
    this.vel.add(this.acc);
    this.vel.mult(frozen ? frozenDamping : damping);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  show(mousePos) {
    let d = dist(this.pos.x, this.pos.y, this.pos.z, mousePos.x, mousePos.y, mousePos.z);
    let size = this.baseSize + map(d, 0, 400, 5, -2);

    push();
    translate(this.pos.x, this.pos.y, this.pos.z);

    if (random(1) < 0.4) {
      ambientMaterial(this.greyTone);
      emissiveMaterial(this.greyTone);
    } else {
      let hue = map(d, 0, 800, 180, 240);
      ambientMaterial(hue, 200, 255);
      emissiveMaterial(hue, 200, 255);
    }

    sphere(max(size, 1.5));
    pop();
  }
}

function mousePressed() {
  attracting = true;
  attractStartTime = millis();
  releasedBurst = false;
  frozen = false;
}

function mouseReleased() {
  attracting = false;
  releasedBurst = true;
  freezeTimer = millis();
}

function doubleClicked() {
  initializeParticles();
  releasedBurst = false;
  frozen = false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}