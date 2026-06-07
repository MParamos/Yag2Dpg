/**
 * @file game.js
 * @description Main orchestrator and state machine for the Yag2Dpg engine.
 * Handles scene transitions with fade effects, global canvas setup, core assets,
 * and dynamic audio switching.
 * @author Miguel Páramos
 */

let currentScene = 'menu';
let logoImg;
let bgMusic, sfxStart, sfxHover, sfxClick;

/**
 * Global Transition Manager to handle cross-scene fade in/out effects.
 */
const SceneManager = {
    isFading: false,
    state: 'IDLE', // States: 'IDLE', 'OUT', 'IN'
    alpha: 0,
    targetScene: null,
    speed: 0.05 // Speed of the fade transition (1.0 = instant)
};

/**
 * Preloads all heavy assets (images, audio) before the game initializes.
 */
function preload() {
    try { logoImg = loadImage('assets/logos/Yag2Dpg-logo.png'); } catch(e) {}
    
    // Load Audio Assets
    try { bgMusic = loadSound('assets/music/When I inserted the cartridge.mp3'); } catch(e) {}
    try { sfxStart = loadSound('assets/sfx/startpressed.mp3'); } catch(e) {}
    try { sfxHover = loadSound('assets/sfx/buttonhover.mp3'); } catch(e) {}
    try { sfxClick = loadSound('assets/sfx/buttonpressed.mp3'); } catch(e) {}
}

function setup() {
    let container = document.getElementById('game-container');
    let canvas = createCanvas(container.clientWidth, container.clientHeight);
    canvas.parent('game-container');
    
    // Initial scene load (forced, no fade)
    changeScene('menu', true);
}

function draw() {
    clear(); 
    let currentLang = window.activeLanguage || 'es';
    
    // State machine: delegates rendering to the active scene
    if (currentScene === 'menu') {
        MenuScene.draw(currentLang);
    } else if (currentScene === 'level' && typeof LevelScene !== 'undefined') {
        LevelScene.draw(currentLang);
    }

    // Explicitly force q5play to draw all sprites now, 
    // so we can draw our fade overlay ON TOP of them.
    if (typeof allSprites !== 'undefined') allSprites.draw();

    // --- GLOBAL SCENE TRANSITION LOGIC ---
    if (SceneManager.isFading) {
        if (SceneManager.state === 'OUT') {
            SceneManager.alpha += SceneManager.speed;
            
            // Reached full black screen
            if (SceneManager.alpha >= 1) {
                SceneManager.alpha = 1;
                SceneManager.state = 'IN';

                // Mid-point of the fade: Perform the actual scene swap
                if (typeof allSprites !== 'undefined') allSprites.removeAll();
                currentScene = SceneManager.targetScene;
                
                // --- NEW: Switch audio track while the screen is black ---
                playSceneMusic(currentScene);

                if (currentScene === 'menu' && MenuScene.setup) MenuScene.setup();
                if (currentScene === 'level' && typeof LevelScene !== 'undefined' && LevelScene.setup) LevelScene.setup();
            }
        } else if (SceneManager.state === 'IN') {
            SceneManager.alpha -= SceneManager.speed;
            if (SceneManager.alpha <= 0) {
                SceneManager.alpha = 0;
                SceneManager.state = 'IDLE';
                SceneManager.isFading = false;
            }
        }

        // Draw the cinematic fade overlay
        push();
        drawingContext.globalAlpha = SceneManager.alpha;
        fill(0);
        noStroke();
        rectMode(CORNER);
        rect(0, 0, width, height);
        pop();
    }
}

function windowResized() {
    let container = document.getElementById('game-container');
    resizeCanvas(container.clientWidth, container.clientHeight);
    if (currentScene === 'menu' && MenuScene.windowResized) MenuScene.windowResized();
    if (currentScene === 'level' && typeof LevelScene !== 'undefined' && LevelScene.windowResized) LevelScene.windowResized();
}

/**
 * Manages screen transitions. If forced, switches instantly. Otherwise, triggers a fade.
 * @param {string} newScene - The identifier of the scene to load.
 * @param {boolean} forceInstant - If true, bypasses the fade effect.
 */
function changeScene(newScene, forceInstant = false) {
    if (forceInstant) {
        if (typeof allSprites !== 'undefined') allSprites.removeAll();
        currentScene = newScene;
        
        // Switch audio instantly if forced
        playSceneMusic(currentScene);
        
        if (currentScene === 'menu' && MenuScene.setup) MenuScene.setup();
        if (currentScene === 'level' && typeof LevelScene !== 'undefined' && LevelScene.setup) LevelScene.setup();
        return;
    }

    if (SceneManager.isFading) return; // Prevent double-triggering
    SceneManager.isFading = true;
    SceneManager.state = 'OUT';
    SceneManager.targetScene = newScene;
}

/**
 * Orchestrates background music playback depending on the active scene.
 * @param {string} sceneName - The name of the scene to play music for.
 */
function playSceneMusic(sceneName) {
    // 1. Stop any currently playing background music
    if (bgMusic && bgMusic.isPlaying()) {
        bgMusic.stop(); // .stop() resets the track to the beginning
    }

    // 2. Route the correct track for the active scene
    if (sceneName === 'menu') {
        if (bgMusic && window.gameHasStarted) {
            bgMusic.setVolume(window.GameConfig.musicVolume);
            bgMusic.loop();
        }
    } else if (sceneName === 'level') {
        // Leave silent for now, as requested.
        // Future level music can be added here.
    }
}

// Global flag and listener for Autoplay Policy bypass
window.gameHasStarted = false;

function awakeEngine() {
    if (window.gameHasStarted) return;
    window.gameHasStarted = true;
    
    if (typeof getAudioContext !== 'undefined' && getAudioContext().state !== 'running') {
        getAudioContext().resume();
    }
    
    // Start music for whatever scene is active upon first click (usually 'menu')
    playSceneMusic(currentScene);
}

document.addEventListener('pointerdown', awakeEngine, { once: true });
document.addEventListener('keydown', awakeEngine, { once: true });