/**
 * @file MenuButton.js
 * @description OOP wrapper for interactive UI buttons using q5play sprites.
 * Encapsulates rendering, state management, and audio feedback.
 */
class MenuButton {
    static sfxHover = null;
    static sfxClick = null;
    #sprite;
    #baseColor;
    #hoverColor;
    #disabledBaseColor;
    #disabledTextColor;
    #textStr;
    #actionCallback;
    #wasHovering;
    #isSettingsButton;
    #isQuitModalButton;
    #clickTimer;

    static preloadAssets() {
        try { MenuButton.sfxHover = loadSound('assets/sfx/buttonhover.mp3'); } catch(e) {}
        try { MenuButton.sfxClick = loadSound('assets/sfx/buttonpressed.mp3'); } catch(e) {}
    }

    /**
     * Instantiates a new interactive menu button.
     * @param {number} x - The x-coordinate of the button's center.
     * @param {number} y - The y-coordinate of the button's center.
     * @param {number} w - The width of the button.
     * @param {number} h - The height of the button.
     * @param {string} textStr - The text or icon to display.
     * @param {function} actionCallback - The callback executed on click.
     */
    //TODO available color theme should be explained on this function's documentation.
    constructor(x, y, w, h, textStr, actionCallback, theme = 'blue') {
        if (!MenuButton.sfxHover) {
            try { MenuButton.sfxHover = loadSound('assets/sfx/buttonhover.mp3'); } catch(e) {}
        }
        if (!MenuButton.sfxClick) {
            try { MenuButton.sfxClick = loadSound('assets/sfx/buttonpressed.mp3'); } catch(e) {}
        }
        
        this.#applyTheme(theme);
        
        this.#textStr = textStr;
        this.#actionCallback = actionCallback;
        this.#wasHovering = false;
        
        this.#isSettingsButton = false;
        this.#isQuitModalButton = false;
        this.#clickTimer = 0;

        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = this.#baseColor;
        this.disabled = false;
        this.alpha = 1;
    }

    simulateClick() {
        if (this.disabled || this.#isGloballyBlocked() || this.alpha <= 0) return;
        if (this.#clickTimer > 0) return; // Ya está siendo pulsado

        if (MenuButton.sfxClick && MenuButton.sfxClick.isLoaded()) {
            MenuButton.sfxClick.setVolume(ConfigManager.sfxVolume);
            MenuButton.sfxClick.play();
        }
        this.#clickTimer = 10;
    }

    // --- GETTERS & SETTERS ---

    get textStr() { return this.#textStr; }
    set textStr(value) { this.#textStr = value; }

    get isSettingsButton() { return this.#isSettingsButton; }
    set isSettingsButton(value) { this.#isSettingsButton = value; }

    get isQuitModalButton() { return this.#isQuitModalButton; }
    set isQuitModalButton(value) { this.#isQuitModalButton = value; }

    // --- PRIVATE METHODS ---

    #applyTheme(theme) {
        const palettes = {
            blue: { base: '#0ea5e9', hover: '#38bdf8' },
            red:  { base: '#ef4444', hover: '#f87171' },
            green: { base: '#22c55e', hover: '#4ade80' }
        };
        
        let selected = palettes[theme] || palettes.blue;
        
        this.#baseColor = selected.base;
        this.#hoverColor = selected.hover;
        this.#disabledBaseColor = '#1e293b';
        this.#disabledTextColor = '#94a3b8';
    }

    #isGloballyBlocked() {
        let settingsOpen = typeof sceneManager !== 'undefined' && sceneManager.settings && sceneManager.settings.isOpen;
        if (settingsOpen) {
            return !this.#isSettingsButton; 
        }
        
        // Reusamos el helper central de GameLevelScene si existe
        let hasBlockingModal = typeof sceneManager !== 'undefined' && 
                               sceneManager.activeScene && 
                               typeof sceneManager.activeScene.hasBlockingModal === 'function' &&
                               sceneManager.activeScene.hasBlockingModal();

        // Fallback por si la escena antigua solo tiene isQuitModalOpen
        let quitModalOpen = typeof sceneManager !== 'undefined' && sceneManager.activeScene && sceneManager.activeScene.isQuitModalOpen;

        if (hasBlockingModal || quitModalOpen) {
            return !this.#isQuitModalButton; 
        }
        
        return false;
    }

    draw() {
        if (this.alpha <= 0) return;

        push();
        drawingContext.globalAlpha = this.alpha; 
        
        let visuallyDisabled = this.disabled || this.#isGloballyBlocked();

        let scaleVal = 1;
        if (this.#clickTimer > 0) {
            scaleVal = 0.92;
            // Removed decrement here, handled in update()
            if (!visuallyDisabled) {
                drawingContext.filter = 'brightness(1.5)';
            }
        }

        translate(this.x, this.y);
        scale(scaleVal);
        
        rectMode(CENTER);

        if (!visuallyDisabled) {
            drawingContext.shadowBlur = 20;
            drawingContext.shadowColor = this.color;
        }
        
        stroke('#ffffff');
        strokeWeight(2);
        fill(visuallyDisabled ? this.#disabledBaseColor : this.color);
        rect(0, 0, this.w, this.h, 15);
        drawingContext.shadowBlur = 0;
        
        noStroke();
        fill(visuallyDisabled ? this.#disabledTextColor : '#ffffff');
        textAlign(CENTER, CENTER);
        
        textSize(this.w > 80 ? 18 : 26); 
        text(this.#textStr, 0, 0);
        pop();
    }

    update() {
        if (this.disabled || this.#isGloballyBlocked() || this.alpha <= 0) {
            this.color = this.#baseColor;
            this.#wasHovering = false;
            return; 
        }

        if (this.#clickTimer > 0) {
            this.#clickTimer--;
            if (this.#clickTimer === 0 && typeof this.#actionCallback === 'function') {
                this.#actionCallback();
            }
            return; // Block other interactions while animating
        }

        // Detección de AABB manual centrada (ya que rectMode es CENTER)
        let isHoveringNow = mouseX >= this.x - this.w / 2 && 
                            mouseX <= this.x + this.w / 2 && 
                            mouseY >= this.y - this.h / 2 && 
                            mouseY <= this.y + this.h / 2;

        if (isHoveringNow) {
            this.color = this.#hoverColor; 
            cursor('pointer');
            
            if (!this.#wasHovering && MenuButton.sfxHover && MenuButton.sfxHover.isLoaded()) {
                MenuButton.sfxHover.setVolume(ConfigManager.sfxVolume);
                MenuButton.sfxHover.play();
            }
        } else {
            this.color = this.#baseColor; 
        }
        
        this.#wasHovering = isHoveringNow;

        // p5.play "mouse" detecta clics de forma global
        if (isHoveringNow && mouse.presses()) {
            if (MenuButton.sfxClick && MenuButton.sfxClick.isLoaded()) {
                MenuButton.sfxClick.setVolume(ConfigManager.sfxVolume);
                MenuButton.sfxClick.play();
            }
            this.#clickTimer = 10;
        }
    }

    remove() {
        // Obsoleto: Ya no manejamos un sprite subyacente.
    }
}
