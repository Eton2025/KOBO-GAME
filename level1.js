// ==========================================
// LEVEL 1 — THE STORM (level1.js)
// Collect 10 Cilus, avoid ponds and lightning,
// then reach Zeta's umbrella to clear the sky.
// Needs: sketch.js (updateGameChar, levelPlatforms, levelPits, worldWidth),
//        character.js (drawCharacter), zeta.js (drawZetaNPC)
// ==========================================

const L1 = {};

const L1_WORLD_W = 3200;      // level is wider than the screen; camera follows Kobo
const L1_START_X = 120;
const L1_GOAL_X = 3000;       // umbrella pole
const L1_ZETA_X = 3070;
const L1_TOTAL_CILUS = 10;
const L1_MAX_LIVES = 3;
const L1_KOBO_HALF_W = 16;    // Kobo's hitbox: tweak to match drawCharacter()
const L1_KOBO_H = 70;

const L1_SKY_STORM = [85, 85, 92];
const L1_SKY_CLEAR = [51, 183, 255];

// ------------------------------------------
// SETUP
// ------------------------------------------
function initLevel1() {
    L1.lives = L1_MAX_LIVES;
    L1.cilus = 0;
    L1.phase = "PLAY";        // PLAY | CLEARING | DONE | GAMEOVER
    L1.clearT = 0;
    L1.camX = 0;
    L1.hurtFlash = 0;
    L1.flashT = 0;
    L1.skyBlend = 0;          // 0 = storm grey, 1 = clear blue
    L1.umbrellaOpen = 0;      // 0 = closed, 1 = open
    L1.rainOn = true;
    L1.sunX = width / 2;

    // Ponds: fall in and lose a life
    L1.pits = [
        { x: 520, w: 200 },
        { x: 1150, w: 240 },
        { x: 1900, w: 210 },
        { x: 2500, w: 200 }
    ];

    // Platforms (y = top surface). Floor is at floorPos_y (432).
    L1.platforms = [
        { x: 290,  y: 340, w: 130 },
        { x: 560,  y: 330, w: 130 },
        { x: 800,  y: 255, w: 130 },
        { x: 1010, y: 175, w: 130 },
        { x: 1200, y: 320, w: 150 },
        { x: 1460, y: 250, w: 130 },
        { x: 1700, y: 330, w: 130 },
        { x: 1940, y: 320, w: 140 },
        { x: 2160, y: 230, w: 130 },
        { x: 2350, y: 155, w: 130 },
        { x: 2530, y: 320, w: 140 }
    ];

    // 10 Cilus: one on the ground near the start, nine on platforms
    L1.tokens = [{ x: 200, y: floorPos_y - 25, got: false }];
    for (const i of [0, 2, 3, 4, 5, 6, 8, 9, 10]) {
        const p = L1.platforms[i];
        L1.tokens.push({ x: p.x + p.w / 2, y: p.y - 25, got: false });
    }

    L1.trees = [150, 900, 1600, 2300, 2820];

    // Dark storm clouds in a dense band across the top (screen space)
    L1.clouds = [];
    const count = 22;
    const span = width + 300;
    for (let i = 0; i < count; i++) {
        L1.clouds.push({
            x: -150 + (i / count) * span + random(-15, 15),
            y: random(0, 55),
            w: random(150, 230),
            h: random(90, 130),
            dir: 1
        });
    }

    L1.drops = [];
    for (let i = 0; i < 220; i++) L1.drops.push(l1_newDrop(true));

    // Hand the level's layout to the shared physics in sketch.js
    levelPlatforms = L1.platforms;
    levelPits = L1.pits;
    worldWidth = L1_WORLD_W;

    l1_respawn();
    L1.invuln = 0;
}

