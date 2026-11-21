// ==========================================
// LEVEL 3 — THE RAINBOW (level3.js)
// Collect 5 tokens of each colour (30 total), avoid the ponds,
// then jump onto the podium. The rain clears, the rainbow
// appears, the screen turns white and the end scene begins.
// Platforms, ponds and token positions are re-randomised on
// every attempt, but always reachable.
// Needs: sketch.js (updateGameChar, levelPlatforms, levelPits, worldWidth),
//        character.js (drawCharacter), endScene.js (initEndScene)
// ==========================================

const L3 = {};

const L3_WORLD_W = 3520;
const L3_START_X = 120;
const L3_PODIUM_X = 3350;     // centre of the podium
const L3_PER_COLOUR = 5;
const L3_MAX_LIVES = 3;
const L3_KOBO_HALF_W = 16;    // Kobo's hitbox: keep in step with level1.js
const L3_KOBO_H = 120;
const L3_TOKEN_SPACING = 80;  // minimum distance between tokens

const L3_COLOURS = {
    red:    [235, 40, 40],
    orange: [255, 140, 0],
    yellow: [255, 225, 0],
    green:  [40, 200, 60],
    blue:   [70, 170, 255],
    purple: [150, 50, 220]
};
const L3_COLOUR_NAMES = Object.keys(L3_COLOURS);

const L3_SKY_RAIN = [10, 30, 225];      // darker blue
const L3_SKY_CLEAR = [51, 183, 255];    // the storyboard's clear blue

// ------------------------------------------
// SETUP
// ------------------------------------------
function initLevel3() {
    L3.lives = L3_MAX_LIVES;
    L3.counts = {};
    for (const c of L3_COLOUR_NAMES) L3.counts[c] = 0;
    L3.phase = "PLAY";        // PLAY | RAINBOW | WHITE | GAMEOVER
    L3.t = 0;
    L3.camX = 0;
    L3.hurtFlash = 0;
    L3.skyBlend = 0;
    L3.rainbow = 0;
    L3.white = 0;
    L3.rainOn = true;

    l3_buildPodium();
    l3_generateLayout();
    l3_scatterTokens();

    L3.trees = [];
    for (let x = 60; x < L3_WORLD_W - 250; x += random(380, 560)) L3.trees.push(x);
    L3.bushes = [];
    for (let x = 0; x < L3_WORLD_W - 200; x += random(260, 420)) L3.bushes.push({ x, w: random(140, 200) });

    // Light grey rain clouds drifting right (screen space)
    L3.clouds = [];
    for (let i = 0; i < 5; i++) {
        L3.clouds.push({ x: i * 240 + random(-30, 30), y: random(45, 85), w: random(180, 240), spd: random(0.5, 0.9) });
    }
    L3.drops = [];
    for (let i = 0; i < 200; i++) L3.drops.push(l3_newDrop(true));

    levelPlatforms = L3.platforms.concat(L3.podiumTops);
    levelPits = L3.pits;
    worldWidth = L3_WORLD_W;

    l3_respawn();
    L3.invuln = 0;
}

function l3_buildPodium() {
    const px = L3_PODIUM_X;
    const f = floorPos_y;
    // Solid boxes: Kobo can stand on them but not walk through them
    L3.podium = {
        base:   { x: px - 70, y: f - 40,  w: 140, h: 40 },
        pillar: { x: px - 24, y: f - 172, w: 48,  h: 132 },
        top:    { x: px - 62, y: f - 202, w: 124, h: 30 }
    };
    L3.podiumTops = [
        { x: L3.podium.base.x, y: L3.podium.base.y, w: L3.podium.base.w },
        { x: L3.podium.top.x,  y: L3.podium.top.y,  w: L3.podium.top.w }
    ];
    // Fixed stepping platform so the podium top is always reachable
    L3.step = { x: px - 270, y: f - 110, w: 125 };
}

