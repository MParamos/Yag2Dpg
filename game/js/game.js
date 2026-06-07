/**
 * @file game.js
 * @description Main orchestrator and state machine for the Yag2Dpg engine.
 * Handles scene transitions, global canvas setup, core assets, and dynamic audio.
 * @author Miguel Páramos
 */

let currentScene = 'menu';
let logoImg;
let miguelProfileAni, garnataProfileAni;
// --- NEW: Added creditsMusic variable ---
let bgMusic, creditsMusic, sfxStart, sfxHover, sfxClick;

const SceneManager = {
    isFading: false,
    state: 'IDLE', 
    alpha: 0,
    targetScene: null,
    speed: 0.05 
};

function preload() {
    try { logoImg = loadImage('assets/logos/Yag2Dpg-logo.png'); } catch(e) {}
    
    try { miguelProfileAni = loadAni('assets/characters/official/miguel/profilePicture.webp'/*, { w: 100, h: 150, frames: 4 }*/); } catch(e) {}
    try { garnataProfileAni = loadAni('assets/characters/official/garnata/profilePicture.webp'/*, { w: 100, h: 150, frames: 4 }*/); } catch(e) {}
    
    try { bgMusic = loadSound('assets/music/When I inserted the cartridge.mp3'); } catch(e) {}
    // --- NEW: Load the specific track for the credits scene ---
    try { creditsMusic = loadSound("assets/music/After a hard day's work.mp3"); } catch(e) {}
    
    try { sfxStart = loadSound('assets/sfx/startpressed.mp3'); } catch(e) {}
    try { sfxHover = loadSound('assets/sfx/buttonhover.mp3'); } catch(e) {}
    try { sfxClick = loadSound('assets/sfx/buttonpressed.mp3'); } catch(e) {}
}

function setup() {
    let container = document.getElementById('game-container');
    let canvas = createCanvas(container.clientWidth, container.clientHeight);
    canvas.parent('game-container');
    changeScene('menu', true);
}

function draw() {
    clear(); 
    let currentLang = window.activeLanguage || 'es';
    
    if (currentScene === 'menu') {
        MenuScene.draw(currentLang);
    } else if (currentScene === 'level' && typeof LevelScene !== 'undefined') {
        LevelScene.draw(currentLang);
    } else if (currentScene === 'credits') {
        CreditsScene.draw(currentLang);
    }

    if (typeof allSprites !== 'undefined') allSprites.draw();

    if (SceneManager.isFading) {
        if (SceneManager.state === 'OUT') {
            SceneManager.alpha += SceneManager.speed;
            
            if (SceneManager.alpha >= 1) {
                SceneManager.alpha = 1;
                SceneManager.state = 'IN';

                if (typeof allSprites !== 'undefined') allSprites.removeAll();
                currentScene = SceneManager.targetScene;
                
                playSceneMusic(currentScene);

                if (currentScene === 'menu' && MenuScene.setup) MenuScene.setup();
                if (currentScene === 'level' && typeof LevelScene !== 'undefined' && LevelScene.setup) LevelScene.setup();
                // --- CRITICAL FIX: Ensure Credits setup is called during fade! ---
                if (currentScene === 'credits' && CreditsScene.setup) CreditsScene.setup();
            }
        } else if (SceneManager.state === 'IN') {
            SceneManager.alpha -= SceneManager.speed;
            if (SceneManager.alpha <= 0) {
                SceneManager.alpha = 0;
                SceneManager.state = 'IDLE';
                SceneManager.isFading = false;
            }
        }

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
    if (currentScene === 'credits' && CreditsScene.windowResized) CreditsScene.windowResized();
}

function changeScene(newScene, forceInstant = false) {
    if (forceInstant) {
        if (typeof allSprites !== 'undefined') allSprites.removeAll();
        currentScene = newScene;
        playSceneMusic(currentScene);
        
        if (currentScene === 'menu' && MenuScene.setup) MenuScene.setup();
        if (currentScene === 'level' && typeof LevelScene !== 'undefined' && LevelScene.setup) LevelScene.setup();
        if (currentScene === 'credits' && CreditsScene.setup) CreditsScene.setup();
        return;
    }

    if (SceneManager.isFading) return; 
    SceneManager.isFading = true;
    SceneManager.state = 'OUT';
    SceneManager.targetScene = newScene;
}

function playSceneMusic(sceneName) {
    // Stop all tracks cleanly before routing
    if (bgMusic && bgMusic.isPlaying()) bgMusic.stop();
    if (typeof creditsMusic !== 'undefined' && creditsMusic && creditsMusic.isPlaying()) creditsMusic.stop();

    if (sceneName === 'menu') {
        if (bgMusic && window.gameHasStarted) {
            bgMusic.setVolume(window.GameConfig.musicVolume);
            bgMusic.loop();
        }
    } else if (sceneName === 'credits') {
        // --- NEW: Play exclusive credits track ---
        if (typeof creditsMusic !== 'undefined' && creditsMusic && window.gameHasStarted) {
            creditsMusic.setVolume(window.GameConfig.musicVolume);
            creditsMusic.loop();
        }
    } else if (sceneName === 'level') {
        // Leave silent
    }
}

window.gameHasStarted = false;
function awakeEngine() {
    if (window.gameHasStarted) return;
    window.gameHasStarted = true;
    if (typeof getAudioContext !== 'undefined' && getAudioContext().state !== 'running') {
        getAudioContext().resume();
    }
    playSceneMusic(currentScene);
}
document.addEventListener('pointerdown', awakeEngine, { once: true });
document.addEventListener('keydown', awakeEngine, { once: true });