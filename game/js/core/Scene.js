/**
 * @file Scene.js
 * @description Base class for all game scenes. Enforces a strict lifecycle 
 * and handles asset encapsulation, music playback, and garbage collection.
 */
class Scene {
    #name;
    #musicPath;
    #backgroundMusic;
    #domElements;

    /**
     * Initializes the base scene structure.
     * @param {string} name - The internal identifier for the scene.
     * @param {string|null} musicPath - The asset path for the scene's background music.
     */
    constructor(name, musicPath = null) {
        this.#name = name;
        this.#musicPath = musicPath;
        this.#backgroundMusic = null;
        this.#domElements = []; 
    }

    /**
     * Public getter for the scene's name.
     */
    get name() {
        return this.#name;
    }

    /**
     * Allows child scenes to register DOM elements (like sliders) for automatic cleanup.
     * @param {HTMLElement} element - The DOM node to track.
     */
    registerDomElement(element) {
        this.#domElements.push(element);
    }

    /**
     * Preloads asynchronous assets.
     */
    preload() {
        if (this.#musicPath) {
            try {
                this.#backgroundMusic = loadSound(this.#musicPath);
            } catch (error) {
                console.error(`[Scene: ${this.#name}] Failed to load music at ${this.#musicPath}`, error);
            }
        }
    }

    setup() {}
    draw() {}
    windowResized() {}

    /**
     * Safely initiates the background music.
     */
    playMusic() {
        if (this.#backgroundMusic && SceneManager.isAwake) {
            if (this.#backgroundMusic.isLoaded()) {
                this.#backgroundMusic.setVolume(ConfigManager.musicVolume);
                if (!this.#backgroundMusic.isPlaying()) {
                    this.#backgroundMusic.loop();
                }
            } else {
                // Si el MP3 no ha cargado, esperamos pacientemente sin romper la promesa
                let checkInterval = setInterval(() => {
                    if (this.#backgroundMusic && this.#backgroundMusic.isLoaded()) {
                        clearInterval(checkInterval);
                        this.#backgroundMusic.setVolume(ConfigManager.musicVolume);
                        if (!this.#backgroundMusic.isPlaying()) {
                            this.#backgroundMusic.loop();
                        }
                    }
                }, 100); // Comprueba cada 100ms
            }
        }
    }

    /**
     * Dynamically updates the volume of the active background track.
     * @param {number} newVolume - The normalized volume level (0.0 to 1.0).
     */
    updateVolume(newVolume) {
        if (this.#backgroundMusic && this.#backgroundMusic.isPlaying()) {
            this.#backgroundMusic.setVolume(newVolume);
        }
    }

    /**
     * Tears down the scene and destroys tracked DOM elements.
     */
    exit() {
        if (this.#backgroundMusic && this.#backgroundMusic.isPlaying()) {
            this.#backgroundMusic.stop();
        }

        this.#domElements.forEach(el => el.remove());
        this.#domElements = [];
    }

    /**
     * Safely sets or overrides the background music for the scene.
     * Resolves the strict privacy constraints of the #backgroundMusic field, 
     * allowing inherited dynamic scenes to inject loaded audio assets.
     * @param {Object} musicAsset - The loaded p5.SoundFile object.
     */
    setMusic(musicAsset) {
        if (musicAsset) {
            this.#backgroundMusic = musicAsset;
        }
    }

    get isQuitModalOpen() { return false; }

    onEscape() { return false; }
}