const W = 860, H = 450;           
const FX = 40, FY = 80, FW = 780, FH = 340; 

const TILE = 30;
const GAP  = 8;

const F_SIZE = 40;
const SPEED  = 4;
let fX = FX + 10, fY = FY + 10;

let tiles = [];

let recovered = 0;
const GOAL = 20;
let lastSpawn = 0;
let SPAWN_MS = 800;
let MAX_YELLOW = 6;

let fieldImg, farmerImg, barnImg, cowImg, buttonImg;
let res = 6;  
let edge = 860;
let particles = [];

let farmerX = 140, farmerY = 160;
let barnX = 480, barnY = 130;
let cowX = 330, cowY = 280;

let moveStep = 4; 
let scene = 0; 

let btnX, btnY, btnW = 160, btnH = 150;

function preload() {
  fieldImg  = loadImage('field.PNG');
  farmerImg = loadImage('farmer.png');
  barnImg   = loadImage('barn.png');
  cowImg    = loadImage('cow.png');
  buttonImg = loadImage('button.png');
}


function setup() {
  createCanvas(W, H);
  rectMode(CORNER);
  noStroke();
  textAlign(CENTER, CENTER);

  initGrid();
  resetGame();
  
  pixelDensity(1);
  rectMode(CORNER);
  noStroke();

  textSize(32);
  textAlign(CENTER, CENTER);

  fieldImg.resize(width, height);
  farmerImg.resize(220, 0);
  barnImg.resize(280, 0);
  cowImg.resize(160, 0);

  btnX = width / 2 - btnW / 2;
  btnY = height / 2 - btnH / 2;

  spawnPixels();
}

function draw() {
  background(117, 72, 32);
  if (scene === 0) {
    drawFarmScene();
  } else if (scene === 1) {
    farmGame();
  }  
}

// Game Screen
function farmGame(){
  fill(255);
  textSize(36);
  text("Farmer Field", width/2, 32);
  textSize(16);
  text(`Recovered: ${recovered}/${GOAL}`, width/2, 56);

  if (millis() - lastSpawn > SPAWN_MS && countYellow() < MAX_YELLOW && recovered < GOAL) {
    makeRandomYellow();
    lastSpawn = millis();
  }

  drawTiles();

  if (keyIsDown(LEFT_ARROW))  fX -= SPEED;
  if (keyIsDown(RIGHT_ARROW)) fX += SPEED;
  if (keyIsDown(UP_ARROW))    fY -= SPEED;
  if (keyIsDown(DOWN_ARROW))  fY += SPEED;

  fX = constrain(fX, FX, FX + FW - F_SIZE);
  fY = constrain(fY, FY, FY + FH - F_SIZE);

  // Draw farmer 
  const FARMER_SIZE = 60; 
  image(farmerImg, fX, fY, FARMER_SIZE, FARMER_SIZE);


  // Recover overlapped yellow tiles
  if (recovered < GOAL) {
    for (let t of tiles) {
      if (t.state === 1 && overlaps(fX, fY, F_SIZE, F_SIZE, t.x, t.y, TILE, TILE)) {
        t.state = 0;
        recovered++;
      }
    }
  }

  if (recovered >= GOAL) {
    fill(255);
    textSize(36);
    text("You Win!", width/2, height/2 - 10);
  }
}

function initGrid() {
  tiles = [];
  for (let y = FY; y <= FY + FH - TILE; y += TILE + GAP) {
    for (let x = FX; x <= FX + FW - TILE; x += TILE + GAP) {
      tiles.push({ x, y, state: 0 }); 
    }
  }
}

function resetGame() {
  for (let t of tiles) t.state = 0;
  recovered = 0;
  lastSpawn = millis();
  fX = FX + 10;
  fY = FY + 10;
}

function countYellow() {
  let n = 0;
  for (let t of tiles) if (t.state === 1) n++;
  return n;
}

function makeRandomYellow() {
  let greens = [];
  for (let i = 0; i < tiles.length; i++) if (tiles[i].state === 0) greens.push(i);
  if (greens.length === 0) return;
  let idx = greens[int(random(greens.length))];
  tiles[idx].state = 1;
}

function drawTiles() {
  for (let t of tiles) {
    if (t.state === 0) {
      fill(51, 148, 38);  
      stroke(34, 110, 28);
    } else {
      fill(245, 211, 66); 
      stroke(170, 145, 40);
    }
    strokeWeight(1);
    rect(t.x, t.y, TILE, TILE, 3);
    noStroke();
  }
}

