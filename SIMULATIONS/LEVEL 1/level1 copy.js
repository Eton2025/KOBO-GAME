

// ==========================================
// LEVEL 1: ACT 1 - PLATFORMS, LIGHTNING & STORMS
// ==========================================

let mascots = [];
let movingClouds = [];
let lightningStrikes = [];
let platforms = [];
let canyons = [];

let itemsCollected = 0;
const totalItems = 10;
let lives = 3;

let umbrellaItem = { x: 880, y: 0, width: 50, height: 40, active: false };
let umbrellaOpened = false;
let cloudSplitX = 0; // Moves storm clouds apart when umbrella opens

function initLevel1() {
    itemsCollected = 0;
    lives = 3;
    umbrellaOpened = false;
    cloudSplitX = 0;
    mascots = [];
    movingClouds = [];
    lightningStrikes = [];

    // Define Ground Platforms & Canyons (Ponds) matching storyboard layout
    platforms = [
        { x: 0, width: 220 },
        { x: 280, width: 200 },
        { x: 540, width: 200 },
        { x: 790, width: 234 }
    ];

    canyons = [
        { x: 220, width: 60 },
        { x: 480, width: 60 },
        { x: 740, width: 50 }
    ];

    // Umbrella Target on Final Platform right side
    umbrellaItem.x = 880;
    umbrellaItem.y = floorPos_y;
    umbrellaItem.active = false;

    // Spawn 10 Cilus Mascots on platforms
    for (let i = 0; i < totalItems; i++) {
        mascots.push({
            x: 60 + i * 85,
            y: floorPos_y - 35 - (i % 2) * 50,
            collected: false
        });
    }

    // Initialize Moving Storm Clouds (Bigger, lower to cover sun fully)
    for (let i = 0; i < 5; i++) {
        movingClouds.push({
            pos_x: i * 250 - 50,
            pos_y: 90,
            w: 320,
            h: 140,
            speed: 1.2
        });
    }
}

