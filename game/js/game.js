/**
 * @file game.js
 * @description Application entry point. Initializes the canvas and 
 * binds the core SceneManager loop to the engine.
 * @author Miguel Páramos
 */

let sceneManager;

function setup() {
    let container = document.getElementById('game-container');
    let canvas = createCanvas(container.clientWidth, container.clientHeight);
    canvas.parent('game-container');
    
    sceneManager = new SceneManager();
    sceneManager.changeScene(new MainMenuScene(), true);
}

function draw() {
    clear();
    sceneManager.draw();
}

function windowResized() {
    let container = document.getElementById('game-container');
    resizeCanvas(container.clientWidth, container.clientHeight);
    if (sceneManager) {
        sceneManager.windowResized();
    }
}

function interactionHandler() {
    // Notify the SceneManager to awake the audio engine
    SceneManager.awakeEngine();
    
    // Instruct the active scene to attempt music playback
    if (sceneManager && sceneManager.activeScene) {
        sceneManager.activeScene.playMusic();
    }
}

// Listen for initial user interaction to comply with browser audio policies
document.addEventListener('pointerdown', interactionHandler, { once: true });
document.addEventListener('keydown', interactionHandler, { once: true });