// Ponds and platforms, randomised but always reachable:
// low platforms can be reached from the ground, mid ones only follow
// a low or mid one, high ones only follow a mid or high one.
function l3_generateLayout() {
    const f = floorPos_y;

    L3.pits = [];
    let x = random(420, 560);
    while (x < L3_PODIUM_X - 560) {     // keep ponds well clear of the podium step
        const w = random(110, 150);
        L3.pits.push({ x, w });
        x += w + random(420, 700);
    }

    const tierY = [0, () => f - random(85, 110), () => f - random(165, 190), () => f - random(235, 250)];
    L3.platforms = [];
    let prevEnd = random(160, 220);
    let prevTier = 0;
    while (true) {
        const options = [1];
        if (prevTier >= 1) options.push(prevTier, min(prevTier + 1, 3));
        if (prevTier >= 2) options.push(prevTier - 1);
        const tier = random(options);
        // Climbing (or staying high) needs a short gap; dropping down can be wider
        const climbing = tier > prevTier || (tier === prevTier && tier > 1);
        const gap = prevTier === 0 ? random(100, 140) : climbing ? random(60, 100) : random(90, 170);
        const w = random(110, 150);
        const x = prevEnd + gap;
        if (x + w > L3.step.x - 40) break;      // leave room for the fixed step
        L3.platforms.push({ x, y: tierY[tier](), w, tier });
        prevEnd = x + w;
        prevTier = tier;
    }
    L3.platforms.push({ x: L3.step.x, y: L3.step.y, w: L3.step.w, tier: 1 });
}

// 30 tokens (5 of each colour) spread over platforms, the ground and
// mid-air jump spots, kept at least L3_TOKEN_SPACING apart.
function l3_scatterTokens() {
    const f = floorPos_y;
    const spots = [];

    for (const p of L3.platforms) {
        spots.push({ x: p.x + p.w / 2, y: p.y - 28 });
        if (p.w >= 135) {
            spots.push({ x: p.x + p.w * 0.25, y: p.y - 28 });
            spots.push({ x: p.x + p.w * 0.75, y: p.y - 28 });
        }
    }
    for (let gx = 220; gx < L3_PODIUM_X - 320; gx += random(55, 85)) {
        const nearPit = L3.pits.some(p => gx > p.x - 25 && gx < p.x + p.w + 25);
        const s = nearPit
            ? { x: gx, y: f - 85 }                                   // grab it while jumping the pond
            : { x: gx, y: random() < 0.6 ? f - 28 : f - 165 };       // on the ground, or high enough to need a jump
        // skip spots that would sit inside a low platform
        const clash = L3.platforms.some(p => s.x > p.x - 20 && s.x < p.x + p.w + 20 && abs(p.y - s.y) < 40);
        if (!clash) spots.push(s);
    }

    shuffle(spots, true);
    const picked = [];
    const total = L3_PER_COLOUR * L3_COLOUR_NAMES.length;
    for (const minGap of [L3_TOKEN_SPACING, 60, 40, 0]) {
        for (const s of spots) {
            if (picked.length >= total) break;
            if (picked.includes(s)) continue;
            if (picked.every(q => dist(q.x, q.y, s.x, s.y) >= minGap)) picked.push(s);
        }
        if (picked.length >= total) break;
    }

    const colours = [];
    for (const c of L3_COLOUR_NAMES) for (let i = 0; i < L3_PER_COLOUR; i++) colours.push(c);
    shuffle(colours, true);

    L3.tokens = picked.map((s, i) => ({ x: s.x, y: s.y, colour: colours[i], got: false }));
}