// ------------------------------------------
// MAIN LOOP
// ------------------------------------------
function drawLevel1() {
    if (!L1.platforms) initLevel1();

    if (L1.phase === "PLAY") {
        updateGameChar();
        l1_collectCilus();
        l1_updateLightning();
        l1_checkDeath();
        l1_checkGoal();
    } else if (L1.phase === "CLEARING") {
        l1_updateClearing();
    }
    if (L1.invuln > 0) L1.invuln--;

    l1_updateClouds();
    L1.camX = constrain(gameChar_x - width * 0.4, 0, L1_WORLD_W - width);

    // ---- Sky (screen space): sun first so the clouds hide it ----
    background(lerpColor(color(...L1_SKY_STORM), color(...L1_SKY_CLEAR), L1.skyBlend));
    l1_drawSun();
    l1_drawClouds();

    // ---- World (scrolls with the camera) ----
    push();
    translate(-L1.camX, 0);
    for (const tx of L1.trees) l1_drawTree(tx);
    l1_drawGround();
    l1_drawPlatforms();
    for (const t of L1.tokens) {
        if (!t.got) l1_drawCilus(t.x, t.y + sin(frameCount * 0.06 + t.x) * 4);
    }
    l1_drawUmbrella();
    if (typeof drawZetaNPC === 'function') {
        push(); drawZetaNPC(L1_ZETA_X, floorPos_y); pop();
    }
    if (L1.invuln === 0 || frameCount % 8 < 4) {
        push(); drawCharacter(); pop();
    }
    l1_drawPonds();       // drawn after Kobo so she sinks into the water
    l1_drawLightning();
    l1_drawZetaHint();
    pop();

    l1_drawRain();

    // ---- Screen overlays ----
    noStroke();
    if (L1.flashT > 0) { fill(255, L1.flashT * 18); rect(0, 0, width, height); L1.flashT--; }
    if (L1.hurtFlash > 0) { fill(255, 0, 0, L1.hurtFlash * 5); rect(0, 0, width, height); L1.hurtFlash--; }

    l1_drawHUD();
    l1_drawBanner();
}

function level1KeyPressed() {
    if (keyCode !== ENTER) return;
    if (L1.phase === "GAMEOVER") initLevel1();
    else if (L1.phase === "DONE") l1_goToLevel2();
}

// ------------------------------------------
// GAME RULES
// ------------------------------------------
function l1_respawn() {
    gameChar_x = L1_START_X;
    gameChar_y = floorPos_y;
    gameChar_vy = 0;
    isFalling = false;
    L1.invuln = 90;           // ~1.5s of blinking safety after respawn
    L1.warnT = 0;
    L1.boltT = 0;
    L1.boltTimer = 120;
    L1.boltX = 0;
    L1.boltPts = [];
}

function l1_loseLife(force) {
    if (L1.invuln > 0 && !force) return;
    L1.lives--;
    L1.hurtFlash = 20;
    if (L1.lives <= 0) {
        L1.lives = 0;
        L1.phase = "GAMEOVER";
        return;
    }
    l1_respawn();             // Cilus already collected are kept
}

function l1_checkDeath() {
    if (gameChar_y > floorPos_y + 45) l1_loseLife(true);   // fell into a pond
}

function l1_collectCilus() {
    for (const t of L1.tokens) {
        if (t.got) continue;
        const hitX = abs(gameChar_x - t.x) < L1_KOBO_HALF_W + 16;
        const hitY = gameChar_y > t.y - 15 && gameChar_y - L1_KOBO_H < t.y + 15;
        if (hitX && hitY) {
            t.got = true;
            L1.cilus++;
        }
    }
}

function l1_checkGoal() {
    if (L1.cilus >= L1_TOTAL_CILUS && gameChar_x > L1_GOAL_X - 80 && !isFalling) {
        L1.phase = "CLEARING";
        L1.clearT = 0;
        L1.warnT = 0;
        L1.boltT = 0;
        isLeft = false;
        isRight = false;
        gameChar_x = L1_GOAL_X - 55;
        for (const c of L1.clouds) c.dir = c.x < width / 2 ? -1 : 1;
    }
}

function l1_updateClearing() {
    L1.clearT++;
    const t = L1.clearT;
    L1.umbrellaOpen = constrain(t / 40, 0, 1);       // Zeta opens the umbrella
    if (t > 40) L1.rainOn = false;                   // rain stops
    L1.skyBlend = constrain((t - 60) / 120, 0, 1);   // grey -> blue, sun revealed
    if (t > 260) L1.phase = "DONE";
}

function l1_goToLevel2() {
    levelPlatforms = [];
    levelPits = [];
    worldWidth = null;
    gameChar_x = 100;
    gameChar_y = floorPos_y;
    gameChar_vy = 0;
    if (typeof initLevel2 === 'function') initLevel2();
    gameState = "ACT2";
}

