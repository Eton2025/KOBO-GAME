


// ==========================================
// LEVEL 2 — THE HAZE (level2.js)
// Collect 10 storm clouds, avoid ditches and fire,
// then bring them to Kaela's anvil. She forges them into
// a storm that blots out the haze and brings the rain.
// Needs: sketch.js (updateGameChar, levelPlatforms, levelPits, worldWidth),
//        character.js (drawCharacter), kaela.js (drawKaelaNPC)
// ==========================================
 
const L2 = {};
 
const L2_WORLD_W = 3000;
const L2_START_X = 100;
const L2_ANVIL_X = 2800;
const L2_KAELA_X = 2890;
const L2_TOTAL_STORMS = 10;
const L2_MAX_LIVES = 3;
const L2_KOBO_HALF_W = 16;    // Kobo's hitbox: keep in step with level1.js
const L2_KOBO_H = 70;
const L2_FIRE_MAX_H = 110;    // low enough to stand safely on a platform above it
const L2_FIRE_CYCLE = 200;    // frames per fire cycle
 
const L2_SKY_HAZE = [228, 132, 24];
const L2_SKY_STORM = [100, 100, 106];
 
// ------------------------------------------
// SETUP
// ------------------------------------------
function initLevel2() {
    L2.lives = L2_MAX_LIVES;
    L2.storms = 0;
    L2.phase = "PLAY";        // PLAY | FORGING | DONE | GAMEOVER
    L2.t = 0;                 // timer for the forging sequence
    L2.doneT = 0;
    L2.camX = 0;
    L2.hurtFlash = 0;
    L2.skyBlend = 0;          // 0 = orange haze, 1 = storm grey
    L2.hazeAlpha = 1;
    L2.fireScale = 1;
    L2.forgeCloud = 0;        // size of the cloud Kaela forges (0..1)
    L2.clangs = [];
    L2.rainOn = false;
    L2.sunX = width / 2;
 
    // Ditches: fall in and lose a life
    L2.pits = [
        { x: 560,  w: 150 },
        { x: 1250, w: 170 },
        { x: 1900, w: 160 },
        { x: 2400, w: 150 }
    ];
 
    // Floating platforms (y = top surface). Floor is at floorPos_y (432).
    L2.platforms = [
        { x: 300,  y: 340, w: 130 },
        { x: 560,  y: 320, w: 150 },
        { x: 800,  y: 240, w: 130 },
        { x: 1030, y: 330, w: 130 },
        { x: 1260, y: 250, w: 150 },
        { x: 1500, y: 170, w: 130 },
        { x: 1700, y: 320, w: 130 },
        { x: 1910, y: 300, w: 140 },
        { x: 2150, y: 220, w: 130 },
        { x: 2400, y: 320, w: 150 }
    ];
 
    // 10 storm-cloud tokens: two on the ground, eight on platforms
    L2.tokens = [
        { x: 180,  y: floorPos_y - 25, got: false },
        { x: 1100, y: floorPos_y - 25, got: false }
    ];
    for (const i of [0, 2, 3, 4, 5, 6, 8, 9]) {
        const p = L2.platforms[i];
        L2.tokens.push({ x: p.x + p.w / 2, y: p.y - 25, got: false });
    }
 
    // Fires spring up from the ground on a cycle, each out of step with the others
    L2.fires = [430, 980, 1600, 2250, 2650].map((x, i) => ({ x, offset: i * 47 }));
 
    L2.trees = [200, 950, 1580, 2300];
 
    // Big translucent haze clouds drifting left (screen space)
    L2.haze = [];
    for (let i = 0; i < 7; i++) {
        L2.haze.push({ x: i * 190, y: random(40, 200), d: random(220, 340), spd: random(0.3, 0.6) });
    }
 
    // Black storm clouds that roll in from both sides at the end (screen space)
    L2.storm = [];
    for (let i = 0; i < 12; i++) {
        const fromLeft = i < 6;
        const k = i % 6;
        L2.storm.push({
            homeX: fromLeft ? k * 95 : width - k * 95,
            startX: fromLeft ? -250 - k * 60 : width + 250 + k * 60,
            y: random(0, 60),
            w: random(170, 240),
            h: random(100, 140)
        });
    }
 
    L2.drops = [];
    for (let i = 0; i < 220; i++) L2.drops.push(l2_newDrop(true));
 
    levelPlatforms = L2.platforms;
    levelPits = L2.pits;
    worldWidth = L2_WORLD_W;
 
    l2_respawn();
    L2.invuln = 0;
}
 