// ------------------------------------------
// MAIN LOOP
// ------------------------------------------
function drawLevel3() {
    if (!L3.platforms) initLevel3();

    if (L3.phase === "PLAY") {
        updateGameChar();
        l3_blockPodium();
        l3_collectTokens();
        l3_checkDeath();
        l3_checkGoal();
    } else if (L3.phase === "RAINBOW" || L3.phase === "WHITE") {
        if (l3_updateFinale()) return;     // moved on to the end scene
    }
    if (L3.invuln > 0) L3.invuln--;

    L3.camX = constrain(gameChar_x - width * 0.4, 0, L3_WORLD_W - width);

    // ---- Sky (screen space) ----
    background(lerpColor(color(...L3_SKY_RAIN), color(...L3_SKY_CLEAR), L3.skyBlend));
    l3_drawSun();
    l3_drawRainbow();
    l3_drawClouds();

    // ---- World (scrolls with the camera) ----
    push();
    translate(-L3.camX, 0);
    for (const tx of L3.trees) l3_drawPalm(tx);
    for (const b of L3.bushes) l3_drawBush(b);
    l3_drawGround();
    l3_drawPlatforms();
    l3_drawPodium();
    for (const t of L3.tokens) {
        if (!t.got) l3_drawToken(t.x, t.y + sin(frameCount * 0.06 + t.x) * 4, t.colour);
    }
    if (L3.invuln === 0 || frameCount % 8 < 4) {
        push(); drawCharacter(); pop();
    }
    l3_drawPonds();
    l3_drawPodiumHint();
    pop();

    l3_drawRain();

    // ---- Screen overlays ----
    noStroke();
    if (L3.hurtFlash > 0) { fill(255, 0, 0, L3.hurtFlash * 5); rect(0, 0, width, height); L3.hurtFlash--; }

    l3_drawHUD();
    if (L3.white > 0) { noStroke(); fill(255, L3.white); rect(0, 0, width, height); }
    if (L3.phase === "GAMEOVER") l3_centerMsg("Out of lives!", "Press ENTER or click to try again");
}

// Enter / Space / click on the game-over screen. Returns true if it did something.
function level3Continue() {
    if (L3.phase === "GAMEOVER") { initLevel3(); return true; }
    return false;
}

function level3KeyPressed() {
    if (keyCode === ENTER || keyCode === RETURN || keyCode === 32) return level3Continue();
    return false;
}

// ------------------------------------------
// GAME RULES
// ------------------------------------------
function l3_respawn() {
    gameChar_x = L3_START_X;
    gameChar_y = floorPos_y;
    gameChar_vy = 0;
    isFalling = false;
    L3.invuln = 90;
}

function l3_loseLife() {
    L3.lives--;
    L3.hurtFlash = 20;
    if (L3.lives <= 0) {
        L3.lives = 0;
        L3.phase = "GAMEOVER";
        return;
    }
    l3_respawn();             // tokens already collected are kept
}

function l3_checkDeath() {
    if (gameChar_y > floorPos_y + 45) l3_loseLife();   // fell into a pond
}

// Keep Kobo from walking through the podium's sides
function l3_blockPodium() {
    for (const b of Object.values(L3.podium)) {
        const feetBelowTop = gameChar_y > b.y + 2;
        const headAboveBottom = gameChar_y - L3_KOBO_H < b.y + b.h;
        const inX = gameChar_x > b.x - L3_KOBO_HALF_W && gameChar_x < b.x + b.w + L3_KOBO_HALF_W;
        if (feetBelowTop && headAboveBottom && inX) {
            gameChar_x = gameChar_x < b.x + b.w / 2 ? b.x - L3_KOBO_HALF_W : b.x + b.w + L3_KOBO_HALF_W;
        }
    }
}

function l3_collectTokens() {
    for (const t of L3.tokens) {
        if (t.got) continue;
        const hitX = abs(gameChar_x - t.x) < L3_KOBO_HALF_W + 14;
        const hitY = gameChar_y > t.y - 14 && gameChar_y - L3_KOBO_H < t.y + 14;
        if (hitX && hitY) {
            t.got = true;
            L3.counts[t.colour]++;
        }
    }
}

