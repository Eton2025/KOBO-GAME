

function drawKaelaNPC(overrideX, overrideY) {
    let currentX = overrideX !== undefined ? overrideX : kaelaX;
    let currentY = overrideY !== undefined ? overrideY : kaelaY;

    push();
    translate(currentX, currentY + sin(frameCount * 0.08) * 2);
    noStroke();

    // Palette
    let yellowHair = color(255, 215, 40);
    let skin = color(255, 230, 205);
    let coatBlack = color(30, 30, 35);
    let liningRed = color(215, 40, 40);
    let leatherBrown = color(130, 75, 40);
    let darkGray = color(50);

    // Coat & Red Inner Lining
    fill(liningRed); rect(-18, -75, 36, 65, 4);
    fill(coatBlack); rect(-22, -75, 12, 68, 3); rect(10, -75, 12, 68, 3);

    // Yellow Hair & Feathered Sides
    fill(yellowHair);
    ellipse(0, -88, 32, 30);
    ellipse(-15, -88, 10, 18); // Side tufts
    ellipse(15, -88, 10, 18);

    // Red Winged Ear Ornaments
    fill(liningRed);
    triangle(-14, -86, -24, -90, -16, -80);
    triangle(14, -86, 24, -90, 16, -80);

    // Goggles Strap & Lenses resting on forehead
    fill(coatBlack); rect(-12, -100, 24, 5, 2); // Strap
    fill(liningRed); ellipse(-6, -98, 9, 9); ellipse(6, -98, 9, 9); // Metallic Red Rim
    fill(50); ellipse(-6, -98, 5, 5); ellipse(6, -98, 5, 5);       // Lens core

    // Head, Eyes & Cowl Scarf
    fill(skin); ellipse(0, -84, 24, 24);
    fill(liningRed); ellipse(-5, -84, 4, 6); ellipse(5, -84, 4, 6); // Red eyes
    fill(coatBlack); rect(-10, -76, 20, 8, 3); // Dark neck cowl/scarf

    // Diagonal Leather Tool Apron & Hammer
    fill(leatherBrown);
    push(); translate(-2, -58); rotate(radians(-15));
    rect(-8, 0, 14, 20, 2);
    fill(180); rect(-4, 4, 12, 5); // Hammer head tucked in
    fill(leatherBrown); rect(0, 4, 4, 12); // Handle
    pop();

    // Black Shorts, Legs & High Lace Boots
    fill(darkGray); rect(-9, -52, 18, 18);
    fill(skin); rect(-7, -44, 5, 20); rect(2, -44, 5, 20);
    fill(coatBlack); rect(-8, -28, 7, 24, 2); rect(1, -28, 7, 24, 2);
    fill(liningRed); rect(-9, -6, 9, 5, 2); rect(0, -6, 9, 5, 2); // Red soles

    pop();
}