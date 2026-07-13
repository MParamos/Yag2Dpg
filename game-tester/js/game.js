/**
 * @file game.js
 * @description Application entry point. Initializes the Phaser Game instance.
 * @author Miguel Páramos
 */

let game;

window.onload = () => {
    const config = {
        type: Phaser.AUTO,
        parent: 'game-container',
        scale: {
            mode: Phaser.Scale.RESIZE,
            width: '100%',
            height: '100%'
        },
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        },
        dom: {
            createContainer: true
        },
        pixelArt: true,
        roundPixels: true,
        plugins: {
            scene: [{
                key: 'rexUI',
                plugin: rexuiplugin,
                mapping: 'rexUI'
            }]
        },
        backgroundColor: '#0f172a',
        scene: [ MainMenuScene, CreditsScene, GameLevelScene, SettingsMenu ]
    };

    game = new Phaser.Game(config);
    window.game = game;
};