function l3_allCollected() {
    return L3_COLOUR_NAMES.every(c => L3.counts[c] >= L3_PER_COLOUR);
}

function l3_totalCollected() {
    return L3_COLOUR_NAMES.reduce((sum, c) => sum + L3.counts[c], 0);
}

function l3_onPodiumTop() {
    const top = L3.podium.top;
    return !isFalling && gameChar_y === top.y && gameChar_x > top.x && gameChar_x < top.x + top.w;
}

function l3_checkGoal() {
    if (l3_allCollected() && l3_onPodiumTop()) {
        L3.phase = "RAINBOW";
        L3.t = 0;
        isLeft = false;
        isRight = false;
    }
}

// Storyboard: rain clouds go away, sky turns clear blue, rainbow appears,
// then the screen turns white and fades into the end scene.
function l3_updateFinale() {
    L3.t++;
    const t = L3.t;
    if (t === 1) {
        L3.rainOn = false;
        for (const c of L3.clouds) c.dir = c.x < width / 2 ? -1 : 1;
    }
    L3.skyBlend = constrain(t / 40, 0, 1);
    L3.rainbow = constrain((t - 20) / 50, 0, 1);
    if (t > 150) {
        L3.phase = "WHITE";
        L3.white = constrain(map(t, 150, 220, 0, 255), 0, 255);
    }
    if (t > 235) {
        l3_goToEnd();
        return true;
    }
    return false;
}

function l3_goToEnd() {
    levelPlatforms = [];
    levelPits = [];
    worldWidth = null;
    isLeft = false;
    isRight = false;
    gameState = "END";
    if (typeof initEndScene === 'function') initEndScene();
}

// ------------------------------------------
// SKY: sun, rainbow, clouds, rain
// ------------------------------------------
function l3_drawSun() {
    noStroke();
    fill(255, 235, 0);
    ellipse(width * 0.56, 160, 84);    // below the cloud band so it shines
}

function l3_drawRainbow() {
    if (L3.rainbow <= 0) return;
    push();
    noFill();
    strokeWeight(14);
    const a = 210 * L3.rainbow;
    L3_COLOUR_NAMES.forEach((c, i) => {
        stroke(...L3_COLOURS[c], a);
        const d = 980 - i * 28;
        arc(width / 2, floorPos_y + 40, d, d * 0.78, PI, TWO_PI);
    });
    pop();
}

function l3_drawClouds() {
    stroke(110);
    strokeWeight(1.5);
    fill(165, 165, 172);
    for (const c of L3.clouds) {
        if (L3.phase === "PLAY" || L3.phase === "GAMEOVER") {
            c.x += c.spd;
            if (c.x > width + c.w) c.x -= width + c.w * 2;
        } else {
            c.x += c.dir * min(14, L3.t * 0.4);    // clouds clear away fast
        }
        ellipse(c.x, c.y, c.w, c.w * 0.45);
        ellipse(c.x - c.w * 0.28, c.y + 8, c.w * 0.55, c.w * 0.35);
        ellipse(c.x + c.w * 0.3, c.y + 6, c.w * 0.6, c.w * 0.38);
        ellipse(c.x + c.w * 0.05, c.y - c.w * 0.12, c.w * 0.5, c.w * 0.35);
    }
    noStroke();
}

// Rain only falls from under the clouds
function l3_newDrop(anywhere) {
    const c = random(L3.clouds);
    return {
        cloud: c,
        dx: random(-c.w * 0.4, c.w * 0.4),
        y: anywhere ? random(c.y, height) : c.y + random(10, 30),
        len: random(12, 22),
        spd: random(8, 12)
    };
}

