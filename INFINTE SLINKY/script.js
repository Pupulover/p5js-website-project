let trail = [];
let snappedTrails = [];
let freeDrawTrails = [];
let isSnapping = false;
let snapProgress = 0;
const snapSpeed = 0.05;
let resetButton, undoButton, modeFreeDrawBtn, modeSnapBtn;
let resetButtonBounds;
let currentSize = 30;
let drawMode = "snap"; // "snap" or "free"

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);

  // Reset Button
  resetButton = createButton('Reset');
  resetButton.position(40, 170);
  resetButton.mousePressed(() => {
    trail = [];
    snappedTrails = [];
    freeDrawTrails = [];
    isSnapping = false;
  });

  // Undo Button
  undoButton = createButton('Undo');
  undoButton.position(110, 170);
  undoButton.mousePressed(() => {
    if (drawMode === "snap" && snappedTrails.length > 0) {
      snappedTrails.pop();
    } else if (drawMode === "free" && freeDrawTrails.length > 0) {
      freeDrawTrails.pop();
    }
  });

  // Mode Buttons
  modeSnapBtn = createButton('Snapping Mode');
  modeSnapBtn.position(180, 170);
  modeSnapBtn.mousePressed(() => {
    drawMode = "snap";
  });

  modeFreeDrawBtn = createButton('Free Draw Mode');
  modeFreeDrawBtn.position(310, 170);
  modeFreeDrawBtn.mousePressed(() => {
    drawMode = "free";
  });

  // Safe zones for all buttons
  resetButtonBounds = [
    { x: 10, y: 10, w: 80, h: 30 },
    { x: 100, y: 10, w: 70, h: 30 },
    { x: 180, y: 10, w: 120, h: 30 },
    { x: 310, y: 10, w: 140, h: 30 }
  ];
}

function draw() {
  background(0);

  // Draw snapped cylinders
  for (let snapped of snappedTrails) {
    push();
    translate(snapped.x, snapped.y);
    rotate(snapped.angle);
    for (let p of snapped.points) {
      noFill();
      stroke(255);
      strokeWeight(0.7);
      ellipse(p.x, p.y, p.size, p.size);
    }
    pop();
  }

  // Draw free draw trails
  for (let trail of freeDrawTrails) {
    for (let p of trail) {
      noFill();
      stroke(255);
      strokeWeight(0.7);
      ellipse(p.x, p.y, p.size, p.size);
    }
  }

  // While dragging
  if (mouseIsPressed && !isSnapping && !inAnySafeZone(mouseX, mouseY)) {
    trail.push({
      x: mouseX,
      y: mouseY,
      size: currentSize
    });
  }

  // Draw current trail
  for (let p of trail) {
    noFill();
    stroke(255);
    strokeWeight(0.7);
    ellipse(p.x, p.y, p.size, p.size);
  }

  // Animate snapping
  if (isSnapping) {
    snapProgress += snapSpeed;
    for (let i = 0; i < trail.length; i++) {
      let p = trail[i];
      let targetX = 0;
      let targetY = (i - trail.length / 2) * 4;
      p.x = lerp(p.x, targetX, snapProgress);
      p.y = lerp(p.y, targetY, snapProgress);
    }

    if (snapProgress >= 1) {
      snappedTrails.push({
        points: trail.map(p => ({ ...p })),
        x: random(width * 0.2, width * 0.8),
        y: random(height * 0.2, height * 0.8),
        angle: random(TWO_PI)
      });

      trail = [];
      isSnapping = false;
    }
  }
}

function mousePressed() {
  if (!inAnySafeZone(mouseX, mouseY)) {
    currentSize = random(20, 60);
  }
}

function mouseReleased() {
  if (trail.length > 0 && !inAnySafeZone(mouseX, mouseY)) {
    if (drawMode === "snap") {
      isSnapping = true;
      snapProgress = 0;

      for (let i = 0; i < trail.length; i++) {
        trail[i].x -= width / 2;
        trail[i].y -= height / 2;
      }
    } else if (drawMode === "free") {
      freeDrawTrails.push([...trail]);
      trail = [];
    }
  }
}

function inAnySafeZone(x, y) {
  for (let zone of resetButtonBounds) {
    if (x > zone.x && x < zone.x + zone.w && y > zone.y && y < zone.y + zone.h) {
      return true;
    }
  }
  return false;
}