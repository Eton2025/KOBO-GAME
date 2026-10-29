




// ==========================================
// LEVEL 2: ACT 2 - HAZE, FIRE & KAELA'S ANVIL
// ==========================================

let stormClouds = [];
let fireHazards = [];
let level2Platforms = [];
let level2Ditches = [];

let stormItemsCollected = 0;
const totalStormItems = 10;
let level2Completed = false;
let stormTransitionTimer = 0;

let hazeClouds = [];

function initLevel2() {
    stormItemsCollected = 0;
    level2Completed = false;
    stormTransitionTimer = 0;
    stormClouds = [];
    fireHazards = [];
    hazeClouds = [];

    gameChar_x = 80;
    gameChar_y = floorPos_y;

    // Initialize multiple large haze clouds once on startup
    for (let i = 0; i < 5; i++) {
        hazeClouds.push({
            x: i * 400 + random(-100, 100),
            y: random(80, 220),
            w: random(500, 800),  // Large width
            h: random(180, 280),  // Large height
            speed: random(0.3, 0.8)
        });
    }

    level2Platforms = [
        { x: 200, y: floorPos_y - 100, width: 200 },
        { x: 500, y: floorPos_y - 140, width: 180 },
        { x: 800, y: floorPos_y - 110, width: 220 },
        { x: 1200, y: floorPos_y - 130, width: 250 },
        { x: 1600, y: floorPos_y - 120, width: 200 }
    ];

    for (let i = 0; i < totalStormItems; i++) {
        stormClouds.push({
            x: random(300, 2200),
            y: random(floorPos_y - 220, floorPos_y - 60),
            collected: false
        });
    }
}

function drawLevel2() {
    // 1. Dynamic camera following Kobo
    cameraPosX = constrain(gameChar_x - 500, 0, 1600);

    // 1. Warm Orange Haze Background Sky
    background(235, 140, 40);

    // Sun
    push();
    noStroke();
    fill(255, 230, 100, 180);
    ellipse(width / 2 - 100, 100, 90, 90);
    
    // Multiple Large Drifting Haze Clouds (Running every frame!)
    noStroke();
    fill(255, 160, 60, 130);
    for (let hc of hazeClouds) {
        hc.x -= hc.speed; // Moves left every frame
        if (hc.x < -hc.w) {
            hc.x = width + hc.w;
        }
        ellipse(hc.x, hc.y, hc.w, hc.h);
    }
    pop();

    // ==========================================
    // 3. SCROLLING WORLD (Everything inside translates)
    // ==========================================
    push();
    translate(-cameraPosX, 0);

    // Continuous Ground Floor across the world
    noStroke();
    fill(255);
    rect(cameraPosX - 1000, floorPos_y, 6000, height - floorPos_y);

    // Red Ditches (Fatal pits)
    fill(180, 30, 30);
    for (let d of level2Ditches) {
        rect(d.x, floorPos_y, d.width, height - floorPos_y);
    }

    // Green Ground Platforms
    fill(0, 180, 0);
    rect(cameraPosX - 1000, floorPos_y, 6000, height - floorPos_y);

    // Background Trees behind platforms
    for (let p of level2Platforms) {
        fill(139, 69, 19);
        rect(p.x + p.width / 2 - 15, floorPos_y - 220, 30, 220);
        fill(34, 139, 34);
        ellipse(p.x + p.width / 2, floorPos_y - 220, 160, 160);
    }

    // Floating Suspended Platforms
    fill(0, 180, 0);
    for (let p of level2Platforms) {
        rect(p.x, p.y, p.width, 20, 10);
        fill(255);
        rect(p.x, p.y, p.width, 5, 10);
    }

    // Fire Hazards on Ground
    for (let f of fireHazards) {
        push();
        noStroke();
        fill(255, 80, 0);
        triangle(f.x, floorPos_y, f.x + 20, floorPos_y - 45, f.x + 40, floorPos_y);
        fill(255, 220, 50);
        triangle(f.x + 10, floorPos_y, f.x + 20, floorPos_y - 25, f.x + 30, floorPos_y);
        pop();

        if (abs(gameChar_x - (f.x + 20)) < 25 && gameChar_y >= floorPos_y - 10) {
            lives--;
            gameChar_x = 80;
            gameChar_y = floorPos_y;
        }
    }

    // Render Dark Cloud Tokens
    for (let sc of stormClouds) {
        if (!sc.collected) {
            push();
            noStroke();
            fill(80, 85, 95);
            ellipse(sc.x, sc.y, 35, 22);
            ellipse(sc.x - 10, sc.y + 4, 25, 18);
            ellipse(sc.x + 10, sc.y + 4, 25, 18);
            pop();

            if (dist(gameChar_x, gameChar_y - 40, sc.x, sc.y) < 32) {
                sc.collected = true;
                stormItemsCollected++;
            }
        }
    }

    // Kaela's Anvil & NPC
    let anvilX = 2100;
    let anvilY = floorPos_y;
    
    push();
    fill(40); noStroke();
    rect(anvilX - 25, anvilY - 25, 50, 25, 3);
    rect(anvilX - 35, anvilY - 40, 70, 15, 2);
    pop();

    drawKaelaNPC(anvilX + 35, floorPos_y);

    // Platform Contact Snapping Physics
    let isContact = false;
    for (let p of level2Platforms) {
        if (gameChar_x > p.x && gameChar_x < p.x + p.width) {
            let d = p.y - gameChar_y;
            if (d >= 0 && d < 12 && isFalling) {
                isContact = true;
                gameChar_y = p.y;
                isFalling = false;
                break;
            }
        }
    }

    // Player Movement & Rendering
    updateGameChar();
    drawCharacter();

    // Check Level 2 Completion
    if (stormItemsCollected >= totalStormItems && !level2Completed) {
        if (dist(gameChar_x, gameChar_y - 40, anvilX, floorPos_y) < 50) {
            level2Completed = true;
        }
    }

    // Storm Roll-In Transition to Level 3
    if (level2Completed) {
        stormTransitionTimer++;
        push();
        noStroke();
        fill(30, 30, 40, min(stormTransitionTimer * 3, 200));
        rect(cameraPosX, 0, width, height);

        fill(255, 230, 120); textSize(22); textAlign(CENTER);
        text("Kaela hammers the 10 clouds into storm! Proceeding to Level 3...", cameraPosX + width / 2, height / 2);
        pop();

        if (stormTransitionTimer > 120) {
            if (typeof initLevel3 === 'function') {
                initLevel3();
            }
            gameState = "ACT3";
        }
    }

    pop(); // End Camera Translation

    // ==========================================
    // 4. HUD OVERLAY (Fixed to Screen)
    // ==========================================
    fill(0, 160);
    noStroke();
    rect(20, 20, 260, 75, 6);

    fill(255); textSize(16); textAlign(LEFT);
    let hearts = "";
    for (let l = 0; l < lives; l++) hearts += "❤️ ";
    text("LIVES: " + lives + " / 3 " + hearts, 35, 45);
    text("KOBO STORMS: " + stormItemsCollected + " / " + totalStormItems, 35, 75);

    if (lives <= 0) {
        lives = 3;
        initLevel2();
    }
}