function l3_drawRain() {
    stroke(255, 210);
    strokeWeight(1.5);
    for (const d of L3.drops) {
        if (d.dead) continue;
        d.y += d.spd;
        if (d.y > height) {
            if (L3.rainOn) Object.assign(d, l3_newDrop(false));
            else { d.dead = true; continue; }
        }
        const x = d.cloud.x + d.dx;
        line(x, d.y, x - 1, d.y + d.len);
    }
    noStroke();
}

// ------------------------------------------
// WORLD DRAWING
// ------------------------------------------
function l3_drawPalm(x) {
    const f = floorPos_y;
    noStroke();
    fill(150, 90, 30);
    quad(x - 11, f, x + 11, f, x + 7, f - 200, x - 5, f - 200);
    push();
    translate(x + 1, f - 200);
    fill(55, 120, 30);
    for (let i = 0; i < 6; i++) {
        push();
        rotate(-PI + i * PI / 5 + sin(frameCount * 0.02 + x) * 0.04);
        ellipse(70, 0, 150, 26);
        pop();
    }
    fill(110, 70, 25);
    ellipse(-8, 10, 16);
    ellipse(9, 12, 16);
    pop();
}

function l3_drawBush(b) {
    noStroke();
    fill(45, 105, 30);
    arc(b.x, floorPos_y, b.w, b.w * 0.75, PI, TWO_PI, CHORD);
}

function l3_drawGround() {
    noStroke();
    fill(40, 225, 40);
    rect(0, floorPos_y, L3_WORLD_W, height - floorPos_y);
}

function l3_drawPonds() {
    noStroke();
    fill(20, 85, 205);
    for (const p of L3.pits) rect(p.x, floorPos_y, p.w, height - floorPos_y);
}

function l3_drawPlatforms() {
    noStroke();
    for (const p of L3.platforms) {
        fill(255, 230, 0);
        rect(p.x, p.y, p.w, 18);
        fill(215, 180, 0);
        rect(p.x, p.y + 14, p.w, 4);
    }
}

function l3_drawPodium() {
    stroke(0, 230, 255);
    strokeWeight(5);
    fill(255);
    for (const b of [L3.podium.base, L3.podium.pillar, L3.podium.top]) rect(b.x, b.y, b.w, b.h);
    noStroke();
}

function l3_drawToken(x, y, colourName) {
    push();
    translate(x, y);
    stroke(255);
    strokeWeight(2);
    fill(...L3_COLOURS[colourName]);
    ellipse(0, 0, 30);
    noStroke();
    fill(255, 140);
    ellipse(-6, -6, 9);
    pop();
}

function l3_drawPodiumHint() {
    if (L3.phase !== "PLAY" || l3_allCollected()) return;
    if (abs(gameChar_x - L3_PODIUM_X) < 330) {
        noStroke();
        fill(255);
        textAlign(CENTER, BOTTOM);
        textSize(15);
        const total = L3_PER_COLOUR * L3_COLOUR_NAMES.length;
        text(`Collect every colour first! (${l3_totalCollected()}/${total})`, L3_PODIUM_X - 40, L3.podium.top.y - 20);
    }
}

// ------------------------------------------
// HUD + MESSAGES
// ------------------------------------------
function l3_drawHUD() {
    push();
    fill(0, 170);
    stroke(255);
    strokeWeight(3);
    rect(20, 15, 290, 122);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(18);
    fill(255);
    text(`LIVES ${L3.lives}/${L3_MAX_LIVES}`, 35, 23);
    L3_COLOUR_NAMES.forEach((c, i) => {
        const col = i % 2;
        const row = floor(i / 2);
        const x = 35 + col * 140;
        const y = 50 + row * 27;
        fill(...L3_COLOURS[c]);
        ellipse(x + 7, y + 9, 13);
        fill(L3.counts[c] >= L3_PER_COLOUR ? color(255, 230, 0) : color(255));
        text(`${c.toUpperCase()} ${L3.counts[c]}/${L3_PER_COLOUR}`, x + 20, y);
    });
    pop();
}

function l3_centerMsg(title, sub) {
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
