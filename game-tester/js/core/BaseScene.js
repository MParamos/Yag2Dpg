/**
 * @file BaseScene.js
 * @description Base scene for all Yagce scenes to provide universal functionality, 
 * like global hotkeys.
 */
class BaseScene extends Phaser.Scene {
    constructor(config) {
        super(config);
    }

    create() {
        // Global listener for SettingsMenu
        this.input.keyboard.on('keydown-ENTER', () => {
            this.openSettingsMenu();
        });
    }

    openSettingsMenu() {
        // Do not open if we are already in SettingsScene
        if (this.scene.key === 'SettingsScene') return;

        // Subclasses can implement `canOpenSettings()` to block this (e.g. if a modal is open)
        if (typeof this.canOpenSettings === 'function' && !this.canOpenSettings()) {
            return;
        }

        if (!this.scene.isActive('SettingsScene')) {
            this.scene.launch('SettingsScene', { parentScene: this });
            this.scene.pause();
        }
    }
}
