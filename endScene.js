// ==========================================
// END SCENE — THE CELEBRATION (endScene.js)
// Part 1: Kobo on top of a tiered birthday cake with umbrella
//         candles, Zeta and Kaela cheering, rainbow, wispy clouds,
//         falling confetti and drifting Cilus. The title fades in.
// Part 2: Credits over your own artwork.
// Needs: character.js (drawCharacter), zeta.js (drawZetaNPC), kaela.js (drawKaelaNPC)
//        Optional: level1.js (l1_drawCilus) for the Cilus drawing
// ==========================================

// ------------------------------------------
// YOUR ARTWORK + FONT: edit these two lines
// ------------------------------------------
// Put your image in an "assets" folder next to index.html and match the name
// exactly (GitHub Pages is case-sensitive: Kobo.PNG is not kobo.png).
// It fills the screen behind the credits; 16:9 images (e.g. 1920x1080) fit best.
// Set to null to use the drawn sky instead.
const END_ART_PATH = "assets/end-art.png";

// Optional custom font for the end-scene text (.ttf or .otf), e.g. "assets/kobo-font.ttf".
// null = the browser's default font.
const END_FONT_PATH = null;

// ------------------------------------------
// TEXT
// ------------------------------------------
const END_TITLE_1 = "Happy Birthday Kobo!";
const END_TITLE_2 = "The Skyline is Restored!";
const END_THANKS = "Thank you for playing!";
const END_CREDIT_LINES = ["Submission created by Ethan", "for Kobo Birthday 2026 Project."];

// Timeline, in frames (60 = 1 second)
const ES_TITLE1_IN = 90;      // "Happy Birthday Kobo!" starts fading in
const ES_TITLE2_IN = 160;     // "The Skyline is Restored!"
const ES_CREDITS_IN = 600;    // cake scene cross-fades to the artwork
const ES_THANKS_IN = 720;
const ES_CREDIT_IN = 800;
const ES_PROMPT_IN = 920;     // "Press ENTER to play again"
const ES_FADE = 60;           // length of each fade

const ES = { art: null, font: null };

// ------------------------------------------
// ASSET LOADING (called once from setup() in sketch.js)
// Loaded in the background so a missing file can never freeze the game.
// ------------------------------------------
function endSceneLoadAssets() {
    if (END_ART_PATH) {
        loadImage(END_ART_PATH,
            img => { ES.art = img; },
            () => console.warn(`End scene: couldn't load ${END_ART_PATH}. Using the drawn sky instead.`));
    }
    if (END_FONT_PATH) {
        loadFont(END_FONT_PATH,
            f => { ES.font = f; },
            () => console.warn(`End scene: couldn't load ${END_FONT_PATH}. Using the default font.`));
    }
}

// ------------------------------------------
// SETUP
// ------------------------------------------
function initEndScene() {
    ES.t = 0;
    ES.cx = width / 2;

    // Cake tiers (bottom to top), standing on the ground
    const f = floorPos_y;
    ES.tiers = [
        { w: 420, h: 66 },
        { w: 290, h: 56 },
        { w: 150, h: 46 }
    ];
    let y = f;
    for (const tr of ES.tiers) {
        y -= tr.h;
        tr.x = ES.cx - tr.w / 2;
        tr.y = y;
    }
    ES.cakeTop = y;

    // Umbrella candles, in pairs either side of each tier (storyboard layout)
    ES.candles = [];
    const rows = [
        { dx: 105, baseY: ES.tiers[1].y, pole: 66 },   // on the middle tier, beside the top tier
        { dx: 178, baseY: ES.tiers[0].y, pole: 72 },   // on the bottom tier, beside the middle tier
        { dx: 300, baseY: f,             pole: 92 }    // on the ground, beside the cake
    ];
    for (const r of rows) {
        ES.candles.push({ x: ES.cx - r.dx, baseY: r.baseY, pole: r.pole, seed: random(1000) });
        ES.candles.push({ x: ES.cx + r.dx, baseY: r.baseY, pole: r.pole, seed: random(1000) });
    }

    // Sprinkles on the tiers
    ES.sprinkles = [];
    const sprinkleCols = [[255, 90, 140], [255, 210, 0], [70, 170, 255], [150, 220, 90], [190, 120, 255]];
    for (const tr of ES.tiers) {
        for (let i = 0; i < tr.w / 14; i++) {
            ES.sprinkles.push({
                x: random(tr.x + 12, tr.x + tr.w - 12),
                y: random(tr.y + 26, tr.y + tr.h - 10),
                a: random(TWO_PI),
                c: random(sprinkleCols)
            });
        }
    }

    // Wispy background clouds
    ES.clouds = [];
    for (let i = 0; i < 6; i++) {
        ES.clouds.push({ x: random(width), y: random(30, 210), s: random(0.7, 1.3), spd: random(0.15, 0.4) });
    }

    // Confetti
    ES.confetti = [];
    for (let i = 0; i < 140; i++) ES.confetti.push(es_newConfetti(true));

    // Drifting Cilus
    ES.cilus = [];
    for (let i = 0; i < 7; i++) ES.cilus.push(es_newCilus(true));

    ES.trees = [70, 200, width - 200, width - 70];
}

