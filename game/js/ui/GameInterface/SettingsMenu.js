/**
 * @file SettingsMenu.js
 * @description Universal OOP overlay for game settings (Volume & SFX).
 * Can be invoked from any scene via the SceneManager or the ESC key.
 * @author Miguel Páramos
 */
class SettingsMenu {
    #isOpen;
    #volumeSlider;
    #sfxSlider;
    #openFrame;
    #btnMainMenu; // Dynamic instance for the exit button

    constructor() {
        this.#isOpen = false;
        this.#openFrame = 0;
        this.#btnMainMenu = null;
        this.#createSliders();
    }

    /**
     * Initializes the DOM elements for the sliders.
     * @private
     */
    #createSliders() {
        let container = document.getElementById('game-container');
        this.#volumeSlider = createSlider(0, 100, ConfigManager.musicVolume * 100);
        this.#sfxSlider = createSlider(0, 100, ConfigManager.sfxVolume * 100);
        
        if (container) {
            container.appendChild(this.#volumeSlider);
            container.appendChild(this.#sfxSlider);
        }

        let sliders = [this.#volumeSlider, this.#sfxSlider];
        sliders.forEach(slider => {
            slider.style.width = '160px';
            slider.style.display = 'none'; 
            slider.style.position = 'absolute';
            slider.style.left = '50%';
            slider.style.transform = 'translateX(-50%)'; 
            slider.style.zIndex = '100';
        });

        this.#volumeSlider.style.top = 'calc(50% - 45px)';
        this.#sfxSlider.style.top = 'calc(50% + 15px)';
    }

    // --- GETTERS ---
    get isOpen() { return this.#isOpen; }

    toggle() {
        if (this.#isOpen) this.close();
        else this.open();
    }

    open() {
        this.#isOpen = true;
        this.#volumeSlider.style.display = 'block';
        this.#sfxSlider.style.display = 'block';
        this.#openFrame = frameCount;

        if (sceneManager && sceneManager.activeScene && sceneManager.activeScene.name === 'game_level') {
            this.#btnMainMenu = new MenuButton(
                width / 2, height / 2 + 75, 
                220, 40, 
                I18n.getText('settings_main_menu'),
                () => {
                    this.close(); 
                    sceneManager.changeScene(new MainMenuScene()); 
                },'red'
            );
            this.#btnMainMenu.isSettingsButton = true;
        }
    }

    close() {
        this.#isOpen = false;
        this.#volumeSlider.style.display = 'none';
        this.#sfxSlider.style.display = 'none';

        // Destroy the button instance from memory if it exists
        if (this.#btnMainMenu) {
            this.#btnMainMenu.remove();
            this.#btnMainMenu = null;
        }
    }

    draw() {
        // Chequeamos si CUALQUIER modal bloqueante está abierto (Salir o Reiniciar)
        let isModalBlocking = false;
        if (sceneManager && sceneManager.activeScene) {
            if (typeof sceneManager.activeScene.hasBlockingModal === 'function') {
                isModalBlocking = sceneManager.activeScene.hasBlockingModal();
            } else if (sceneManager.activeScene.isQuitModalOpen) {
                isModalBlocking = true;
            }
        }

        // Lógica inteligente del Enter
        if (kb.presses('enter')) {
            if (this.#isOpen) {
                this.close(); // Siempre podemos cerrarlo con Enter
            } else if (!isModalBlocking) {
                this.open(); // Solo se abre si NINGÚN modal está en pantalla
            }
        }

        if (!this.#isOpen) return;

        // Traducción en vivo del botón de salir al menú (si existe)
        if (this.#btnMainMenu) {
            this.#btnMainMenu.textStr = I18n.getText('settings_main_menu');
        }

        push();
        fill(0, 0, 0, 180);
        rectMode(CORNER);
        rect(0, 0, width, height);
        
        rectMode(CENTER);
        fill(15, 23, 42); 
        stroke('#0ea5e9');
        strokeWeight(2);
        
        let boxWidth = width < 500 ? width * 0.9 : 460;
        let boxHeight = 280;
        rect(width / 2, height / 2, boxWidth, boxHeight, 15);
        
        noStroke();
        fill('#ffffff');
        textAlign(CENTER, CENTER);
        textSize(28);
        text(I18n.getText('options_title'), width / 2, height / 2 - 100);
        
        // --- MUSIC LOGIC ---
        let musicVal = parseFloat(this.#volumeSlider.value);
        let normalizedMusic = musicVal / 100;
        
        if (normalizedMusic !== ConfigManager.musicVolume) {
            ConfigManager.musicVolume = normalizedMusic;
            
            if (sceneManager && sceneManager.activeScene) {
                sceneManager.activeScene.updateVolume(normalizedMusic);
            }
        }

        let textOffset = width < 500 ? 50 : 95;
        textSize(width < 500 ? 14 : 18);
        textAlign(RIGHT, CENTER);
        fill('#ffffff');
        text(I18n.getText('options_music_vol'), width / 2 - textOffset, height / 2 - 45);
        
        textAlign(LEFT, CENTER);
        fill('#38bdf8');
        text(musicVal + "%", width / 2 + textOffset, height / 2 - 45);

        // --- SFX LOGIC ---
        let sfxVal = parseFloat(this.#sfxSlider.value);
        let normalizedSfx = sfxVal / 100;
        
        if (normalizedSfx !== ConfigManager.sfxVolume) {
            ConfigManager.sfxVolume = normalizedSfx;
        }

        textAlign(RIGHT, CENTER);
        fill('#ffffff');
        text(I18n.getText('options_sfx_vol'), width / 2 - textOffset, height / 2 + 15);
        
        textAlign(LEFT, CENTER);
        fill('#38bdf8');
        text(sfxVal + "%", width / 2 + textOffset, height / 2 + 15);

        textAlign(CENTER, CENTER);
        textSize(12);
        fill('#94a3b8');
        text(I18n.getText('options_close'), width / 2, height / 2 + 120);
        
        if (mouse.presses() && frameCount > this.#openFrame + 10) {
            let inBoxX = mouseX > width / 2 - (boxWidth / 2) && mouseX < width / 2 + (boxWidth / 2);
            let inBoxY = mouseY > height / 2 - (boxHeight / 2) && mouseY < height / 2 + (boxHeight / 2);
            
            if (!inBoxX || !inBoxY) {
                this.close();
            }
        }
        pop();

        if (this.#btnMainMenu) {
            this.#btnMainMenu.update();
        }
        if (this.#btnMainMenu) {
            this.#btnMainMenu.draw();
        }
    }
}
