/**
 * @file scene_credits.js
 * @description Credits screen scene. Displays developer, AI, music, and SFX attribution.
 * Fully responsive layout, keyboard navigation, and proper UI element instantiation.
 * @author Miguel Páramos
 */

const CreditsScene = {
    btnBack: null,

    setup: function() {
        world.gravity.y = 0;
        // allSprites.removeAll() is already handled safely inside game.js during the fade transition

        let isMobile = width < 768;
        // Pushed up safely above the footer to ensure visibility on all devices
        let btnX = isMobile ? width / 2 : width - 120;
        let btnY = isMobile ? height - 120 : height - 80; 

        this.btnBack = createCyberButton(
            btnX, btnY, 
            200, 50, 
            getText(window.activeLanguage || 'es', 'credits_back'),
            () => {
                changeScene('menu');
            }
        );
        this.btnBack.alpha = 1;
    },

    draw: function(lang) {
        let colorTop = color(30 - sin(frameCount) * 20, 10, 80 - cos(frameCount) * 30);
        let colorBottom = color(30 + sin(frameCount) * 20, 50, 80 + cos(frameCount) * 30);
        
        for (let y = 0; y < height; y++) {
            let inter = map(y, 0, height, 0, 1);
            let c = lerpColor(colorTop, colorBottom, inter);
            stroke(c);
            line(0, y, width, y);
        }

        cursor('default');

        if (kb.presses('escape')) {
            if (typeof sfxClick !== 'undefined' && sfxClick.isLoaded()) {
                sfxClick.setVolume(window.GameConfig.sfxVolume);
                sfxClick.play();
            }
            changeScene('menu');
            return;
        }

        if (this.btnBack) {
            this.btnBack.textStr = getText(lang, 'credits_back');
        }

        // --- LAYOUT ENGINE: SIDE-BY-SIDE RESPONSIVE ---
        let isMobile = width < 768;
        let centerX = width / 2;
        let startY = isMobile ? 30 : 60;
        
        // Title
        textAlign(CENTER, CENTER);
        noStroke();
        fill('#ffffff');
        textSize(isMobile ? 24 : 36);
        text(getText(lang, 'menu_button_credits').toUpperCase(), centerX, startY);

        // --- PROFILES SECTION ---
        // Always horizontal, scaled dynamically for breathing room
        let profileY = startY + (isMobile ? 100 : 160); 
        let spriteScale = isMobile ? 1.0 : 1.5;
        let colOffset = isMobile ? 100 : 180; // Distance from center
        
        let leftColX = centerX - colOffset;
        let rightColX = centerX + colOffset;

        // Developer Profile (Miguel)
        if (typeof miguelProfileAni !== 'undefined' && miguelProfileAni) {
            push(); translate(leftColX, profileY - 30); scale(spriteScale); animation(miguelProfileAni, 0, 0); pop();
        }
        noStroke(); fill('#38bdf8'); textSize(isMobile ? 16 : 22);
        text("Miguel Páramos", leftColX, profileY + (isMobile ? 60 : 80));
        fill('#94a3b8'); textSize(isMobile ? 11 : 14);
        text(getText(lang, 'credits_role_dev'), leftColX, profileY + (isMobile ? 80 : 105));

        // AI Profile (Garnata)
        if (typeof garnataProfileAni !== 'undefined' && garnataProfileAni) {
            push(); translate(rightColX, profileY - 30); scale(spriteScale); animation(garnataProfileAni, 0, 0); pop();
        }
        noStroke(); fill('#38bdf8'); textSize(isMobile ? 16 : 22);
        text("Garnata", rightColX, profileY + (isMobile ? 60 : 80));
        fill('#94a3b8'); textSize(isMobile ? 11 : 14);
        text(getText(lang, 'credits_role_ai'), rightColX, profileY + (isMobile ? 80 : 105));

        // --- ASSETS & ATTRIBUTIONS SECTION ---
        // Generous vertical spacing, text sizing scales down on mobile
        let assetsY = profileY + (isMobile ? 130 : 180);
        let lineSpacing = isMobile ? 16 : 22;
        textSize(isMobile ? 11 : 14);
        
        // Core Tech
        fill('#ffffff'); text(getText(lang, 'credits_libs').toUpperCase(), centerX, assetsY);
        fill('#94a3b8'); text("q5play, p5play, JSZip, Tailwind CSS", centerX, assetsY + lineSpacing);

        // Music
        let musicY = assetsY + lineSpacing * 2.5;
        fill('#ffffff'); text(getText(lang, 'credits_music').toUpperCase(), centerX, musicY);
        fill('#94a3b8'); 
        text('"When I inserted the cartridge" - Suno (Commercial License)', centerX, musicY + lineSpacing);
        text('"After a hard day\'s work" - Suno (Commercial License)', centerX, musicY + lineSpacing * 2);

        // SFX
        let sfxY = musicY + lineSpacing * 3.5;
        fill('#ffffff'); text(getText(lang, 'credits_sfx').toUpperCase(), centerX, sfxY);
        fill('#94a3b8'); 
        text("Universfield (Pixabay) - Button Selected SFX", centerX, sfxY + lineSpacing);
        text("plasterbrain (Freesound / Pixabay) - Game Start SFX", centerX, sfxY + lineSpacing * 2);
        text("floraphonic (Pixabay/floraphonic.com) - 8 Bit Game 2 (Hover SFX)", centerX, sfxY + lineSpacing * 3);
    },

    windowResized: function() {
        if (this.btnBack) {
            let isMobile = width < 768;
            this.btnBack.x = isMobile ? width / 2 : width - 120;
            // Kept tight to the bottom so it respects the dynamic canvas height
            this.btnBack.y = height - (isMobile ? 60 : 80);
        }
    }
};