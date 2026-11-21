

// ==========================================
// CENTRAL SKETCH CONTROLLER (sketch.js)
// ==========================================

let gameState = "MENU"; // "MENU", "ACT1", "ACT2", "ACT3", "CELEBRATION"

let gameChar_x, gameChar_y;
let gameChar_vy = 0;          // vertical speed (real jump arc instead of teleporting)
let floorPos_y;
let isLeft, isRight, isFalling;

// Physics tuning
const GRAVITY = 0.6;
const JUMP_SPEED = -13;       // max jump height is roughly 140px
const RUN_SPEED = 5;

// Each level fills these in its init function
let levelPlatforms = [];      // [{ x, y, w }]  y = top surface, world coords
let levelPits = [];           // [{ x, w }]     gaps in the floor (ponds, ditches)
let worldWidth = null;        // null = no horizontal limit

let lives = 3;                // spare global; Levels 1 and 2 keep their own counts in L1.lives / L2.lives

function setup() {
    createCanvas(1024, 576);
    floorPos_y = (height * 3) / 4;

    gameChar_x = width / 2;
    gameChar_y = floorPos_y;

    isLeft = false;
    isRight = false;
    isFalling = false;
}

function draw() {
    try {
        switch (gameState) {
            case "MENU":
                drawMainMenu();
                break;
            case "ACT1":
                runLevel("drawLevel1", "level1.js");
                break;
            case "ACT2":
                runLevel("drawLevel2", "level2.js");
                break;
            case "ACT3":
                runLevel("drawLevel3", "level3.js");
                break;
            case "END":
                if (typeof drawEndScene === 'function') drawEndScene();
                else drawEndPlaceholder();
                break;
        }
    } catch (err) {
        // Show crashes on screen instead of freezing on the last frame
        showProblem(`Error in ${gameState}: ${err.message}`);
        if (!draw.lastError || draw.lastError !== err.message) {
            console.error(err);
            draw.lastError = err.message;
        }
    }
}

function runLevel(fnName, fileName) {
    if (typeof window[fnName] === 'function') window[fnName]();
    else showProblem(`${fnName}() not found. Is ${fileName} listed in index.html, and did it load without errors?`);
}

function showProblem(msg) {
    push();
    noStroke();
    fill(150, 0, 0, 230);
    rect(0, height - 60, width, 60);
    fill(255);
    textAlign(LEFT, CENTER);
    textSize(16);
    text(msg, 15, height - 30);
    pop();
}

// Temporary end screen until the cake scene is built
function drawEndPlaceholder() {
    background(51, 183, 255);
    textAlign(CENTER, CENTER);
    fill(255);
    textSize(34);
    text("Happy Birthday Kobo!", width / 2, height / 2 - 60);
    text("The Skyline is Restored!", width / 2, height / 2 - 15);
    textSize(20);
    text("Thank you for playing!", width / 2, height / 2 + 40);
    text("Submission created by Ethan for Kobo Birthday 2026 Project.", width / 2, height / 2 + 72);
}

function startLevel1() {
    if (typeof initLevel1 === 'function') initLevel1();
    gameState = "ACT1";
}

// ==========================================
// MAIN MENU DESIGN
// ==========================================
function drawMainMenu() {
    // Signature Kobo Stream Blue Background
    background(30, 144, 255);

    textAlign(CENTER, CENTER);

    fill(10, 20, 35, 150);
    textSize(38);
    text("KOBO'S SKYLINE RAIN SHAMAN", width / 2 + 2, 132);

    fill(120, 210, 255);
    textSize(38);
    text("KOBO'S SKYLINE RAIN SHAMAN", width / 2, 130);

    textSize(18);
    fill(255, 240, 150);
    text("Kobo Birthday 2026 Fan Game Project", width / 2, 175);

    // Preview Characters on Stage
    push();
    gameChar_x = width / 2;
    gameChar_y = 390;
    drawCharacter();                      // Kobo Center
    drawZetaNPC(width / 2 - 180, 390);    // Zeta Left (Grounded)
    drawKaelaNPC(width / 2 + 180, 390);   // Kaela Right (Grounded)
    pop();

    // Interactive Start Button Box
    let btnW = 380;
    let btnH = 50;
    let btnX = width / 2 - btnW / 2;
    let btnY = 465;

    let isHovered = mouseX > btnX && mouseX < btnX + btnW && mouseY > btnY && mouseY < btnY + btnH;

    push();
    rectMode(CENTER);
    stroke(255, 220, 0);
    strokeWeight(isHovered ? 4 : 2);
    fill(isHovered ? color(40, 60, 90) : color(20, 35, 55), 220);
    rect(width / 2, btnY + btnH / 2, btnW, btnH, 10);
    pop();

    fill(255, 220, 0);
    textSize(18);
    text("Press [ ENTER ] or [ SPACE ] to Start", width / 2, btnY + btnH / 2);
}