function overlaps(ax, ay, aw, ah, bx, by, bw, bh) {
  return !(ax + aw < bx || ax > bx + bw || ay + ah < by || ay > by + bh);
}

// Intro
function drawFarmScene() {
  background(180, 220, 255);
  image(fieldImg, 0, 0, width, height);

  if (keyIsDown(LEFT_ARROW))  farmerX -= moveStep;
  if (keyIsDown(RIGHT_ARROW)) farmerX += moveStep;
  farmerX = constrain(farmerX, 0, width - farmerImg.width);

  for (let p of particles) p.display();

  fill(0);
  textSize(60);
  text('Welcome', width / 2, 75);

  drawButton(".    ");
}

function drawSecondScene() {
  background(117, 72, 32);

  const pad = 24;
  const titleH = 56;
  const fieldX = pad;
  const fieldY = pad + titleH;
  const fieldW = width  - pad * 2;
  const fieldH = height - pad * 2 - titleH;

  fill(255);
  noStroke();
  textSize(36);
  text('Farmer Field', width / 2, pad + 20);

  drawCropGrid(fieldX, fieldY, fieldW, fieldH, {
    tile: 20,          
    gapX: 10,
    gapY: 10,
    jitter: 0,         
    density: 0.9,      
    fillColor: [51, 148, 38],
    strokeColor: [34, 110, 28],
    strokeW: 1,
    corner: 3,
    seed: 12345        
  });

}

function drawButton(label = '') {
  image(buttonImg, btnX, btnY, btnW, btnH);

  if (label) {
    fill(255);
    textSize(20);
    text(label, btnX + btnW/2, btnY + btnH/2 + 2);
  }

  if (isMouseOver(btnX, btnY, btnW, btnH)) {
    cursor(HAND);
  } else {
    cursor(ARROW);
  }
}

function mousePressed() {
  if (isMouseOver(btnX, btnY, btnW, btnH)) {
    if (scene === 0) {
      scene = 1;
    } else {
      scene = 0;
    }
  }
}

function isMouseOver(x, y, w, h) {
  return mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;
}

function spawnPixels() {
  particles = [];
  spawnFromImage(farmerImg, 'farmer');
  spawnFromImage(barnImg,   'barn');
  spawnFromImage(cowImg,    'cow');
}

function spawnFromImage(img, kind) {
  for (let i = 0; i < img.width;  i += res) {
    for (let j = 0; j < img.height; j += res) {
      const c = img.get(i, j);
      if (alpha(c) > 10) {
        particles.push(new Particle(i, j, c, kind));
      }
    }
  }
}

class Particle {
  constructor(lx, ly, col, kind) {
    this.lx = lx;
    this.ly = ly;
    this.col = col;
    this.kind = kind;
  }

  display() {
    let ox = 0, oy = 0;
    if (this.kind === 'farmer') { ox = farmerX; oy = farmerY; }
    else if (this.kind === 'barn') { ox = barnX; oy = barnY; }
    else if (this.kind === 'cow')  { ox = cowX;  oy = cowY;  }

    fill(red(this.col), green(this.col), blue(this.col));
    rect(Math.floor(ox + this.lx), Math.floor(oy + this.ly), res, res);
  }
}

function drawCropGrid(x, y, w, h, {
  tile = 10,        
  gapX = 8,         
  gapY = 8,         
  jitter = 0,       
  density = 1.0,   
  fillColor = [51, 148, 38], 
  strokeColor = null,        
  strokeW = 1,
  corner = 2,       
  seed = null      
} = {}) {
  push();

  if (seed !== null) randomSeed(seed);

  rectMode(CORNER);
  if (strokeColor) {
    stroke(strokeColor[0], strokeColor[1], strokeColor[2]);
    strokeWeight(strokeW);
  } else {
    noStroke();
  }
  fill(fillColor[0], fillColor[1], fillColor[2]);

  translate(x, y);

  for (let yy = 0; yy <= h - tile; yy += tile + gapY) {
    for (let xx = 0; xx <= w - tile; xx += tile + gapX) {
      if (random() <= density) {
        const jx = jitter ? random(-jitter, jitter) : 0;
        const jy = jitter ? random(-jitter, jitter) : 0;
        rect(
          Math.floor(xx + jx),
          Math.floor(yy + jy),
          tile,
          tile,
          corner
        );
      }
    }
  }

  pop();
}