// ------------------------------------------
// LIGHTNING: warning flash, then a strike
// ------------------------------------------
function l1_updateLightning() {
    if (L1.boltT > 0) {
        L1.boltT--;
        if (abs(gameChar_x - L1.boltX) < 30) l1_loseLife(false);
        return;
    }
    if (L1.warnT > 0) {
        L1.warnT--;
        if (L1.warnT === 0) {
            L1.boltT = 14;
            L1.flashT = 8;
            L1.boltPts = l1_makeBolt(L1.boltX);
        }
        return;
    }
    L1.boltTimer--;
    if (L1.boltTimer <= 0) {
        L1.boltX = constrain(gameChar_x + random(-220, 220), 60, L1_WORLD_W - 60);
        L1.warnT = 50;                    // ~0.8s warning so it's dodgeable
        L1.boltTimer = random(150, 260);
    }
}

function l1_makeBolt(x) {
    const pts = [[x, 100]];
    let y = 100;
    while (y < floorPos_y) {
        y = min(y + random(35, 55), floorPos_y);
        pts.push([x + random(-22, 22), y]);
    }
    return pts;
}

function l1_drawLightning() {
    if (L1.warnT > 0 && frameCount % 10 < 6) {
        noStroke();
        fill(255, 220, 80, 70);
        rect(L1.boltX - 30, 100, 60, floorPos_y - 100);
    }
    if (L1.boltT > 0) {
        noFill();
        stroke(255, 160, 0);
        strokeWeight(7);
        beginShape();
        for (const p of L1.boltPts) vertex(p[0], p[1]);
        endShape();
        stroke(255, 245, 200);
        strokeWeight(2);
        beginShape();
        for (const p of L1.boltPts) vertex(p[0], p[1]);
        endShape();
        noStroke();
    }
}

// ------------------------------------------
// SKY: sun, clouds, rain
// ------------------------------------------
function l1_drawSun() {
    // The sun follows Kobo across the sky (hidden behind clouds until they part)
    L1.sunX = lerp(L1.sunX, gameChar_x - L1.camX, 0.03);
    push();
    translate(L1.sunX, 60);
    if (L1.skyBlend > 0.4) {
        const a = map(L1.skyBlend, 0.4, 1, 0, 255);
        stroke(255, 230, 0, a);
        strokeWeight(6);
        for (let i = 0; i < 8; i++) {
            const ang = frameCount * 0.01 + i * TWO_PI / 8;
            line(cos(ang) * 55, sin(ang) * 55, cos(ang) * 105, sin(ang) * 105);
        }
    }
    noStroke();
    fill(255, 230, 0);
    ellipse(0, 0, 80);
    pop();
}

function l1_updateClouds() {
    for (const c of L1.clouds) {
        if (L1.phase === "CLEARING" || L1.phase === "DONE") {
            if (L1.clearT > 40) c.x += c.dir * min(9, (L1.clearT - 40) * 0.12);
        } else {
            c.x += 0.6;                                   // drift right forever
            if (c.x > width + 150) c.x -= width + 300;    // wrap around
        }
    }
}

function l1_drawClouds() {
    stroke(70);
    strokeWeight(1);
    fill(18, 18, 24);
    for (const c of L1.clouds) {
        ellipse(c.x, c.y, c.w, c.h);
        ellipse(c.x - c.w * 0.3, c.y + c.h * 0.25, c.w * 0.6, c.h * 0.7);
        ellipse(c.x + c.w * 0.3, c.y + c.h * 0.2, c.w * 0.65, c.h * 0.75);
    }
    noStroke();
}

function l1_newDrop(anywhere) {
    return {
        x: random(width),
        y: anywhere ? random(-height, height) : random(-60, -10),
        len: random(12, 22),
        spd: random(9, 14),
        dead: false
    };
}

function l1_drawRain() {
    stroke(255, 200);
    strokeWeight(1.5);
    for (const d of L1.drops) {
        if (d.dead) continue;
        d.y += d.spd;
        if (d.y > height) {
            if (L1.rainOn) Object.assign(d, l1_newDrop(false));
            else { d.dead = true; continue; }
        }
        line(d.x, d.y, d.x - 1, d.y + d.len);
    }
    noStroke();
}

