

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

function initLevel2() {
    stormItemsCollected = 0;
    level2Completed = false;
    stormTransitionTimer = 0;
    stormClouds = [];
    fireHazards = [];

    // Reset player position for Level 2 start
    gameChar_x = 80;
    gameChar_y = floorPos_y;

    // Platforms and Red Ditches (Pits where Kobo dies)
    level2Platforms = [
        { x: 0, width: 200 },
        { x: 260, width: 180 },
        { x: 500, width: 190 },
        { x: 740, width: 284 }
    ];

    level2Ditches = [
        { x: 200, width: 60 },
        { x: 440, width: 60 },
        { x: 690, width: 50 }
    ];

    // Spawn 10 Dark Cloud Tokens
    for (let i = 0; i < totalStormItems; i++) {
        stormClouds.push({
            x: 70 + i * 85,
            y: floorPos_y - 50 - (i % 3) * 40,
            collected: false
        });
    }

    // Fire Hazards springing from ground
    fireHazards = [
        { x: 310, active: true },
        { x: 560, active: true }
    ];
}

function drawLevel2() {
    // 1. Warm Orange Haze Background Sky
    background(235, 140, 40);

    // Sun partially visible behind translucent haze
    push();
    noStroke();
    fill(255, 230, 100, 180);
    ellipse(width / 2 - 100, 100, 90, 90);
    
    // Translucent Haze Clouds moving left
    fill(255, 180, 80, 120);
    ellipse((frameCount * 0.5) % (width + 200) - 100, 80, 300, 90);
    ellipse((frameCount * 0.7 + 400) % (width + 200) - 100, 120, 260, 80);
    pop();

    // 2. Background Trees, Red Ditches & Ground Platforms
    noStroke();
    for (let p of level2Platforms) {
        fill(139, 69, 19);
        rect(p.x + p.width / 2 - 12, floorPos_y - 130, 24, 130);
        fill(34, 139, 34);
        ellipse(p.x + p.width / 2, floorPos_y - 130, 110, 110);
    }

    // Red Ditches (Fatal pits)[cite: 85]
    fill(180, 30, 30);
    for (let d of level2Ditches) {
        rect(d.x, floorPos_y, d.width, height - floorPos_y);
    }

    // Green Ground Platforms[cite: 85]
    fill(0, 180, 0);
    for (let p of level2Platforms) {
        rect(p.x, floorPos_y, p.width, height - floorPos_y);
    }

    // Check Ditch Collisions
    let isOnPlatform = false;
    for (let p of level2Platforms) {
        if (gameChar_x >= p.x && gameChar_x <= p.x + p.width) {
            isOnPlatform = true;
            break;
        }
    }

    if (!isOnPlatform && gameChar_y >= floorPos_y) {
        lives--;
        gameChar_x = 80;
        gameChar_y = floorPos_y;
    }

    // 3. Fire Hazards on Ground[cite: 86]
    for (let f of fireHazards) {
        push();
        noStroke();
        fill(255, 80, 0);
        triangle(f.x, floorPos_y, f.x + 20, floorPos_y - 45, f.x + 40, floorPos_y);
        fill(255, 220, 50);
        triangle(f.x + 10, floorPos_y, f.x + 20, floorPos_y - 25, f.x + 30, floorPos_y);
        pop();

        // Check Fire Collision
        if (abs(gameChar_x - (f.x + 20)) < 25 && gameChar_y >= floorPos_y - 10) {
            lives--;
            gameChar_x = 80;
            gameChar_y = floorPos_y;
        }
    }

    // 4. Render Dark Cloud Tokens[cite: 85]
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

    // 5. Kaela's Anvil & NPC[cite: 85]
    let anvilX = 920;
    let anvilY = floorPos_y;
    
    push();
    fill(40); noStroke();
    rect(anvilX - 25, anvilY - 25, 50, 25, 3); // Anvil base
    rect(anvilX - 35, anvilY - 40, 70, 15, 2); // Anvil top
    pop();

    drawKaelaNPC(anvilX + 35, floorPos_y);

    // 6. Player Movement & Rendering
    updateGameChar();
    drawCharacter();

    // Check Level 2 Completion (All 10 tokens collected & reached Kaela's anvil)[cite: 87]
    if (stormItemsCollected >= totalStormItems && !level2Completed) {
        if (dist(gameChar_x, gameChar_y - 40, anvilX, floorPos_y) < 50) {
            level2Completed = true;
        }
    }

    // 7. Storm Roll-In Transition to Level 3
    if (level2Completed) {
        stormTransitionTimer++;
        push();
        noStroke();
        fill(30, 30, 40, min(stormTransitionTimer * 3, 200));
        rect(0, 0, width, height);

        fill(255, 230, 120); textSize(22); textAlign(CENTER);
        text("Kaela hammers the 10 clouds into a storm! Proceeding to Level 3...", width / 2, height / 2);
        pop();

        if (stormTransitionTimer > 120) {
            if (typeof initLevel3 === 'function') {
                initLevel3();
            }
            gameState = "ACT3";
        }
    }

    // 8. HUD Overlay
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