function drawLevel1() {
    // 1. Dynamic Background Sky (Stormy grey-blue vs Clear bright sky)
    let stormSky = color(45, 50, 60);
    let clearSky = color(50, 150, 255); // Matches storyboard blue shade[cite: 57]
    let skyProgress = umbrellaOpened ? 1.0 : (itemsCollected / totalItems) * 0.2;
    background(lerpColor(stormSky, clearSky, skyProgress));

    // 2. Small Bright Yellow Sun (Hidden behind clouds until umbrella opens)[cite: 52]
    push(); 
    noStroke();
    let sunAlpha = umbrellaOpened ? 255 : 0; // Fully hidden behind clouds until cleared
    fill(255, 230, 0, sunAlpha); 
    ellipse(width / 2, 95, 70, 70); 
    pop();

    // 3. Background Trees & Ponds (Canyons) & Platforms
    noStroke();
    // Background Trees on platforms[cite: 49]
    for (let p of platforms) {
        fill(139, 69, 19);
        rect(p.x + p.width / 2 - 14, floorPos_y - 140, 28, 140);
        fill(34, 139, 34);
        ellipse(p.x + p.width / 2, floorPos_y - 140, 120, 120);
    }
    // Blue water ponds in canyons (Kobo dies if she falls into them)[cite: 49]
    for (let c of canyons) {
        fill(25, 90, 220);
        rect(c.x, floorPos_y, c.width, height - floorPos_y);
    }
    // Green ground platforms
    fill(0, 210, 0);
    for (let p of platforms) {
        rect(p.x, floorPos_y, p.width, height - floorPos_y);
    }

    // Check Canyon Pits / Falling Hazard
    let isOnPlatform = false;
    for (let p of platforms) {
        if (gameChar_x >= p.x && gameChar_x <= p.x + p.width) {
            isOnPlatform = true;
            break;
        }
    }

    if (!isOnPlatform && gameChar_y >= floorPos_y) {
        lives--;
        gameChar_x = 50; // Respawn at original spot[cite: 51]
        gameChar_y = floorPos_y;
    }

    // 4. Render Cilus Mascot Tokens[cite: 53]
    for (let m of mascots) {
        if (!m.collected) {
            drawBocorMascot(m.x, m.y);
            if (dist(gameChar_x, gameChar_y - 40, m.x, m.y) < 35) {
                m.collected = true;
                itemsCollected++;
                if (itemsCollected >= totalItems) {
                    umbrellaItem.active = true;
                }
            }
        }
    }

    // 5. Umbrella & Zeta NPC at final platform[cite: 49]
    push();
    translate(umbrellaItem.x, umbrellaItem.y);
    if (!umbrellaOpened) {
        // Closed umbrella (Blue vertical shape matching storyboard)[cite: 49]
        fill(0, 100, 255);
        noStroke();
        rect(-6, -65, 12, 55, 6);
        stroke(220);
        strokeWeight(3);
        line(0, -65, 0, 0);
    } else {
        // Opened umbrella canopy[cite: 57]
        fill(0, 120, 255);
        noStroke();
        arc(0, -55, 75, 55, PI, TWO_PI);
        stroke(220);
        strokeWeight(3);
        line(0, -55, 0, 0);
    }
    pop();

    // Render Zeta NPC standing right next to the umbrella[cite: 49]
    drawZetaNPC(umbrellaItem.x + 35, floorPos_y);

    // 6. Render Player Character (Kobo)
    updateGameChar();
    drawCharacter();

    // Check Umbrella Reach Condition[cite: 55]
    if (umbrellaItem.active && !umbrellaOpened) {
        if (dist(gameChar_x, gameChar_y - 40, umbrellaItem.x, floorPos_y) < 45) {
            umbrellaOpened = true;
        }
    }

    // 7. Moving Storm Clouds & Cloud Rain (Using your exact drawRain function)[cite: 44, 49]
    if (umbrellaOpened) cloudSplitX += 6; // Clouds shift away when umbrella opens[cite: 57]

    push();
    noStroke();
    fill(35, 40, 50, 250);
    for (let c of movingClouds) {
        let drawX = c.pos_x + (c.pos_x < width / 2 ? -cloudSplitX : cloudSplitX);
        ellipse(drawX, c.pos_y, c.w, c.h);

        // Draw Rain from Cloud using exact requested helper function[cite: 44]
        if (!umbrellaOpened) {
            drawRain(c);
        }

        // Move clouds continuously in one direction[cite: 49]
        if (!umbrellaOpened) {
            c.pos_x += c.speed;
            if (c.pos_x > width + 200) {
                c.pos_x = -200;
            }
        }
    }
    pop();

    // 8. Lightning Hazards[cite: 49]
    if (!umbrellaOpened && frameCount % 100 === 0) {
        lightningStrikes.push({
            x: random(100, width - 100),
            timer: 20
        });
    }

    for (let i = lightningStrikes.length - 1; i >= 0; i--) {
        let strike = lightningStrikes[i];
        stroke(255, 230, 80, strike.timer * 12);
        strokeWeight(3);
        line(strike.x, 120, strike.x - 12, 210);
        line(strike.x - 12, 210, strike.x + 10, 300);
        line(strike.x + 10, 300, strike.x - 4, floorPos_y);

        if (abs(gameChar_x - strike.x) < 25 && gameChar_y >= floorPos_y - 25) {
            lives--;
            gameChar_x = 50; 
            gameChar_y = floorPos_y;
        }

        strike.timer--;
        if (strike.timer <= 0) lightningStrikes.splice(i, 1);
    }

    // 9. HUD Overlay (Lives & Kobo Cilus count)[cite: 49]
    fill(0, 160);
    noStroke();
    rect(20, 20, 250, 75, 6);

    fill(255); textSize(16); textAlign(LEFT);
    let hearts = "";
    for (let l = 0; l < lives; l++) hearts += "❤️ ";
    text("LIVES: " + lives + " / 3 " + hearts, 35, 45);
    text("KOBO CILUS: " + itemsCollected + " / " + totalItems, 35, 75);

    if (lives <= 0) {
        lives = 3;
        initLevel1();
    }

    // 10. Level Transition to Act 2 when cleared & sun shines[cite: 57]
    if (umbrellaOpened && cloudSplitX > width / 2 + 100) {
        fill(255, 240, 150); textSize(24); textAlign(CENTER);
        text("The Skyline is Restored! Proceeding to Level 2...", width / 2, height / 2);

        if (frameCount % 140 === 0) {
            if (typeof initLevel2 === 'function') {
                initLevel2();
            }
            gameState = "ACT2";
        }
    }
}

// Exact cloud rain helper function requested[cite: 44]
function drawRain(cloud) {
    stroke(255);
    strokeWeight(2);
    for (var i = 0; i < 15; i++) {
        var dropX = random(cloud.pos_x - 50, cloud.pos_x + 50);
        var dropY = random(cloud.pos_y, floorPos_y);
        line(dropX, dropY, dropX, dropY + 10);
    }
}