// ------------------------------------------
// MAIN LOOP
// ------------------------------------------
function drawEndScene() {
    if (ES.t === undefined) initEndScene();
    ES.t++;
    const t = ES.t;

    // Part 1: the cake celebration
    es_drawCelebration();

    // Part 2: cross-fade to the credits artwork
    const creditsAlpha = es_fade(t, ES_CREDITS_IN);
    if (creditsAlpha > 0) es_drawCreditsBackground(creditsAlpha);

    // Confetti and Cilus keep falling over both parts
    es_updateAndDrawConfetti();
    es_updateAndDrawCilus();

    // Text
    push();
    if (ES.font) textFont(ES.font);
    const inCredits = t >= ES_CREDITS_IN;
    // Titles sit at the top over the cake, then move to the storyboard's credits layout
    const shift = es_ease(constrain((t - ES_CREDITS_IN) / ES_FADE, 0, 1));
    const titleY = lerp(40, 80, shift);
    es_text(END_TITLE_1, width / 2, titleY, 40, es_fade(t, ES_TITLE1_IN), true);
    es_text(END_TITLE_2, width / 2, titleY + 46, 34, es_fade(t, ES_TITLE2_IN), true);
    if (inCredits) {
        es_text(END_THANKS, width / 2, titleY + 104, 28, es_fade(t, ES_THANKS_IN), false);
        END_CREDIT_LINES.forEach((line, i) => {
            es_text(line, width / 2, titleY + 146 + i * 32, 22, es_fade(t, ES_CREDIT_IN + i * 25), false);
        });
    }
    if (t > ES_PROMPT_IN) {
        const blink = 150 + sin(t * 0.08) * 100;
        es_text("Press ENTER or click to play again", width / 2, height - 30, 16, blink, false);
    } else if (t > 60) {
        es_text("ENTER or click to skip", width - 110, height - 22, 13, 120, false);
    }
    pop();

    // Fade in from the white flash at the end of Level 3
    if (t < 60) {
        noStroke();
        fill(255, map(t, 0, 60, 255, 0));
        rect(0, 0, width, height);
    }
}

// Enter / Space / click: skip to the credits, or return to the menu once they're shown
function endSceneContinue() {
    if (ES.t === undefined) return false;
    if (ES.t < ES_CREDITS_IN) {
        ES.t = ES_CREDITS_IN;
    } else if (ES.t < ES_PROMPT_IN) {
        ES.t = ES_PROMPT_IN;
    } else {
        ES.t = undefined;
        gameState = "MENU";
    }
    return true;
}

function endSceneKeyPressed() {
    if (keyCode === ENTER || keyCode === RETURN || keyCode === 32) return endSceneContinue();
    return false;
}

// ------------------------------------------
// PART 1: THE CELEBRATION
// ------------------------------------------
function es_drawCelebration() {
    const t = ES.t;
    const f = floorPos_y;

    background(51, 183, 255);
    es_drawRainbow();
    es_drawWispyClouds();

    // Sun shining behind Kobo on top of the cake
    const sunY = ES.cakeTop - 78;    // behind Kobo (she's ~135px tall)
    push();
    translate(ES.cx, sunY);
    stroke(255, 235, 0, 160);
    strokeWeight(5);
    for (let i = 0; i < 12; i++) {
        const a = t * 0.006 + i * TWO_PI / 12;
        line(cos(a) * 72, sin(a) * 72, cos(a) * 100, sin(a) * 100);
    }
    noStroke();
    fill(255, 235, 0);
    ellipse(0, 0, 124);
    pop();

    for (const x of ES.trees) es_drawPalm(x);
    noStroke();
    fill(45, 105, 30);
    arc(110, f, 250, 150, PI, TWO_PI, CHORD);
    arc(width - 110, f, 250, 150, PI, TWO_PI, CHORD);

    // Ground
    fill(40, 225, 40);
    rect(0, f, width, height - f);

    es_drawCake();
    for (const c of ES.candles) es_drawUmbrellaCandle(c);

    // Kobo on top of the cake, with a little birthday hop now and then
    const hop = (t % 150) < 30 ? sin(((t % 150) / 30) * PI) * 10 : 0;
    gameChar_x = ES.cx;
    gameChar_y = ES.cakeTop - hop;
    gameChar_vy = 0;
    isLeft = false;
    isRight = false;
    isFalling = false;
    if (typeof drawCharacter === 'function') { push(); drawCharacter(); pop(); }

    // Zeta (left) and Kaela (right) cheering by the cake
    const zetaHop = abs(sin(t * 0.11)) * 14;
    const kaelaHop = abs(sin(t * 0.11 + 1.3)) * 14;
    if (typeof drawZetaNPC === 'function') { push(); drawZetaNPC(115, f - zetaHop); pop(); }
    if (typeof drawKaelaNPC === 'function') { push(); drawKaelaNPC(width - 115, f - kaelaHop); pop(); }

    if (t > 200 && t < ES_CREDITS_IN) {
        const a = es_fade(t, 200);
        es_bubble("Happy birthday, Kobo!", 150, f - 172, a);
        if (t > 260) es_bubble("Omedetou!", width - 150, f - 172, es_fade(t, 260));
    }
}

