/**
 * @file MainMenuScene.js
 * @description Main menu screen scene. Inherits from Scene.
 * Handles UI initialization, dynamic background, settings overlay, and navigation.
 * @author Miguel Páramos
 */
class MainMenuScene extends Scene {
    static sfxStart = null;
    static logoImg = null;
    #btnLoad;
    #btnSettings;
    #btnCredits;
    #openFrame;
    #uiInitialized;
    #transitionState;
    #animTimer;
    #uiAlpha;
    #ui;

    /**
     * Loads specific global assets for the Main Menu.
     */
    static preloadAssets() {
        try { MainMenuScene.sfxStart = loadSound('assets/sfx/startpressed.mp3'); } catch(e) {}
    }

    constructor() {
        super('menu', 'assets/music/official/When I inserted the cartridge.mp3');

        // Lazy load specific assets for this scene
        if (!MainMenuScene.sfxStart) {
            try { MainMenuScene.sfxStart = loadSound('assets/sfx/startpressed.mp3'); } catch(e) {}
        }
        if (!MainMenuScene.logoImg) {
            try { MainMenuScene.logoImg = loadImage('assets/logos/Yag2Dpg-logo.png'); } catch(e) {}
        }

        this.#btnLoad = null;
        this.#btnSettings = null;
        this.#btnCredits = null;
        
        this.#openFrame = 0;
        this.#uiInitialized = false;
        this.#transitionState = 0;
        this.#animTimer = 0;
        this.#uiAlpha = 0;
        this.#ui = new GUIManager();
    }

    setup() {
        world.gravity.y = 0;
        this.#uiInitialized = false;
        this.#uiInitialized = false;

        this.playMusic();

        if (SceneManager.isAwake) {
            this.#transitionState = 3;
            this.#uiAlpha = 1;
            
            this.#initMenuUI();
            
            if (this.#btnLoad) {
                this.#btnLoad.alpha = 1;
                this.#btnLoad.disabled = false;
            }
            if (this.#btnSettings) {
                this.#btnSettings.alpha = 1;
                this.#btnSettings.disabled = false;
            }
            if (this.#btnCredits) {
                this.#btnCredits.alpha = 1;
                this.#btnCredits.disabled = false;
            }
        } else {
            this.#transitionState = 0;
            this.#animTimer = 0;
            this.#uiAlpha = 0;
        }
    }

    #initMenuUI() {
        this.#ui.clear();
        
        this.#btnLoad = new MenuButton(
            width / 2 - 40, height / 2 + 180, 240, 60, 
            I18n.getText('menu_button_load'),
            () => { this.#triggerFilePicker(); } 
        );

