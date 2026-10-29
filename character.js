



function drawCharacter() {
    push(); translate(0, -20); noStroke();
    
    // --- Kobo Palette ---
    let cyan = color(120, 210, 255);        // Kobo Hair / Water Cyan
    let darkCyan = color(60, 150, 220);     // Inner Hair / Loops
    let skin = color(255, 225, 195);        // Skin Tone
    let white = color(255);                 // Hoodie / Socks / Accents
    let darkGray = color(50, 55, 65);       // Shorts / Inner Hoodie Collar
    let jacketBlue = color(70, 160, 230);   // Oversized Jacket Sleeves
    let redAccent = color(235, 60, 75);     // Red Drawstrings & Chunky Shoe Soles
    let black = color(20);                  // Eyes / Sock Rings

    // Helper: Flowing side hair / braids
    let drawHairWaves = (x, y, dir) => {
        fill(cyan);
        for (let i = 0; i < 4; i++) {
            ellipse(x + (i * 4 * dir), y - 90 + (i * 8), 12, 10);
        }
    };

    // ==========================================
    // 1. JUMPING / FALLING LEFT
    // ==========================================
    if (isLeft && isFalling) {
        // Head & Hair Anchored Together (Shifted higher to cover forehead)
        fill(cyan); ellipse(gameChar_x - 6, gameChar_y - 96, 22, 18);
        fill(skin); ellipse(gameChar_x, gameChar_y - 85, 25, 25);
        
        // Profile Water Loops
        fill(cyan); ellipse(gameChar_x - 4, gameChar_y - 112, 12, 20);
        fill(darkCyan); ellipse(gameChar_x - 4, gameChar_y - 112, 5, 10);
        
        // Profile Face & Sweeping Bang
        fill(black); ellipse(gameChar_x - 8, gameChar_y - 86, 4, 6);
        push(); translate(gameChar_x - 6, gameChar_y - 95); rotate(radians(-20));
        fill(cyan); ellipse(0, 0, 14, 10); fill(white); ellipse(-2, 2, 4, 3);
        pop();

        // Body & Arms (Pushed back airborne)
        fill(jacketBlue); rect(gameChar_x - 8, gameChar_y - 74, 16, 18, 4);
        fill(white); rect(gameChar_x - 10, gameChar_y - 74, 10, 10, 3);
        fill(darkGray); rect(gameChar_x - 6, gameChar_y - 64, 12, 6);
        
        push(); translate(gameChar_x + 4, gameChar_y - 70); rotate(radians(30));
        fill(jacketBlue); rect(-3, 0, 8, 18, 4);
        fill(skin); ellipse(1, 19, 5, 5); pop();

        // Legs & Shoes (Tucked for Jump)
        fill(skin); rect(gameChar_x - 6, gameChar_y - 58, 5, 18);
        fill(white); rect(gameChar_x - 7, gameChar_y - 45, 7, 18);
        fill(black); rect(gameChar_x - 7, gameChar_y - 45, 7, 3);
        fill(white); rect(gameChar_x - 10, gameChar_y - 27, 12, 10, 2);
        fill(redAccent); rect(gameChar_x - 12, gameChar_y - 19, 15, 6, 3);

    // ==========================================
    // 2. JUMPING / FALLING RIGHT
    // ==========================================
    } else if (isRight && isFalling) {
        // Head & Hair Anchored Together (Shifted higher to cover forehead)
        fill(cyan); ellipse(gameChar_x + 6, gameChar_y - 96, 22, 18);
        fill(skin); ellipse(gameChar_x, gameChar_y - 85, 25, 25);
        
        // Profile Water Loops
        fill(cyan); ellipse(gameChar_x + 4, gameChar_y - 112, 12, 20);
        fill(darkCyan); ellipse(gameChar_x + 4, gameChar_y - 112, 5, 10);
        
        // Profile Face & Sweeping Bang
        fill(black); ellipse(gameChar_x + 8, gameChar_y - 86, 4, 6);
        push(); translate(gameChar_x + 6, gameChar_y - 95); rotate(radians(20));
        fill(cyan); ellipse(0, 0, 14, 10); fill(white); ellipse(2, 2, 4, 3);
        pop();

        // Body & Arms (Pushed back airborne)
        fill(jacketBlue); rect(gameChar_x - 8, gameChar_y - 74, 16, 18, 4);
        fill(white); rect(gameChar_x, gameChar_y - 74, 10, 10, 3);
        fill(darkGray); rect(gameChar_x - 6, gameChar_y - 64, 12, 6);
        
        push(); translate(gameChar_x - 4, gameChar_y - 70); rotate(radians(-30));
        fill(jacketBlue); rect(-5, 0, 8, 18, 4);
        fill(skin); ellipse(-1, 19, 5, 5); pop();

        // Legs & Shoes (Tucked for Jump)
        fill(skin); rect(gameChar_x + 1, gameChar_y - 58, 5, 18);
        fill(white); rect(gameChar_x, gameChar_y - 45, 7, 18);
        fill(black); rect(gameChar_x, gameChar_y - 45, 7, 3);
        fill(white); rect(gameChar_x - 2, gameChar_y - 27, 12, 10, 2);
        fill(redAccent); rect(gameChar_x - 3, gameChar_y - 19, 15, 6, 3);

    // ==========================================
    // 3. WALKING LEFT (PROFILE VIEW)
    // ==========================================
    } else if (isLeft) {
        // Water Loops Profile (Shifted up)
        fill(cyan); ellipse(gameChar_x - 2, gameChar_y - 114, 10, 22);
        fill(darkCyan); ellipse(gameChar_x - 2, gameChar_y - 114, 4, 10);
        
        drawHairWaves(gameChar_x + 4, gameChar_y - 5, 1);
        fill(skin); ellipse(gameChar_x, gameChar_y - 85, 24, 24);
        
        // Profile Eye & Bang (Shifted up)
        fill(black); ellipse(gameChar_x - 7, gameChar_y - 86, 4, 6);
        push(); translate(gameChar_x - 6, gameChar_y - 95); rotate(radians(-15));
        fill(cyan); ellipse(0, 0, 14, 10); fill(white); ellipse(-2, 2, 4, 3);
        pop();

        // Jacket Profile
        fill(jacketBlue); rect(gameChar_x - 8, gameChar_y - 73, 16, 18, 4);
        fill(white); rect(gameChar_x - 10, gameChar_y - 73, 8, 12, 3);
        fill(redAccent); rect(gameChar_x - 8, gameChar_y - 63, 2, 8);

        // Swinging Arm
        fill(jacketBlue);
        push(); translate(gameChar_x - 2, gameChar_y - 70); 
        rotate(radians(20 * sin(frameCount * 0.2))); 
        rect(-4, 0, 8, 20, 4); fill(skin); ellipse(0, 21, 5, 5);
        pop();

        // Animated Legs
        let legOffset = 8 * sin(frameCount * 0.2);
        fill(skin); 
        rect(gameChar_x - 7 + legOffset, gameChar_y - 55, 5, 22);
        rect(gameChar_x - 1 - legOffset, gameChar_y - 55, 5, 22);
        
        fill(white); 
        rect(gameChar_x - 8 + legOffset, gameChar_y - 42, 7, 22);
        rect(gameChar_x - 2 - legOffset, gameChar_y - 42, 7, 22);
        fill(black);
        rect(gameChar_x - 8 + legOffset, gameChar_y - 42, 7, 3);
        rect(gameChar_x - 2 - legOffset, gameChar_y - 42, 7, 3);

        fill(white); 
        rect(gameChar_x - 11 + legOffset, gameChar_y - 20, 12, 10, 2);
        rect(gameChar_x - 5 - legOffset, gameChar_y - 20, 12, 10, 2);
        fill(redAccent); 
        rect(gameChar_x - 13 + legOffset, gameChar_y - 12, 15, 6, 3);
        rect(gameChar_x - 7 - legOffset, gameChar_y - 12, 15, 6, 3);

    // ==========================================
    // 4. WALKING RIGHT (PROFILE VIEW)
    // ==========================================
    } else if (isRight) {
        // Water Loops Profile (Shifted up)
        fill(cyan); ellipse(gameChar_x + 2, gameChar_y - 114, 10, 22);
        fill(darkCyan); ellipse(gameChar_x + 2, gameChar_y - 114, 4, 10);
        
        drawHairWaves(gameChar_x - 4, gameChar_y - 5, -1);
        fill(skin); ellipse(gameChar_x, gameChar_y - 85, 24, 24);
        
        // Profile Eye & Bang (Shifted up)
        fill(black); ellipse(gameChar_x + 7, gameChar_y - 86, 4, 6);
        push(); translate(gameChar_x + 6, gameChar_y - 95); rotate(radians(15));
        fill(cyan); ellipse(0, 0, 14, 10); fill(white); ellipse(2, 2, 4, 3);
        pop();

        // Jacket Profile
        fill(jacketBlue); rect(gameChar_x - 8, gameChar_y - 73, 16, 18, 4);
        fill(white); rect(gameChar_x + 2, gameChar_y - 73, 8, 12, 3);
        fill(redAccent); rect(gameChar_x + 6, gameChar_y - 63, 2, 8);

        // Swinging Arm
        fill(jacketBlue);
        push(); translate(gameChar_x + 2, gameChar_y - 70); 
        rotate(radians(-20 * sin(frameCount * 0.2))); 
        rect(-4, 0, 8, 20, 4); fill(skin); ellipse(0, 21, 5, 5);
        pop();

        // Animated Legs
        let legOffset = 8 * sin(frameCount * 0.2);
        fill(skin); 
        rect(gameChar_x - 4 + legOffset, gameChar_y - 55, 5, 22);
        rect(gameChar_x + 2 - legOffset, gameChar_y - 55, 5, 22);
        
        fill(white); 
        rect(gameChar_x - 5 + legOffset, gameChar_y - 42, 7, 22);
        rect(gameChar_x + 1 - legOffset, gameChar_y - 42, 7, 22);
        fill(black);
        rect(gameChar_x - 5 + legOffset, gameChar_y - 42, 7, 3);
        rect(gameChar_x + 1 - legOffset, gameChar_y - 42, 7, 3);

        fill(white); 
        rect(gameChar_x - 6 + legOffset, gameChar_y - 20, 12, 10, 2);
        rect(gameChar_x - 0 - legOffset, gameChar_y - 20, 12, 10, 2);
        fill(redAccent); 
        rect(gameChar_x - 7 + legOffset, gameChar_y - 12, 15, 6, 3);
        rect(gameChar_x + 1 - legOffset, gameChar_y - 12, 15, 6, 3);

    // ==========================================
    // 5. STANDING FRONT (IDLE)
    // ==========================================
    } else {
        // Water Loops (Shifted up to wrap top of head cleanly)
        fill(cyan); ellipse(gameChar_x - 10, gameChar_y - 116, 14, 22); ellipse(gameChar_x + 10, gameChar_y - 116, 14, 22);
        fill(darkCyan); ellipse(gameChar_x - 10, gameChar_y - 116, 6, 12); ellipse(gameChar_x + 10, gameChar_y - 116, 6, 12);
        
        // Back Hair Waves & Head (Added hair volume layer across top forehead)
        fill(cyan); ellipse(gameChar_x, gameChar_y - 98, 30, 16);
        fill(cyan); ellipse(gameChar_x - 16, gameChar_y - 80, 16, 30); ellipse(gameChar_x + 16, gameChar_y - 80, 16, 30);
        fill(skin); ellipse(gameChar_x, gameChar_y - 88, 28, 28);
        
        // Front Bangs (Shifted up to cover forehead gap)
        push(); translate(gameChar_x - 7, gameChar_y - 97); rotate(radians(-15));
        fill(cyan); ellipse(0, 0, 14, 10); fill(white); ellipse(-2, 3, 5, 4); pop();
        
        push(); translate(gameChar_x + 7, gameChar_y - 97); rotate(radians(15));
        fill(cyan); ellipse(0, 0, 14, 10); fill(white); ellipse(2, 3, 5, 4); pop();

        // Eyes
        fill(black); ellipse(gameChar_x - 6, gameChar_y - 88, 5, 8); ellipse(gameChar_x + 6, gameChar_y - 88, 5, 8);
        fill(cyan); ellipse(gameChar_x - 6, gameChar_y - 87, 3, 5); ellipse(gameChar_x + 6, gameChar_y - 87, 3, 5);
        
        // Side Braids
        drawHairWaves(gameChar_x - 14, gameChar_y - 5, -1); 
        drawHairWaves(gameChar_x + 14, gameChar_y - 5, 1);
        
        // Crop Hoodie Base & Dark Collar
        fill(darkGray); rect(gameChar_x - 8, gameChar_y - 75, 16, 6, 2);
        fill(white); rect(gameChar_x - 12, gameChar_y - 72, 24, 14, 3);
        fill(redAccent); rect(gameChar_x - 4, gameChar_y - 66, 2, 10); rect(gameChar_x + 2, gameChar_y - 66, 2, 10);
        
        // Exposed Midriff & Shorts
        fill(skin); rect(gameChar_x - 8, gameChar_y - 58, 16, 5);
        fill(darkGray); rect(gameChar_x - 9, gameChar_y - 53, 18, 8, 2);

        // Sleeves & Hands Resting Straight Down
        fill(jacketBlue); rect(gameChar_x - 18, gameChar_y - 70, 8, 24, 4); rect(gameChar_x + 10, gameChar_y - 70, 8, 24, 4);
        fill(skin); ellipse(gameChar_x - 14, gameChar_y - 44, 6, 6); ellipse(gameChar_x + 14, gameChar_y - 44, 6, 6);

        // Legs & High Socks
        fill(skin); rect(gameChar_x - 9, gameChar_y - 45, 6, 25); rect(gameChar_x + 3, gameChar_y - 45, 6, 25);
        fill(white); rect(gameChar_x - 9, gameChar_y - 32, 6, 32); rect(gameChar_x + 3, gameChar_y - 32, 6, 32);
        fill(black); rect(gameChar_x - 9, gameChar_y - 32, 6, 3); rect(gameChar_x + 3, gameChar_y - 32, 6, 3);
        
        // Chunky Red-Soled Sneakers
        fill(white); rect(gameChar_x - 12, gameChar_y - 3, 11, 10, 2); rect(gameChar_x + 1, gameChar_y - 3, 11, 10, 2);
        fill(redAccent); rect(gameChar_x - 14, gameChar_y + 4, 14, 7, 3); rect(gameChar_x, gameChar_y + 4, 14, 7, 3);
    }
    pop();
}