function es_drawRainbow() {
    const cols = [[235, 40, 40], [255, 140, 0], [255, 225, 0], [40, 200, 60], [70, 170, 255], [150, 50, 220]];
    push();
    noFill();
    strokeWeight(16);
    cols.forEach((c, i) => {
        stroke(...c, 190);
        const d = 900 - i * 32;
        arc(width / 2, floorPos_y + 20, d, d * 0.85, PI, TWO_PI);
    });
    pop();
}

// Soft, layered, see-through clouds drifting right
function es_drawWispyClouds() {
    noStroke();
    for (const c of ES.clouds) {
        c.x += c.spd;
        if (c.x - 160 * c.s > width) c.x = -160 * c.s;
        push();
        translate(c.x, c.y);
        scale(c.s);
        for (let layer = 0; layer < 3; layer++) {
            fill(255, 70 + layer * 45);
            const k = 1 - layer * 0.18;
            ellipse(0, 0, 210 * k, 70 * k);
            ellipse(-60 * k, 12, 130 * k, 52 * k);
            ellipse(55 * k, 8, 150 * k, 58 * k);
            ellipse(10, -20 * k, 110 * k, 60 * k);
        }
        pop();
    }
}

function es_drawPalm(x) {
    const f = floorPos_y;
    noStroke();
    fill(150, 90, 30);
    quad(x - 10, f, x + 10, f, x + 6, f - 230, x - 5, f - 230);
    push();
    translate(x, f - 230);
    fill(55, 120, 30);
    for (let i = 0; i < 6; i++) {
        push();
        rotate(-PI + i * PI / 5 + sin(frameCount * 0.02 + x) * 0.05);
        ellipse(65, 0, 140, 24);
        pop();
    }
    pop();
}

function es_drawCake() {
    const tiers = ES.tiers;
    for (let i = 0; i < tiers.length; i++) {
        const tr = tiers[i];
        // Tier body
        stroke(0, 230, 255);
        strokeWeight(5);
        fill(255);
        rect(tr.x, tr.y, tr.w, tr.h, 4);
        // Frosting drips along the top
        noStroke();
        fill(255, 175, 205);
        rect(tr.x + 3, tr.y + 3, tr.w - 6, 12);
        for (let dx = 14; dx < tr.w - 8; dx += 26) {
            const len = 8 + ((dx * 7 + i * 13) % 12);
            ellipse(tr.x + dx, tr.y + 14, 14, 10 + len);
        }
        // Little cyan dots along the bottom edge
        fill(0, 200, 240);
        for (let dx = 12; dx < tr.w - 6; dx += 22) ellipse(tr.x + dx, tr.y + tr.h - 7, 7);
    }
    // Sprinkles
    strokeWeight(3);
    for (const s of ES.sprinkles) {
        stroke(...s.c);
        line(s.x - cos(s.a) * 3, s.y - sin(s.a) * 3, s.x + cos(s.a) * 3, s.y + sin(s.a) * 3);
    }
    noStroke();
}

// Umbrella "candle": white pole, blue canopy, flickering flame on the tip
function es_drawUmbrellaCandle(c) {
    const topY = c.baseY - c.pole;
    stroke(245);
    strokeWeight(5);
    line(c.x, c.baseY, c.x, topY);
    noStroke();
    fill(15, 50, 220);
    arc(c.x, topY + 2, 72, 52, PI, TWO_PI, CHORD);
    fill(10, 35, 170);
    for (let k = -1; k <= 1; k++) arc(c.x + k * 24, topY + 2, 24, 10, 0, PI);
    // Flame
    const flick = sin(frameCount * 0.3 + c.seed) * 2;
    const tipY = topY - 26;
    fill(255, 140, 0);
    ellipse(c.x + flick * 0.5, tipY - 2, 12, 20 + flick);
    fill(255, 235, 120);
    ellipse(c.x + flick * 0.3, tipY + 1, 6, 10);
    stroke(80);
    strokeWeight(2);
    line(c.x, topY - 24, c.x, topY - 14);
    noStroke();
}

