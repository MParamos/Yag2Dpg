/**
 * @file index.js
 * @description Punto de entrada principal del motor YAGCE. Exporta las clases base y utilidades.
 */

import { BaseScene } from './core/BaseScene.js';
import { MenuScene } from './core/MenuScene.js';
import { SettingsMenu } from './scenes/SettingsScene.js';
import { ConfigManager } from './core/ConfigManager.js';
import { I18n } from './core/I18n.js';
import { LevelData } from './core/LevelData.js';
import { FlowManager } from './core/FlowManager.js';

import { GameLevelScene } from './scenes/GameLevelScene.js';

import { Player } from './entities/Player.js';
import { Block } from './entities/Block.js';

import { MenuButton, BlueMenuButton, RedMenuButton, GreenMenuButton } from './ui/MenuButton.js';
import { ConfirmationModalDialog } from './ui/ConfirmationModalDialog.js';

import { promptForExternalZip } from './utils/dom.js';

// Clase principal que el juego instanciará
class YagceEngine {
    constructor(configUrl, gameScenes = []) {
        this.configUrl = configUrl;
        this.gameScenes = gameScenes;
        this.game = null;
        this.flowManager = new FlowManager(this);
    }

    async start() {
        // 0. Inicializar I18n
        await I18n.init('i18n.json');

        // 1. Cargar la configuración principal
        await this.flowManager.loadConfig(this.configUrl);

        // 1.5 Cargar escenas dinámicamente
        const dynamicScenes = [];
        if (this.flowManager.config.scenes) {
            for (const sceneName of this.flowManager.config.scenes) {
                try {
                    // Importamos el behaviour.js de la carpeta de la escena
                    const module = await import(`../../game-tester/scenes/${sceneName}/behaviour.js`);
                    // Asumimos que la clase exportada tiene el mismo nombre que la escena
                    if (module[sceneName]) {
                        dynamicScenes.push(module[sceneName]);
                    } else {
                        // O cogemos la primera clase exportada
                        const exportedClass = Object.values(module)[0];
                        if (exportedClass) dynamicScenes.push(exportedClass);
                    }
                } catch (error) {
                    console.error(`Failed to load scene ${sceneName}:`, error);
                }
            }
        }
        
        // 2. Configurar e inicializar Phaser
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
            // Añadimos la escena de nivel genérica del motor, la de opciones y las escenas específicas del juego
            scene: [ ...dynamicScenes, GameLevelScene, SettingsMenu ]
        };

        this.game = new Phaser.Game(config);
        console.log("YAGCE Engine started with config:", this.flowManager.config);
    }
}

export {
    YagceEngine,
    BaseScene,
    MenuScene,
    ConfigManager,
    I18n,
    LevelData,
    FlowManager,
    GameLevelScene,
    Player,
    Block,
    MenuButton, BlueMenuButton, RedMenuButton, GreenMenuButton,
    ConfirmationModalDialog,
    promptForExternalZip
};
