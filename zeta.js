

function drawZetaNPC(overrideX, overrideY) {
    let currentX = overrideX !== undefined ? overrideX : zetaX;
    let currentY = overrideY !== undefined ? overrideY : zetaY; // Grounded Y position

    push();
    translate(currentX, currentY);
    noStroke();

    // Palette
    let silverHair = color(210, 215, 230);
    let darkHair = color(140, 145, 160);
    let skin = color(255, 230, 205);
    let white = color(250);
    let darkGray = color(40, 40, 50);
    let ribbonBlack = color(20);

    // Fluffy Back & Head Hair (Shifted up to cover forehead)
    fill(silverHair);
    ellipse(0, -70, 50, 65);
    ellipse(-20, -50, 22, 70); // Left fluffy side hair
    ellipse(20, -50, 22, 70);  // Right fluffy side hair

    // Real Cat Ears (Tilted inward, softer shape attached to hair)
    push(); translate(-10, -102); rotate(radians(-15));
    fill(darkHair); triangle(-6, 0, 0, -18, 6, 0);
    fill(skin); triangle(-3, -2, 0, -12, 3, -2); // Inner ear pink tone
    pop();

    push(); translate(10, -102); rotate(radians(15));
    fill(darkHair); triangle(-6, 0, 0, -18, 6, 0);
    fill(skin); triangle(-3, -2, 0, -12, 3, -2);
    pop();

    // Black Hair Ribbon Clip (Left side)
    fill(ribbonBlack);
    triangle(-16, -101, -24, -108, -18, -96);

    // Head & Face
    fill(skin); ellipse(0, -84, 26, 26);
    fill(darkGray); ellipse(-5, -84, 4, 6); ellipse(5, -84, 4, 6);

    // Sweeping Bangs (Shifted up to meet the ears)
    fill(silverHair);
    ellipse(-6, -98, 14, 10); 
    ellipse(6, -98, 14, 10);

    // Torso (Rectangle) & Skirt (Triangle)
    fill(white); rect(-8, -72, 16, 22, 2); // Torso rectangle
    fill(white); triangle(0, -63, -14, -36, 14, -36); // Skirt triangle
    fill(ribbonBlack); rect(-6, -50, 5, 14); // Asymmetrical black side flap

    // Legs: Left Fishnet (Grid dots) & Right Full Dark Stocking
    fill(skin); rect(-6, -36, 5, 22);
    fill(200); ellipse(-4, -26, 3, 3); ellipse(-4, -18, 3, 3); // Fishnet texture hint
    fill(darkGray); rect(1, -36, 5, 22); // Full dark thigh-high

    // Shoes
    fill(ribbonBlack); rect(-8, -14, 9, 8, 2); rect(0, -14, 9, 8, 2);
    pop();
}