function es_bubble(msg, x, y, a) {
    push();
    textSize(15);
    const w = textWidth(msg) + 24;
    noStroke();
    fill(255, a);
    rect(x - w / 2, y - 18, w, 34, 10);
    triangle(x - 8, y + 16, x + 8, y + 16, x - (x < width / 2 ? -2 : 2) * 6, y + 30);
    fill(30, 60, 140, a);
    textAlign(CENTER, CENTER);
    text(msg, x, y);
    pop();
}

// ------------------------------------------
// PART 2: CREDITS BACKGROUND
// ------------------------------------------
function es_drawCreditsBackground(a) {
    push();
    if (ES.art) {
        // Cover the whole canvas without stretching (cropped to fit)
        const s = max(width / ES.art.width, height / ES.art.height);
        const w = ES.art.width * s;
        const h = ES.art.height * s;
        tint(255, a);
        image(ES.art, (width - w) / 2, (height - h) / 2, w, h);
        noTint();
    } else {
        // Fallback when no artwork is set or it couldn't load
        noStroke();
        for (let y = 0; y < height; y += 4) {
            const k = y / height;
            fill(lerp(30, 140, k), lerp(90, 200, k), lerp(210, 255, k), a);
            rect(0, y, width, 4);
        }
        fill(255, a * 0.9);
        for (const [cx, cy, s] of [[60, 470, 1.6], [width - 60, 470, 1.6], [180, 540, 1.2], [width - 180, 540, 1.2]]) {
            ellipse(cx, cy, 260 * s, 150 * s);
            ellipse(cx - 70 * s, cy + 30, 160 * s, 110 * s);
            ellipse(cx + 70 * s, cy + 25, 170 * s, 115 * s);
        }
    }
    pop();
}

// ------------------------------------------
// CONFETTI + CILUS
// ------------------------------------------
function es_newConfetti(anywhere) {
    const cols = [[235, 40, 40], [255, 225, 0], [0, 230, 255], [255, 140, 0], [150, 50, 220], [40, 200, 60], [255, 120, 180], [255, 255, 255]];
    return {
        x: random(width),
        y: anywhere ? random(-height, height) : random(-60, -10),
        w: random(7, 12),
        h: random(10, 18),
        rot: random(TWO_PI),
        vr: random(-0.12, 0.12),
        vy: random(1.2, 2.6),
        sway: random(TWO_PI),
        c: random(cols)
    };
}

function es_updateAndDrawConfetti() {
    noStroke();
    // Lighter confetti over the credits so your artwork stays visible
    const sparse = ES.t > ES_CREDITS_IN + ES_FADE / 2;
    ES.confetti.forEach((p, i) => {
        p.y += p.vy;
        p.sway += 0.04;
        p.rot += p.vr;
        if (p.y > height + 20) Object.assign(p, es_newConfetti(false));
        if (sparse && i % 3 !== 0) return;
        push();
        translate(p.x + sin(p.sway) * 18, p.y);
        rotate(p.rot);
        // Squash the width as it spins to look like a tumbling flake
        fill(...p.c);
        rect(-p.w / 2 * abs(cos(p.rot * 1.7)), -p.h / 2, p.w * abs(cos(p.rot * 1.7)) + 1, p.h);
        pop();
    });
}

function es_newCilus(anywhere) {
    return {
        x: random(60, width - 60),
        y: anywhere ? random(-height, height * 0.6) : random(-120, -40),
        vy: random(0.5, 1.0),
        sway: random(TWO_PI),
        s: random(0.8, 1.15)
    };
}

function es_updateAndDrawCilus() {
    for (const c of ES.cilus) {
        c.y += c.vy;
        c.sway += 0.02;
        if (c.y > height + 40) Object.assign(c, es_newCilus(false));
        const x = c.x + sin(c.sway) * 30;
        push();
        translate(x, c.y);
        scale(c.s);
        if (typeof l1_drawCilus === 'function') l1_drawCilus(0, 0);
        else es_drawCilusFallback();
        pop();
    }
}

function es_drawCilusFallback() {
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
}

// ------------------------------------------
// HELPERS
// ------------------------------------------
// 0 -> 255 over ES_FADE frames starting at `start`
function es_fade(t, start) {
    return constrain(map(t, start, start + ES_FADE, 0, 255), 0, 255);
}

function es_ease(k) {
    return k * k * (3 - 2 * k);
}

// Text with an outline so it reads over any background
function es_text(msg, x, y, size, a, bold) {
    if (a <= 0) return;
    push();
    textAlign(CENTER, CENTER);
    textSize(size);
    textStyle(bold ? BOLD : ITALIC);
    stroke(10, 40, 110, a);
    strokeWeight(max(2, size * (bold ? 0.16 : 0.14)));
    strokeJoin(ROUND);
    fill(255, a);
    text(msg, x, y);
    pop();
}