// ------------------------------------------
// WORLD DRAWING
// ------------------------------------------
function l1_drawTree(x) {
    noStroke();
    fill(150, 20, 20);
    rect(x - 12, floorPos_y - 280, 24, 280);
    fill(60, 180, 60);
    ellipse(x, floorPos_y - 300, 170, 230);
}

function l1_drawGround() {
    noStroke();
    fill(70, 200, 60);
    rect(0, floorPos_y, L1_WORLD_W, height - floorPos_y);
}

function l1_drawPonds() {
    noStroke();
    fill(25, 85, 200);
    for (const p of L1.pits) rect(p.x, floorPos_y, p.w, height - floorPos_y);
}

function l1_drawPlatforms() {
    noStroke();
    fill(0, 230, 230);
    for (const p of L1.platforms) rect(p.x, p.y, p.w, 16);
}

function l1_drawUmbrella() {
    const px = L1_GOAL_X;
    const top = floorPos_y - 190;
    stroke(240);
    strokeWeight(6);
    line(px, floorPos_y, px, top);
    noStroke();
    fill(20, 60, 220);
    const o = L1.umbrellaOpen;
    if (o < 0.05) {
        ellipse(px, top + 70, 28, 120);    // closed
    } else {
        arc(px, top + 20, lerp(40, 220, o), lerp(160, 120, o), PI, TWO_PI, CHORD);
    }
}

function l1_drawCilus(x, y) {
    push();
    translate(x, y);
    noFill();
    strokeWeight(3);
    const ring = [[255, 90, 90], [255, 170, 60], [255, 230, 70], [90, 210, 110], [80, 170, 255], [170, 110, 255]];
    for (let i = 0; i < ring.length; i++) {
        stroke(...ring[i]);
        ellipse(0, 8, 46 - i * 5, 14 - i * 1.6);
    }
    noStroke();
    fill(255);
    arc(0, 8, 30, 36, PI, TWO_PI, CHORD);
    ellipse(-17, 6, 10, 6);
    ellipse(17, 6, 10, 6);
    stroke(80);
    strokeWeight(1.5);
    line(-7, -1, -3, -1);
    line(3, -1, 7, -1);
    noStroke();
    fill(255, 160, 180, 160);
    ellipse(-9, 3, 5, 3);
    ellipse(9, 3, 5, 3);
    pop();
}

function l1_drawZetaHint() {
    if (L1.phase !== "PLAY") return;
    if (abs(gameChar_x - L1_ZETA_X) < 300 && L1.cilus < L1_TOTAL_CILUS) {
        noStroke();
        fill(255);
        textAlign(CENTER, BOTTOM);
        textSize(15);
        text(`Bring me all ${L1_TOTAL_CILUS} Cilus, Kobo! (${L1.cilus}/${L1_TOTAL_CILUS})`, L1_ZETA_X, floorPos_y - 210);
    }
}

// ------------------------------------------
// HUD + MESSAGES
// ------------------------------------------
function l1_drawHUD() {
    push();
    fill(0, 200);
    stroke(255);
    strokeWeight(3);
    rect(20, 15, 280, 72);
    noStroke();
    fill(255);
    textAlign(LEFT, TOP);
    textSize(20);
    text(`LIVES ${L1.lives}/${L1_MAX_LIVES}`, 35, 25);
    text(`KOBO CILUS ${L1.cilus}/${L1_TOTAL_CILUS}`, 35, 52);
    pop();
}

function l1_drawBanner() {
    if (L1.phase === "DONE") l1_centerMsg("The storm has cleared!", "Press ENTER for Level 2");
    else if (L1.phase === "GAMEOVER") l1_centerMsg("Out of lives!", "Press ENTER to try again");
}

function l1_centerMsg(title, sub) {
    push();
    noStroke();
    fill(0, 170);
    rect(width / 2 - 260, height / 2 - 60, 520, 120, 12);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(30);
    text(title, width / 2, height / 2 - 18);
    textSize(18);
    fill(255, 220, 0);
    text(sub, width / 2, height / 2 + 25);
    pop();
}
