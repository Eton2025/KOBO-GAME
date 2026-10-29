

// ==========================================
// LEVEL 3: ACT 3 - RAINBOW PODIUM & COLOR TOKENS
// ==========================================

let colorTokens = [];
let level3Platforms = [];
let colorCounts = {
    red: 0,
    orange: 0,
    yellow: 0,
    green: 0,
    blue: 0,
    purple: 0
};
const targetPerColor = 5;
let level3Complete = false;
let endSceneTriggered = false;
let whiteFlashAlpha = 0;

function initLevel3() {
    level3Complete = false;
    endSceneTriggered = false;
    whiteFlashAlpha = 0;
    colorTokens = [];
    
    colorCounts = { red: 0, orange: 0, yellow: 0, green: 0, blue: 0, purple: 0 };

    gameChar_x = 100;
    gameChar_y = floorPos_y;

    level3Platforms = [
        { x: 0, width: 240 },
        { x: 300, width: 220 },
        { x: 580, width: 210 },
        { x: 840, width: 184 }
    ];

    let colorPaletteKeys = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];

    // Spawn 5 tokens for each of the 6 colors (30 total)
    let tokenIndex = 0;
    for (let colKey of colorPaletteKeys) {
        for (let i = 0; i < targetPerColor; i++) {
            colorTokens.push({
                x: 80 + (tokenIndex * 29) % 850,
                y: floorPos_y - 60 - (tokenIndex % 4) * 40,
                colorType: colKey,
                collected: false
            });
            tokenIndex++;
        }
    }
}

function drawLevel3() {
    // 1. Darker Blue Sky Background[cite: 92]
    background(20, 80, 220);

    // Shining Sun[cite: 92]
    push();
    noStroke();
    fill(255, 230, 0);
    ellipse(300, 100, 75, 75);
    pop();

    // 2. Background Palm/Rainforest Trees[cite: 92]
    noStroke();
    for (let p of level3Platforms) {
        fill(139, 69, 19);
        rect(p.x + p.width / 2 - 10, floorPos_y - 120, 20, 120);
        fill(0, 120, 60);
        ellipse(p.x + p.width / 2, floorPos_y - 120, 100, 100);
    }

    // Ground Platforms
    fill(0, 180, 0);
    for (let p of level3Platforms) {
        rect(p.x, floorPos_y, p.width, height - floorPos_y);
    }

    // 3. Render Color Tokens[cite: 92]
    for (let tok of colorTokens) {
        if (!tok.collected) {
            push();
            noStroke();
            let c;
            if (tok.colorType === 'red') c = color(235, 50, 50);
            else if (tok.colorType === 'orange') c = color(255, 140, 0);
            else if (tok.colorType === 'yellow') c = color(255, 230, 0);
            else if (tok.colorType === 'green') c = color(50, 200, 50);
            else if (tok.colorType === 'blue') c = color(50, 150, 255);
            else if (tok.colorType === 'purple') c = color(160, 50, 220);

            fill(c);
            ellipse(tok.x, tok.y, 24, 24);
            pop();

            if (dist(gameChar_x, gameChar_y - 40, tok.x, tok.y) < 30) {
                tok.collected = true;
                colorCounts[tok.colorType]++;
            }
        }
    }

    // Check if all color collections are complete (5/5 for all 6)[cite: 94]
    let allColorsCollected = (
        colorCounts.red >= targetPerColor &&
        colorCounts.orange >= targetPerColor &&
        colorCounts.yellow >= targetPerColor &&
        colorCounts.green >= targetPerColor &&
        colorCounts.blue >= targetPerColor &&
        colorCounts.purple >= targetPerColor
    );

    // 4. Podium at Right End[cite: 92]
    let podiumX = 920;
    let podiumY = floorPos_y;
    push();
    fill(255); noStroke();
    rect(podiumX - 30, podiumY - 70, 60, 70); // Podium pillar
    rect(podiumX - 45, podiumY - 85, 90, 15); // Podium top platform
    pop();

    // 5. Player Movement & Rendering
    updateGameChar();
    drawCharacter();

    // Check Podium Reach Condition[cite: 94, 97]
    if (allColorsCollected && gameChar_x >= podiumX - 40 && gameChar_x <= podiumX + 40 && gameChar_y <= podiumY - 80) {
        level3Complete = true;
    }

    // 6. Immediate Rainbow & Sky Clearing on Completion[cite: 96]
    if (level3Complete) {
        // Sky turns bright blue and rainbow appears[cite: 96]
        background(80, 190, 255);
        
        push();
        noFill();
        strokeWeight(12);
        stroke(235, 50, 50, 200); arc(width / 2, floorPos_y, 700, 450, PI, TWO_PI);
        stroke(255, 140, 0, 200); arc(width / 2, floorPos_y, 730, 480, PI, TWO_PI);
        stroke(255, 230, 0, 200); arc(width / 2, floorPos_y, 760, 510, PI, TWO_PI);
        stroke(50, 200, 50, 200); arc(width / 2, floorPos_y, 790, 540, PI, TWO_PI);
        stroke(50, 150, 255, 200); arc(width / 2, floorPos_y, 820, 570, PI, TWO_PI);
        stroke(160, 50, 220, 200); arc(width / 2, floorPos_y, 850, 600, PI, TWO_PI);
        pop();

        endSceneTriggered = true;
    }

    // 7. White Screen Flash & Fade Out to End Scene[cite: 97]
    if (endSceneTriggered) {
        whiteFlashAlpha += 4;
        push();
        noStroke();
        fill(255, min(whiteFlashAlpha, 255));
        rect(0, 0, width, height);
        pop();

        if (whiteFlashAlpha > 300) {
            if (typeof initEndScene === 'function') {
                initEndScene();
            }
            gameState = "END";
        }
    }

    // 8. HUD Overlay (Showing 6 Color Trackers)[cite: 92]
    fill(0, 160);
    noStroke();
    rect(20, 20, 260, 135, 6);

    fill(255); textSize(13); textAlign(LEFT);
    text("RED: " + colorCounts.red + " / " + targetPerColor, 35, 42);
    text("ORANGE: " + colorCounts.orange + " / " + targetPerColor, 35, 62);
    text("YELLOW: " + colorCounts.yellow + " / " + targetPerColor, 35, 82);
    text("GREEN: " + colorCounts.green + " / " + targetPerColor, 35, 102);
    text("BLUE: " + colorCounts.blue + " / " + targetPerColor, 35, 122);
    text("PURPLE: " + colorCounts.purple + " / " + targetPerColor, 35, 142);
}