// ------------------------------------------
// MAIN LOOP
// ------------------------------------------
function drawLevel2() {
    if (!L2.platforms) initLevel2();
 
    if (L2.phase === "PLAY") {
        updateGameChar();
        l2_collectStorms();
        l2_checkFire();
        l2_checkDeath();
        l2_checkGoal();
    } else if (L2.phase === "FORGING") {
        l2_updateForging();
    } else if (L2.phase === "DONE") {
        L2.doneT++;
        if (L2.doneT > 360) { l2_goToLevel3(); return; }   // auto-continue after ~6s
    }
    if (L2.invuln > 0) L2.invuln--;
 
    L2.camX = constrain(gameChar_x - width * 0.4, 0, L2_WORLD_W - width);
 
    // ---- Sky (screen space) ----
    background(lerpColor(color(...L2_SKY_HAZE), color(...L2_SKY_STORM), L2.skyBlend));
    l2_drawSun();
    l2_drawHaze();
    l2_drawStormClouds();
 
    // ---- World (scrolls with the camera) ----
    push();
    translate(-L2.camX, 0);
    for (const tx of L2.trees) l2_drawTree(tx);
    l2_drawGround();
    l2_drawPlatforms();
    for (const f of L2.fires) l2_drawFire(f);
    for (const t of L2.tokens) {
        if (!t.got) l2_drawStormToken(t.x, t.y + sin(frameCount * 0.06 + t.x) * 4, 1);
    }
    l2_drawAnvil();
    if (typeof drawKaelaNPC === 'function') {
        push(); drawKaelaNPC(L2_KAELA_X, floorPos_y); pop();
    }
    if (L2.invuln === 0 || frameCount % 8 < 4) {
        push(); drawCharacter(); pop();
    }
    l2_drawDitches();     // after Kobo so she drops out of sight
    l2_drawForge();
    l2_drawKaelaHint();
    pop();
 
    l2_drawRain();
 
    // ---- Screen overlays ----
    noStroke();
    if (L2.hurtFlash > 0) { fill(255, 0, 0, L2.hurtFlash * 5); rect(0, 0, width, height); L2.hurtFlash--; }
 
    l2_drawHUD();
    l2_drawBanner();
}
 
// Enter / Space / click on the end screens. Returns true if it did something.
function level2Continue() {
    if (L2.phase === "GAMEOVER") { initLevel2(); return true; }
    if (L2.phase === "DONE") { l2_goToLevel3(); return true; }
    return false;
}
 
function level2KeyPressed() {
    if (keyCode === ENTER || keyCode === RETURN || keyCode === 32) return level2Continue();
    return false;
}
 
// ------------------------------------------
// GAME RULES
// ------------------------------------------
function l2_respawn() {
    gameChar_x = L2_START_X;
    gameChar_y = floorPos_y;
    gameChar_vy = 0;
    isFalling = false;
    L2.invuln = 90;
}
 
function l2_loseLife(force) {
    if (L2.invuln > 0 && !force) return;
    L2.lives--;
    L2.hurtFlash = 20;
    if (L2.lives <= 0) {
        L2.lives = 0;
        L2.phase = "GAMEOVER";
        return;
    }
    l2_respawn();             // storm clouds already collected are kept
}
 
function l2_checkDeath() {
    if (gameChar_y > floorPos_y + 45) l2_loseLife(true);   // fell into a ditch
}
 
function l2_collectStorms() {
    for (const t of L2.tokens) {
        if (t.got) continue;
        const hitX = abs(gameChar_x - t.x) < L2_KOBO_HALF_W + 18;
        const hitY = gameChar_y > t.y - 15 && gameChar_y - L2_KOBO_H < t.y + 15;
        if (hitX && hitY) {
            t.got = true;
            L2.storms++;
        }
    }
}
 
// Fire height for this frame: dormant -> flicker warning -> erupt -> die down
function l2_fireHeight(f) {
    const c = (frameCount + f.offset) % L2_FIRE_CYCLE;
    let h;
    if (c < 90) h = 0;
    else if (c < 125) h = 14 + sin(frameCount * 0.8) * 6;               // warning embers
    else if (c < 140) h = map(c, 125, 140, 20, L2_FIRE_MAX_H);          // erupting
    else if (c < 175) h = L2_FIRE_MAX_H + sin(frameCount * 0.5) * 8;    // full blaze
    else h = map(c, 175, L2_FIRE_CYCLE, L2_FIRE_MAX_H, 0);              // dying down
    return h * L2.fireScale;
}
 
