let splatters = [];
let cloth;
let isDragging = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  frameRate(60);
  cloth = new Cloth(150, 150, 150, 150);
}

function draw() {
  background(0);

  // Generate new splatters
  if (frameCount % 10 === 0) {
    splatters.push(new Splatter(random(width), random(height)));
  }

  // Update splatters
  for (let i = splatters.length - 1; i >= 0; i--) {
    let splat = splatters[i];
    splat.update();
    splat.display();
    splat.showRipple();

    if (cloth.overlaps(splat)) {
      splat.showBurst();
      splatters.splice(i, 1);
    } else if (splat.alpha <= 0) {
      splatters.splice(i, 1);
    }
  }

  // Update & draw cloth
  cloth.update();
  cloth.display();
}

class Cloth {
  constructor(x, y, w, h) {
    this.pos = createVector(x, y);
    this.target = this.pos.copy();
    this.w = w;
    this.h = h;
    this.dragOffset = createVector(0, 0);
  }

  update() {
    if (isDragging) {
      this.target.set(mouseX + this.dragOffset.x, mouseY + this.dragOffset.y);
    }
    this.pos.lerp(this.target, 0.2);
  }

  display() {
    fill(100, 100, 255, 80);
    rect(this.pos.x, this.pos.y, this.w, this.h, 10);
  }

  overlaps(splatter) {
    return (
      this.pos.x < splatter.x + splatter.radius &&
      this.pos.x + this.w > splatter.x - splatter.radius &&
      this.pos.y < splatter.y + splatter.radius &&
      this.pos.y + this.h > splatter.y - splatter.radius
    );
  }

  startDrag(mx, my) {
    isDragging = true;
    this.dragOffset.set(this.pos.x - mx, this.pos.y - my);
  }

  stopDrag() {
    isDragging = false;
  }
}

class Splatter {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = random(5, 30); // realistic droplet sizes
    this.alpha = 255;
    this.fadeSpeed = random(0.3, 0.7);
    this.ripples = 0;
    this.particles = [];

    let count = int(map(this.radius, 5, 30, 3, 20));
    for (let i = 0; i < count; i++) {
      let angle = random(TWO_PI);
      let speed = random(0.5, 2);
      let offset = random(2, this.radius);
      let wind = createVector(1.2, 0);
      let velocity = p5.Vector.fromAngle(angle).mult(speed).add(wind);
      let pos = createVector(
        this.x + cos(angle) * offset,
        this.y + sin(angle) * offset
      );
      this.particles.push(new Particle(pos, velocity));
    }

    this.glowPulse = 0;
  }

  update() {
    this.alpha -= this.fadeSpeed;
    this.glowPulse = sin(frameCount * 0.2) * 20 + 20;
    this.ripples++;

    for (let p of this.particles) {
      p.update();
    }
  }

  display() {
    fill(180, 200, 255, this.alpha / 2 + this.glowPulse);
    ellipse(this.x, this.y, this.radius);

    for (let p of this.particles) {
      p.display(this.alpha);
    }
  }

  showRipple() {
    if (this.ripples < 15) {
      noFill();
      stroke(180, 200, 255, 100 - this.ripples * 5);
      strokeWeight(1);
      ellipse(this.x, this.y, this.radius + this.ripples * 2);
      noStroke();
    }
  }

  showBurst() {
    for (let i = 0; i < 10; i++) {
      let a = random(TWO_PI);
      let r = random(5, 20);
      let px = this.x + cos(a) * r;
      let py = this.y + sin(a) * r;
      fill(255, 255, 255, 150);
      ellipse(px, py, 4);
    }
  }
}

class Particle {
  constructor(pos, vel) {
    this.pos = pos.copy();
    this.vel = vel;
    this.size = random(3, 8);
    this.alpha = 255;
  }

  update() {
    this.pos.add(this.vel);
    this.vel.mult(0.95);
    this.alpha -= 2;
  }

  display(parentAlpha) {
    fill(180, 200, 255, min(this.alpha, parentAlpha));
    ellipse(this.pos.x, this.pos.y, this.size);
  }
}

function mousePressed() {
  cloth.startDrag(mouseX, mouseY);
}

function mouseReleased() {
  cloth.stopDrag();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}