        this.#btnSettings = new MenuButton(
            width / 2 + 120, height / 2 + 180, 60, 60, "⚙️",
            () => { sceneManager.settings.toggle(); } 
        );

        this.#btnCredits = new MenuButton(
            width - 120, height - 80, 
            200, 50, 
            I18n.getText('menu_button_credits'),
            () => { sceneManager.changeScene(new CreditsScene()); }
        );

        this.#btnLoad.alpha = 0;
        this.#btnSettings.alpha = 0;
        this.#btnCredits.alpha = 0;
        this.#btnLoad.disabled = true;
        this.#btnSettings.disabled = true;
        this.#btnCredits.disabled = true;
        
        this.#ui.add(this.#btnLoad);
        this.#ui.add(this.#btnSettings);
        this.#ui.add(this.#btnCredits);
        
        this.#uiInitialized = true;
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
        
        if (MainMenuScene.logoImg) {
            imageMode(CENTER);
            let aspect = MainMenuScene.logoImg.height / MainMenuScene.logoImg.width;
            let targetWidth = width < 600 ? width * 0.8 : 400;
            image(MainMenuScene.logoImg, width / 2, height / 2 - 120, targetWidth, targetWidth * aspect);
        }

        if (this.#transitionState === 0) {
            if (SceneManager.isAwake) {
                this.#transitionState = 1; 
                this.#animTimer = frameCount;
                if (MainMenuScene.sfxStart && MainMenuScene.sfxStart.isLoaded()) {
                    MainMenuScene.sfxStart.setVolume(ConfigManager.sfxVolume);
                    MainMenuScene.sfxStart.play();
                }
            } else {
                if (Math.floor(frameCount / 30) % 2 === 0) {
                    fill('#38bdf8');
                    textAlign(CENTER, CENTER);
                    textSize(width < 600 ? 16 : 20);
                    text(I18n.getText('menu_press_start'), width / 2, height / 2 + 100);
                }
            }
        } 
        else if (this.#transitionState === 1) {
            if (Math.floor(frameCount / 5) % 2 === 0) {
                fill('#38bdf8');
                textAlign(CENTER, CENTER);
                textSize(width < 600 ? 16 : 20);
                text(I18n.getText('menu_press_start'), width / 2, height / 2 + 100);
            }
            
            if (frameCount - this.#animTimer > 60) {
                this.#transitionState = 2;
                this.#animTimer = frameCount;
                if (!this.#uiInitialized) this.#initMenuUI();
            }
        }
        else if (this.#transitionState === 2) {
            this.#uiAlpha = min(1, (frameCount - this.#animTimer) / 30);
            
            this.#btnLoad.alpha = this.#uiAlpha;
            this.#btnSettings.alpha = this.#uiAlpha;
            if (this.#btnCredits) this.#btnCredits.alpha = this.#uiAlpha;

            // FIX: Removed undefined 'lang' parameter
            this.#drawMenuElements(this.#uiAlpha);

            if (this.#uiAlpha >= 1) {
                this.#transitionState = 3; 
                this.#btnLoad.disabled = false;
                this.#btnSettings.disabled = false;
                if (this.#btnCredits) this.#btnCredits.disabled = false;
            }
        }
        else if (this.#transitionState === 3) {
            if (this.#btnLoad) this.#btnLoad.textStr = I18n.getText('menu_button_load');
            if (this.#btnCredits) this.#btnCredits.textStr = I18n.getText('menu_button_credits');

            this.#drawMenuElements(1);
        }
        
        if (this.#transitionState >= 2) {
            this.#ui.update();
            this.#ui.draw();
        }
    }

    #drawMenuElements(alphaVal) {
        push();
        drawingContext.globalAlpha = alphaVal;
        
        textAlign(CENTER, CENTER);
        noStroke();
        let linkY = height / 2 + 100;
        textSize(width < 600 ? 28 : 40);
        let textWidthAprox = 240; 
        
        let isHovering = abs(mouseX - width / 2) < textWidthAprox / 2 && abs(mouseY - linkY) < 20;
        
        let isSettingsMenuOpen = typeof sceneManager !== 'undefined' && sceneManager.settings && sceneManager.settings.isOpen;
        
        if (this.#transitionState === 3 && !isSettingsMenuOpen && isHovering) {
            fill('#38bdf8');
            cursor('pointer');
            if (mouse.presses()) window.open('https://mparamos.com', '_blank');
        } else {
            fill('#0ea5e9');
        }
        text("mparamos.com", width / 2, linkY);

        textSize(width < 600 ? 12 : 15.3);
        fill('#aadafa');
        text(I18n.getText('menu_subtitle'), width / 2, height / 2 + 130);
        pop();
    }


    /**
     * Generates a hidden file input to invoke the OS file picker.
     * @private
     */
    #triggerFilePicker() {
        let fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.zip';
        fileInput.style.display = 'none';
        
        fileInput.addEventListener('change', (e) => {
            let file = e.target.files[0];
            if (file) {
                // Pasamos el archivo físico a la nueva escena
                sceneManager.changeScene(new GameLevelScene(file)); 
            }
            fileInput.remove(); // Limpieza del DOM
        });

        document.body.appendChild(fileInput);
        fileInput.click();
    }

    windowResized() {
        if (this.#uiInitialized && this.#btnLoad && this.#btnSettings) {
            this.#btnLoad.x = width / 2 - 40;
            this.#btnLoad.y = height / 2 + 180;
            this.#btnSettings.x = width / 2 + 120;
            this.#btnSettings.y = height / 2 + 180;
            
            if (this.#btnCredits) {
                this.#btnCredits.x = width < 600 ? width / 2 : width - 120;
                this.#btnCredits.y = height - 80;
            }
        }
    }
}