function l2_checkFire() {
    for (const f of L2.fires) {
        const h = l2_fireHeight(f);
        if (h < 30) continue;   // embers are harmless
        if (abs(gameChar_x - f.x) < L2_KOBO_HALF_W + 14 && gameChar_y > floorPos_y - h) {
            l2_loseLife(false);
            return;
        }
    }
}
 
function l2_checkGoal() {
    if (L2.storms >= L2_TOTAL_STORMS && gameChar_x > L2_ANVIL_X - 90 && !isFalling) {
        L2.phase = "FORGING";
        L2.t = 0;
        isLeft = false;
        isRight = false;
        gameChar_x = L2_ANVIL_X - 70;
    }
}
 
// The ending from the storyboard, on a timeline
function l2_updateForging() {
    L2.t++;
    const t = L2.t;
    L2.forgeCloud = t < 140 ? constrain(t / 30, 0, 1) : constrain(1 - (t - 140) / 25, 0, 1);
    if ([45, 70, 95, 120].includes(t)) {                         // Kaela hammers
        L2.clangs.push({ life: 30 });
        l2_clangSound();
    }
    for (const c of L2.clangs) c.life--;
    L2.clangs = L2.clangs.filter(c => c.life > 0);
 
    const roll = constrain((t - 170) / 130, 0, 1);               // storm rolls in
    L2.skyBlend = roll;
    L2.hazeAlpha = 1 - roll;
    L2.fireScale = 1 - roll;
    if (t > 250) L2.rainOn = true;
    if (t > 380) L2.phase = "DONE";
}
 
function l2_goToLevel3() {
    levelPlatforms = [];
    levelPits = [];
    worldWidth = null;
    if (typeof initLevel3 === 'function') initLevel3();
    gameState = "ACT3";
}
 
// Short metallic "clang" made in the browser, no sound file needed
function l2_clangSound() {
    try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        L2.audio = L2.audio || new AC();
        const ctx = L2.audio;
        const now = ctx.currentTime;
        for (const freq of [620, 1410]) {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = "triangle";
            o.frequency.value = freq;
            g.gain.setValueAtTime(0.12, now);
            g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            o.connect(g);
            g.connect(ctx.destination);
            o.start(now);
            o.stop(now + 0.35);
        }
    } catch (e) { /* sound is optional */ }
}
 
// ------------------------------------------
// SKY
// ------------------------------------------
function l2_drawSun() {
    // Follows Kobo, peeking through the haze; the storm clouds cover it at the end
    L2.sunX = lerp(L2.sunX, gameChar_x - L2.camX, 0.03);
    noStroke();
    fill(255, 235, 60);
    ellipse(L2.sunX, 70, 80);
}
 
function l2_drawHaze() {
    if (L2.hazeAlpha <= 0) return;
    stroke(120, 70, 20, 90 * L2.hazeAlpha);
    strokeWeight(1);
    fill(245, 150, 30, 150 * L2.hazeAlpha);
    for (const h of L2.haze) {
        h.x -= h.spd;                                     // drift left
        if (h.x < -h.d) h.x += width + h.d * 2;           // wrap around
        ellipse(h.x, h.y, h.d);
    }
    noStroke();
}
 
function l2_drawStormClouds() {
    if (L2.phase !== "FORGING" && L2.phase !== "DONE") return;
    const roll = constrain((L2.t - 170) / 130, 0, 1);
    const e = 1 - pow(1 - roll, 3);                       // ease out
    stroke(70);
    strokeWeight(1);
    fill(18, 18, 24);
    for (const c of L2.storm) {
        const x = lerp(c.startX, c.homeX, e);
        ellipse(x, c.y, c.w, c.h);
        ellipse(x - c.w * 0.3, c.y + c.h * 0.25, c.w * 0.6, c.h * 0.7);
        ellipse(x + c.w * 0.3, c.y + c.h * 0.2, c.w * 0.65, c.h * 0.75);
    }
    noStroke();
}
 
function l2_newDrop(anywhere) {
    return {
        x: random(width),
        y: anywhere ? random(-height, 0) : random(-60, -10),
        len: random(12, 22),
        spd: random(9, 14)
    };
}
 
function l2_drawRain() {
    if (!L2.rainOn) return;
    stroke(255, 200);
    strokeWeight(1.5);
    for (const d of L2.drops) {
        d.y += d.spd;
        if (d.y > height) Object.assign(d, l2_newDrop(false));
        line(d.x, d.y, d.x - 1, d.y + d.len);
    }
    noStroke();
}
 
// ------------------------------------------
// WORLD DRAWING
// ------------------------------------------
function l2_drawTree(x) {
    noStroke();
    fill(150, 0, 0);
    rect(x - 10, floorPos_y - 260, 20, 260);
    fill(55, 120, 35);
    ellipse(x, floorPos_y - 290, 190, 240);
}
 
