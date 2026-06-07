/**
 * @file scene_menu.js
 * @description Main menu screen scene. Handles the "Press Start" cinematic transition,
 * UI initialization, dynamic background, settings overlay, and navigation.
 * @author Miguel Páramos
 */

const MenuScene = {
    btnLoad: null,
    btnSettings: null,
    btnCredits: null,
    volumeSlider: null,
    sfxSlider: null,
    isSettingsOpen: false,
    openFrame: 0,
    uiInitialized: false, 
    
    transitionState: 0, 
    animTimer: 0,
    uiAlpha: 0,

    setup: function() {
        world.gravity.y = 0;
        this.uiInitialized = false;
        this.isSettingsOpen = false;

        if (window.gameHasStarted) {
            this.transitionState = 3;
            this.uiAlpha = 1;
            
            this.initMenuUI();
            
            if (this.btnLoad) {
                this.btnLoad.alpha = 1;
                this.btnLoad.disabled = false;
            }
            if (this.btnSettings) {
                this.btnSettings.alpha = 1;
                this.btnSettings.disabled = false;
            }
            // Fix: Ensure Credits button is fully restored when returning via Escape
            if (this.btnCredits) {
                this.btnCredits.alpha = 1;
                this.btnCredits.disabled = false;
            }
        } else {
            this.transitionState = 0;
            this.animTimer = 0;
            this.uiAlpha = 0;
        }
    },

    initMenuUI: function() {
        this.btnLoad = createCyberButton(
            width / 2 - 40, height / 2 + 180, 
            240, 60, 
            getText(window.activeLanguage || 'es', 'menu_button_load'),
            () => {
                if (this.volumeSlider) this.volumeSlider.remove();
                if (this.sfxSlider) this.sfxSlider.remove();
                changeScene('level');
            }
        );

        this.btnSettings = createCyberButton(
            width / 2 + 120, height / 2 + 180, 
            60, 60, 
            "⚙️",
            () => { this.toggleSettings(); }
        );

        // Positioned slightly higher to avoid overlapping with HTML footers on mobile
        this.btnCredits = createCyberButton(
            width - 120, height - 80, 
            200, 50, 
            getText(window.activeLanguage || 'es', 'menu_button_credits'),
            () => {
                if (this.volumeSlider) this.volumeSlider.remove();
                if (this.sfxSlider) this.sfxSlider.remove();
                changeScene('credits');
            }
        );

        this.btnLoad.alpha = 0;
        this.btnSettings.alpha = 0;
        this.btnCredits.alpha = 0;
        this.btnLoad.disabled = true;
        this.btnSettings.disabled = true;
        this.btnCredits.disabled = true;

        let container = document.getElementById('game-container');
        this.volumeSlider = createSlider(0, 100, window.GameConfig.musicVolume * 100);
        this.sfxSlider = createSlider(0, 100, window.GameConfig.sfxVolume * 100);
        
        if (container) {
            container.appendChild(this.volumeSlider);
            container.appendChild(this.sfxSlider);
        }

        let sliders = [this.volumeSlider, this.sfxSlider];
        sliders.forEach(slider => {
            slider.style.width = '160px';
            slider.style.display = 'none'; 
            slider.style.position = 'absolute';
            slider.style.left = '50%';
            slider.style.transform = 'translateX(-50%)'; 
            slider.style.zIndex = '100';
        });

        this.volumeSlider.style.top = 'calc(50% - 35px)';
        this.sfxSlider.style.top = 'calc(50% + 25px)';
        
        this.uiInitialized = true;
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
        
        if (typeof logoImg !== 'undefined' && logoImg) {
            imageMode(CENTER);
            let aspect = logoImg.height / logoImg.width;
            // Responsive logo size
            let targetWidth = width < 600 ? width * 0.8 : 400;
            image(logoImg, width / 2, height / 2 - 120, targetWidth, targetWidth * aspect);
        }

        if (this.transitionState === 0) {
            if (window.gameHasStarted) {
                this.transitionState = 1; 
                this.animTimer = frameCount;
                if (typeof sfxStart !== 'undefined' && sfxStart.isLoaded()) {
                    sfxStart.setVolume(window.GameConfig.sfxVolume);
                    sfxStart.play();
                }
            } else {
                if (Math.floor(frameCount / 30) % 2 === 0) {
                    fill('#38bdf8');
                    textAlign(CENTER, CENTER);
                    textSize(width < 600 ? 16 : 20); // Responsive text
                    text(getText(lang, 'menu_press_start'), width / 2, height / 2 + 100);
                }
            }
        } 
        else if (this.transitionState === 1) {
            if (Math.floor(frameCount / 5) % 2 === 0) {
                fill('#38bdf8');
                textAlign(CENTER, CENTER);
                textSize(width < 600 ? 16 : 20);
                text(getText(lang, 'menu_press_start'), width / 2, height / 2 + 100);
            }
            
            if (frameCount - this.animTimer > 60) {
                this.transitionState = 2;
                this.animTimer = frameCount;
                if (!this.uiInitialized) this.initMenuUI();
            }
        }
        else if (this.transitionState === 2) {
            this.uiAlpha = min(1, (frameCount - this.animTimer) / 30);
            
            this.btnLoad.alpha = this.uiAlpha;
            this.btnSettings.alpha = this.uiAlpha;
            if (this.btnCredits) this.btnCredits.alpha = this.uiAlpha;

            this.drawMenuElements(lang, this.uiAlpha);

            if (this.uiAlpha >= 1) {
                this.transitionState = 3; 
                this.btnLoad.disabled = false;
                this.btnSettings.disabled = false;
                if (this.btnCredits) this.btnCredits.disabled = false;
            }
        }
        else if (this.transitionState === 3) {
            if (this.btnLoad) this.btnLoad.textStr = getText(lang, 'menu_button_load');
            if (this.btnCredits) this.btnCredits.textStr = getText(lang, 'menu_button_credits');
            
            this.drawMenuElements(lang, 1);
            if (this.isSettingsOpen) this.drawSettingsMenu(lang);
        }
    },

    drawMenuElements: function(lang, alphaVal) {
        push();
        drawingContext.globalAlpha = alphaVal;
        
        textAlign(CENTER, CENTER);
        noStroke();
        let linkY = height / 2 + 100;
        textSize(width < 600 ? 28 : 40); // Responsive text
        let textWidthAprox = 240; 
        
        let isHovering = abs(mouseX - width / 2) < textWidthAprox / 2 && abs(mouseY - linkY) < 20;
        
        if (this.transitionState === 3 && !this.isSettingsOpen && isHovering) {
            fill('#38bdf8');
            cursor('pointer');
            if (mouse.presses()) window.open('https://mparamos.com', '_blank');
        } else {
            fill('#0ea5e9');
        }
        text("mparamos.com", width / 2, linkY);

        textSize(width < 600 ? 12 : 15.3); // Responsive subtitle
        fill('#aadafa');
        text(getText(lang, 'menu_subtitle'), width / 2, height / 2 + 130);
        pop();
    },

    toggleSettings: function() {
        this.isSettingsOpen = true;
        this.btnLoad.disabled = true;
        this.btnSettings.disabled = true;
        if (this.btnCredits) this.btnCredits.disabled = true;
        
        this.volumeSlider.style.display = 'block';
        this.sfxSlider.style.display = 'block';
        this.openFrame = frameCount;
    },

    closeSettings: function() {
        this.isSettingsOpen = false;
        this.btnLoad.disabled = false;
        this.btnSettings.disabled = false;
        if (this.btnCredits) this.btnCredits.disabled = false;
        
        this.volumeSlider.style.display = 'none';
        this.sfxSlider.style.display = 'none';
    },

    drawSettingsMenu: function(lang) {
        push();
        fill(0, 0, 0, 180);
        rectMode(CORNER);
        rect(0, 0, width, height);
        
        rectMode(CENTER);
        fill(15, 23, 42); 
        stroke('#0ea5e9');
        strokeWeight(2);
        
        // Responsive box width
        let boxWidth = width < 500 ? width * 0.9 : 460;
        let boxHeight = 280;
        rect(width / 2, height / 2, boxWidth, boxHeight, 15);
        
        noStroke();
        fill('#ffffff');
        textAlign(CENTER, CENTER);
        textSize(28);
        text(getText(lang, 'options_title'), width / 2, height / 2 - 100);
        
        let musicVal = parseFloat(this.volumeSlider.value);
        let normalizedMusic = musicVal / 100;
        if (normalizedMusic !== window.GameConfig.musicVolume) {
            window.GameConfig.musicVolume = normalizedMusic;
            localStorage.setItem('yag2dpg_music_volume', normalizedMusic);
            if (bgMusic) bgMusic.setVolume(normalizedMusic);
        }

        // Adjust text offsets based on screen size
        let textOffset = width < 500 ? 50 : 95;

        textSize(width < 500 ? 14 : 18);
        textAlign(RIGHT, CENTER);
        fill('#ffffff');
        text(getText(lang, 'options_music_vol'), width / 2 - textOffset, height / 2 - 35);
        
        textAlign(LEFT, CENTER);
        fill('#38bdf8');
        text(musicVal + "%", width / 2 + textOffset, height / 2 - 35);

        let sfxVal = parseFloat(this.sfxSlider.value);
        let normalizedSfx = sfxVal / 100;
        if (normalizedSfx !== window.GameConfig.sfxVolume) {
            window.GameConfig.sfxVolume = normalizedSfx;
            localStorage.setItem('yag2dpg_sfx_volume', normalizedSfx);
        }

        textAlign(RIGHT, CENTER);
        fill('#ffffff');
        text(getText(lang, 'options_sfx_vol'), width / 2 - textOffset, height / 2 + 25);
        
        textAlign(LEFT, CENTER);
        fill('#38bdf8');
        text(sfxVal + "%", width / 2 + textOffset, height / 2 + 25);

        textAlign(CENTER, CENTER);
        textSize(12);
        fill('#94a3b8');
        text(getText(lang, 'options_close'), width / 2, height / 2 + 110);
        
        if (kb.presses('escape')) {
            this.closeSettings();
        } else if (mouse.presses() && frameCount > this.openFrame + 10) {
            let inBoxX = mouseX > width / 2 - (boxWidth / 2) && mouseX < width / 2 + (boxWidth / 2);
            let inBoxY = mouseY > height / 2 - (boxHeight / 2) && mouseY < height / 2 + (boxHeight / 2);
            
            if (!inBoxX || !inBoxY) {
                this.closeSettings();
            }
        }
        pop();
    },

    windowResized: function() {
        if (this.uiInitialized && this.btnLoad && this.btnSettings) {
            this.btnLoad.x = width / 2 - 40;
            this.btnLoad.y = height / 2 + 180;
            this.btnSettings.x = width / 2 + 120;
            this.btnSettings.y = height / 2 + 180;
            
            if (this.btnCredits) {
                // Keep responsive logic in resize event
                this.btnCredits.x = width < 600 ? width / 2 : width - 120;
                this.btnCredits.y = height - 80;
            }
        }
    }
};