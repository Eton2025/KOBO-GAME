

// ==========================================
// CENTRAL SKETCH CONTROLLER (sketch.js)
// ==========================================

let gameState = "MENU"; // "MENU", "ACT1", "ACT2", "ACT3", "CELEBRATION"

let gameChar_x, gameChar_y;
let floorPos_y;
let isLeft, isRight, isFalling;

function setup() {
    createCanvas(1024, 576);
    floorPos_y = (height * 3) / 4;

    gameChar_x = width / 2;
    gameChar_y = floorPos_y;

    isLeft = false;
    isRight = false;
    isFalling = false;

    // Initialize level logic (defined in level1.js)
    if (typeof initLevel1 === 'function') {
        initLevel1();
    }
}

function draw() {
    switch (gameState) {
        case "MENU":
            drawMainMenu();
            break;
        case "ACT1":
            if (typeof drawLevel1 === 'function') {
                drawLevel1();
            }
            break;
        case "ACT2":
            if (typeof drawLevel2 === 'function') {
                drawLevel2();
            }
            break;
        case "ACT3":
            if (typeof drawLevel3 === 'function') {
                drawLevel3();
            }
            break;
    }
}

// ==========================================
// MAIN MENU DESIGN
// ==========================================
function drawMainMenu() {
    // Signature Kobo Stream Blue Background
    background(30, 144, 255);

    // Main Title with Drop Shadow effect for thumbnail pop
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

    // Start Instruction Prompt
    fill(255, 220, 0);
    textSize(18);
    text("Press [ ENTER ] or [ SPACE ] to Start", width / 2, btnY + btnH / 2);
}

// ==========================================
// PLAYER MOVEMENT & GRAVITY
// ==========================================
function updateGameChar() {
    if (isLeft) {
        gameChar_x -= 5;
    }
    if (isRight) {
        gameChar_x += 5;
    }

    // Gravity Physics
    if (gameChar_y < floorPos_y) {
        gameChar_y += 4;
        isFalling = true;
    } else {
        gameChar_y = floorPos_y;
        isFalling = false;
    }
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
        gameChar_x = 100; // Reset position for level start
        gameState = "ACT1";
    }
}

function keyPressed() {
    if (gameState === "MENU" && (keyCode === ENTER || keyCode === 32)) {
        gameChar_x = 100; // Reset position for level start
        gameState = "ACT1";
    }

    if (keyCode === LEFT_ARROW || key === 'a' || key === 'A') {
        isLeft = true;
    } else if (keyCode === RIGHT_ARROW || key === 'd' || key === 'D') {
        isRight = true;
    } else if ((keyCode === 32 || keyCode === UP_ARROW || key === 'w') && !isFalling) {
        gameChar_y -= 95; // Jump height
    }
}

function keyReleased() {
    if (keyCode === LEFT_ARROW || key === 'a' || key === 'A') {
        isLeft = false;
    } else if (keyCode === RIGHT_ARROW || key === 'd' || key === 'D') {
        isRight = false;
    }
}