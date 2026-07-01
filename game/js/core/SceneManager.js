/**
 * @file scene_manager.js
 * @description Global state machine that orchestrates transitions.
 * Fully encapsulated to prevent external state corruption.
 */
class SceneManager {
    static ENGINE_VERSION = '0.0.2';
    static #engineAwake = false;

    #currentScene;
    #targetScene;
    #isFading;
    #state; 
    #alpha;
    #fadeSpeed;
    #settingsMenu; // NUEVO: Instancia global del menú

    // Getter público para consultar el estado
    static get isAwake() { return this.#engineAwake; }

    // Método estático para despertar el motor de audio
    static awakeEngine() {
        if (this.#engineAwake) return;
        this.#engineAwake = true;

        if (typeof getAudioContext !== 'undefined' && getAudioContext().state !== 'running') {
            getAudioContext().resume();
        }
    }

    constructor() {
        this.#currentScene = null;
        this.#targetScene = null;
        this.#isFading = false;
        this.#state = 'IDLE';
        this.#alpha = 0;
        this.#fadeSpeed = 0.05;
        this.#settingsMenu = new SettingsMenu(); // Instanciamos el UI universal
    }

    get settings() { return this.#settingsMenu; }

    /**
     * Public getter to safely expose the current scene if needed.
     * @returns {Scene} The active scene instance.
     */
    get activeScene() {
        return this.#currentScene;
    }

    /**
     * Initiates a transition to a new scene. (Public method)
     * @param {Scene} newSceneInstance - The instantiated scene object.
     * @param {boolean} forceInstant - If true, bypasses the fade transition.
     */
    changeScene(newSceneInstance, forceInstant = false) {
        if (forceInstant) {
            this.#executeSwap(newSceneInstance);
            return;
        }

        if (this.#isFading) return;
        
        this.#isFading = true;
        this.#state = 'OUT';
        this.#targetScene = newSceneInstance;
    }

    /**
     * Executes the actual teardown and setup. (Private method)
     * @private
     */
    #executeSwap(newSceneInstance) {
        if (this.#currentScene) {
            this.#currentScene.exit();
        }
        
        if (typeof allSprites !== 'undefined') {
            allSprites.removeAll();
        }

        this.#currentScene = newSceneInstance;
        this.#currentScene.preload();
        this.#currentScene.setup();
    }

    /**
     * Main execution hook. (Public method)
     * @param {string} lang - The active language code.
     */
/**
     * Main execution hook. (Public method)
     */
draw() {
        // Lógica Universal de Teclado (Escape)
        if (kb.presses('escape')) {
            if (this.#settingsMenu.isOpen) {
                // Prioridad absoluta: cerrar ajustes
                this.#settingsMenu.close();
            } else if (this.#currentScene) {
                // Delegamos a la escena. Si devuelve false, ejecutamos el comportamiento por defecto
                let handledLocally = typeof this.#currentScene.onEscape === 'function' ? this.#currentScene.onEscape() : false;
                
                if (!handledLocally && this.#currentScene.name !== 'menu') {
                    this.changeScene(new MainMenuScene());
                }
            }
        }

        if (this.#currentScene) {
            if (!this.#settingsMenu.isOpen) {
                this.#currentScene.draw();
            } else {
                push();
                this.#currentScene.draw(); 
                pop();
            }
        }

        this.#handleFade();
        this.#settingsMenu.draw();
    }

    /**
     * Processes the visual transition logic. (Private method)
     * Cannot be called outside the class.
     * @private
     */
    #handleFade() {
        if (!this.#isFading) return;

        if (this.#state === 'OUT') {
            this.#alpha += this.#fadeSpeed;
            if (this.#alpha >= 1) {
                this.#alpha = 1;
                this.#state = 'IN';
                this.#executeSwap(this.#targetScene);
            }
        } else if (this.#state === 'IN') {
            this.#alpha -= this.#fadeSpeed;
            if (this.#alpha <= 0) {
                this.#alpha = 0;
                this.#state = 'IDLE';
                this.#isFading = false;
            }
        }

        push();
        drawingContext.globalAlpha = this.#alpha;
        fill(0);
        noStroke();
        rectMode(CORNER);
        rect(0, 0, width, height);
        pop();
    }

    /**
     * Delegates resize events to the active scene. (Public method)
     */
    windowResized() {
        if (this.#currentScene) {
            this.#currentScene.windowResized();
        }
    }
}