/**
 * @file CreditsScene.js
 * @description Credits screen scene. Displays developer, AI, music, and SFX attribution.
 * Fully encapsulated and OOP compliant.
 */
class CreditsScene extends Scene {
    // Static properties for lazy loading assets specific to this scene
    static miguelProfileAni = null;
    static garnataProfileAni = null;

    #ui;
    #btnBack;

    constructor() {
        super('credits', "assets/music/official/After a hard day's work.mp3");
        this.#ui = new GUIManager();
        this.#btnBack = null;

        // Lazy load animations if they haven't been loaded yet
        if (!CreditsScene.miguelProfileAni) {
            try { CreditsScene.miguelProfileAni = loadAni('assets/characters/official/miguel/profilePicture.webp'); } catch(e) {}
        }
        if (!CreditsScene.garnataProfileAni) {
            try { CreditsScene.garnataProfileAni = loadAni('assets/characters/official/garnata/profilePicture.webp'); } catch(e) {}
        }
    }

    setup() {
        world.gravity.y = 0;
        this.playMusic();

        let isMobile = width < 768;
        let btnX = isMobile ? width / 2 : width - 120;
        let btnY = isMobile ? height - 120 : height - 80; 

        this.#btnBack = new MenuButton(
            btnX, btnY, 
            200, 50, 
            I18n.getText('credits_back'),
            () => { sceneManager.changeScene(new MainMenuScene()); }
        );
        this.#ui.add(this.#btnBack);
    }

    draw() {
        let colorTop = color(30 - sin(frameCount) * 20, 10, 80 - cos(frameCount) * 30);
        let colorBottom = color(30 + sin(frameCount) * 20, 50, 80 + cos(frameCount) * 30);
        
        for (let y = 0; y < height; y++) {
            let inter = map(y, 0, height, 0, 1);
            let c = lerpColor(colorTop, colorBottom, inter);
            stroke(c);
            line(0, y, width, y);
        }

        cursor('default');

        let isMobile = width < 768;
        let centerX = width / 2;
        let startY = isMobile ? 30 : 60;
        
        textAlign(CENTER, CENTER);
        noStroke();
        fill('#ffffff');
        textSize(isMobile ? 24 : 36);
        text(I18n.getText('menu_button_credits').toUpperCase(), centerX, startY);

        let profileY = startY + (isMobile ? 100 : 160); 
        let spriteScale = isMobile ? 1.0 : 1.5;
        let colOffset = isMobile ? 100 : 180; 
        
        let leftColX = centerX - colOffset;
        let rightColX = centerX + colOffset;

        // Render Developer Profile using the static property
        if (CreditsScene.miguelProfileAni) {
            push(); translate(leftColX, profileY - 30); scale(spriteScale); animation(CreditsScene.miguelProfileAni, 0, 0); pop();
        }
        noStroke(); fill('#38bdf8'); textSize(isMobile ? 16 : 22);
        text("Miguel Páramos", leftColX, profileY + (isMobile ? 60 : 80));
        fill('#94a3b8'); textSize(isMobile ? 11 : 14);
        text(I18n.getText('credits_role_dev'), leftColX, profileY + (isMobile ? 80 : 105));

        // Render AI Profile using the static property
        if (CreditsScene.garnataProfileAni) {
            push(); translate(rightColX, profileY - 30); scale(spriteScale); animation(CreditsScene.garnataProfileAni, 0, 0); pop();
        }
        noStroke(); fill('#38bdf8'); textSize(isMobile ? 16 : 22);
        text("Garnata", rightColX, profileY + (isMobile ? 60 : 80));
        fill('#94a3b8'); textSize(isMobile ? 11 : 14);
        text(I18n.getText('credits_role_ai'), rightColX, profileY + (isMobile ? 80 : 105));

        let assetsY = profileY + (isMobile ? 130 : 180);
        let lineSpacing = isMobile ? 16 : 22;
        textSize(isMobile ? 11 : 14);
        
        fill('#ffffff'); text(I18n.getText('credits_libs').toUpperCase(), centerX, assetsY);
        fill('#94a3b8'); text("q5play, p5play, JSZip, Tailwind CSS", centerX, assetsY + lineSpacing);

        let musicY = assetsY + lineSpacing * 2.5;
        fill('#ffffff'); text(I18n.getText('credits_music').toUpperCase(), centerX, musicY);
        fill('#94a3b8'); 
        text('"When I inserted the cartridge" - Suno (Commercial License)', centerX, musicY + lineSpacing);
        text('"After a hard day\'s work" - Suno (Commercial License)', centerX, musicY + lineSpacing * 2);

        let sfxY = musicY + lineSpacing * 3.5;
        fill('#ffffff'); text(I18n.getText('credits_sfx').toUpperCase(), centerX, sfxY);
        fill('#94a3b8'); 
        text("Universfield (Pixabay) - Button Selected SFX", centerX, sfxY + lineSpacing);
        text("plasterbrain (Freesound / Pixabay) - Game Start SFX", centerX, sfxY + lineSpacing * 2);
        text("floraphonic (Pixabay/floraphonic.com) - 8 Bit Game 2 (Hover SFX)", centerX, sfxY + lineSpacing * 3);

        this.#ui.update();
        this.#ui.draw();
    }

    windowResized() {
        if (this.#btnBack) {
            let isMobile = width < 768;
            this.#btnBack.x = isMobile ? width / 2 : width - 120;
            this.#btnBack.y = height - (isMobile ? 60 : 80);
        }
    }
}