function l2_drawGround() {
    noStroke();
    fill(150, 0, 0);
    rect(0, floorPos_y, L2_WORLD_W, height - floorPos_y);
}
 
function l2_drawDitches() {
    noStroke();
    fill(95, 45, 10);
    for (const p of L2.pits) rect(p.x, floorPos_y, p.w, height - floorPos_y);
}
 
function l2_drawPlatforms() {
    noStroke();
    fill(38, 80, 25);
    for (const p of L2.platforms) rect(p.x, p.y, p.w, 18);
}
 
function l2_drawFire(f) {
    const h = l2_fireHeight(f);
    if (h <= 1) return;
    noStroke();
    const flick = sin(frameCount * 0.6 + f.x) * 4;
    fill(255, 30, 0);
    triangle(f.x - 26, floorPos_y, f.x + flick, floorPos_y - h, f.x + 26, floorPos_y);
    fill(255, 150, 0);
    triangle(f.x - 15, floorPos_y, f.x - flick, floorPos_y - h * 0.6, f.x + 15, floorPos_y);
    fill(255, 230, 80);
    triangle(f.x - 7, floorPos_y, f.x, floorPos_y - h * 0.3, f.x + 7, floorPos_y);
}
 
function l2_drawStormToken(x, y, s) {
    push();
    translate(x, y);
    scale(s);
    stroke(60);
    strokeWeight(1);
    fill(110, 110, 118);
    ellipse(0, 0, 44, 24);
    ellipse(-12, -6, 24, 20);
    ellipse(8, -9, 28, 24);
    ellipse(18, 1, 20, 16);
    pop();
}
 
function l2_drawAnvil() {
    const x = L2_ANVIL_X;
    const y = floorPos_y;
    noStroke();
    fill(20);
    rect(x - 45, y - 22, 90, 22);          // base
    quad(x - 18, y - 22, x + 18, y - 22, x + 10, y - 50, x - 10, y - 50);   // waist
    rect(x - 55, y - 70, 105, 22);         // face
    triangle(x + 50, y - 70, x + 50, y - 48, x + 78, y - 70);              // horn
}
 
function l2_drawForge() {
    if (L2.forgeCloud > 0) {
        // The 10 storm clouds become one big dark cloud over the anvil
        push();
        translate(L2_ANVIL_X, floorPos_y - 120 + sin(frameCount * 0.2) * 2);
        scale(L2.forgeCloud * 2.4);
        noStroke();
        fill(15, 15, 20);
        ellipse(0, 0, 60, 34);
        ellipse(-18, -8, 34, 28);
        ellipse(12, -12, 38, 32);
        ellipse(26, 2, 28, 22);
        pop();
    }
    for (const c of L2.clangs) {
        const a = map(c.life, 0, 30, 0, 255);
        fill(255, 240, 120, a);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(26 + (30 - c.life) * 0.4);
        text("CLANG!", L2_ANVIL_X + 40, floorPos_y - 200 - (30 - c.life));
    }
}
 
function l2_drawKaelaHint() {
    if (L2.phase !== "PLAY") return;
    if (abs(gameChar_x - L2_KAELA_X) < 320 && L2.storms < L2_TOTAL_STORMS) {
        noStroke();
        fill(255);
        textAlign(CENTER, BOTTOM);
        textSize(15);
        text(`I need all ${L2_TOTAL_STORMS} storm clouds to forge with! (${L2.storms}/${L2_TOTAL_STORMS})`, L2_KAELA_X - 60, floorPos_y - 160);
    }
}
 
// ------------------------------------------
// HUD + MESSAGES
// ------------------------------------------
function l2_drawHUD() {
    push();
    fill(0, 170);
    stroke(255);
    strokeWeight(3);
    rect(20, 15, 290, 72);
    noStroke();
    fill(255);
    textAlign(LEFT, TOP);
    textSize(20);
    text(`LIVES ${L2.lives}/${L2_MAX_LIVES}`, 35, 25);
    text(`KOBO STORMS ${L2.storms}/${L2_TOTAL_STORMS}`, 35, 52);
    pop();
}
 
function l2_drawBanner() {
    if (L2.phase === "DONE") {
        const secs = max(1, ceil((360 - L2.doneT) / 60));
        l2_centerMsg("The haze is washed away!", `Press ENTER or click for Level 3 (auto in ${secs}s)`);
    } else if (L2.phase === "GAMEOVER") l2_centerMsg("Out of lives!", "Press ENTER or click to try again");
}
 
function l2_centerMsg(title, sub) {
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