// ==========================================
// PLAYER MOVEMENT & GRAVITY
// Levels call this once per frame while the player is in control.
// ==========================================
function updateGameChar() {
    if (isLeft) gameChar_x -= RUN_SPEED;
    if (isRight) gameChar_x += RUN_SPEED;
    if (worldWidth) gameChar_x = constrain(gameChar_x, 15, worldWidth - 15);

    const prevY = gameChar_y;
    gameChar_vy += GRAVITY;
    gameChar_y += gameChar_vy;

    let grounded = false;

    // Only land when moving downward and crossing a surface this frame,
    // so Kobo can jump up through platforms from below.
    if (gameChar_vy >= 0) {
        for (const p of levelPlatforms) {
            if (gameChar_x > p.x && gameChar_x < p.x + p.w && prevY <= p.y && gameChar_y >= p.y) {
                gameChar_y = p.y;
                gameChar_vy = 0;
                grounded = true;
                break;
            }
        }
        if (!grounded && !isOverPit(gameChar_x) && prevY <= floorPos_y && gameChar_y >= floorPos_y) {
            gameChar_y = floorPos_y;
            gameChar_vy = 0;
            grounded = true;
        }
    }

    isFalling = !grounded;
}

function isOverPit(x) {
    return levelPits.some(p => x > p.x && x < p.x + p.w);
}

// ==========================================
// INPUT CONTROLLERS
// ==========================================
function mousePressed() {
    let btnW = 380;
    let btnH = 50;
    let btnX = width / 2 - btnW / 2;
    let btnY = 465;

    if (gameState === "MENU" && mouseX > btnX && mouseX < btnX + btnW && mouseY > btnY && mouseY < btnY + btnH) {
        startLevel1();
    } else if (gameState === "ACT1" && typeof level1Continue === 'function') {
        level1Continue();
    } else if (gameState === "ACT2" && typeof level2Continue === 'function') {
        level2Continue();
    }
}

function keyPressed() {
    const isGameKey = [32, LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW].includes(keyCode);

    if (gameState === "MENU") {
        if (keyCode === ENTER || keyCode === 32) {
            startLevel1();
            return false; // don't also count this SPACE as a jump
        }
        return;
    }

    // Let the current level handle Enter/Space on its end screens first.
    // If it moved on, stop here so that key doesn't also count as a jump.
    if (gameState === "ACT1" && typeof level1KeyPressed === 'function' && level1KeyPressed()) return false;
    if (gameState === "ACT2" && typeof level2KeyPressed === 'function' && level2KeyPressed()) return false;

    if (keyCode === LEFT_ARROW || key === 'a' || key === 'A') {
        isLeft = true;
    } else if (keyCode === RIGHT_ARROW || key === 'd' || key === 'D') {
        isRight = true;
    }

    if ((keyCode === 32 || keyCode === UP_ARROW || key === 'w' || key === 'W') && !isFalling) {
        gameChar_vy = JUMP_SPEED;
        isFalling = true;
    }

    if (isGameKey) return false; // stop arrows/space from scrolling the page
}

function keyReleased() {
    if (keyCode === LEFT_ARROW || key === 'a' || key === 'A') {
        isLeft = false;
    } else if (keyCode === RIGHT_ARROW || key === 'd' || key === 'D') {
        isRight = false;
    }
}