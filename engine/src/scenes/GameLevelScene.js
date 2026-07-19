import { MenuButton, ConfirmationModalDialog } from '../index.js';
import { BaseScene } from '../core/BaseScene.js';
import { LevelData } from '../core/LevelData.js';
import { Player } from '../entities/Player.js';
import { Block } from '../entities/Block.js';
/**
 * @file GameLevelScene.js
 * @description Core gameplay scene for Phaser. Parses the ZIP level package and renders 
 * the map matrix, player, blocks, and handles game states (pause/quit).
 * @author Miguel Páramos
 */
export class GameLevelScene extends BaseScene {
    constructor() {
        super({ key: 'GameLevelScene' });
    }

    /**
     * Initializes the scene with required data.
     * @param {Object} data - The data payload passed from the previous scene.
     * @param {File} [data.zipFile] - The zipped level file.
     * @param {LevelData} [data.levelData] - Pre-parsed level data, used during restarts.
     * @param {string} [data.bgKey] - Cache key for the background image.
     * @param {string} [data.musicKey] - Cache key for the background music.
     */
    init(data) {
        this.zipFile = data ? data.zipFile : null;
        this.levelData = data ? data.levelData : null;
        this.bgKey = data ? data.bgKey : null;
        this.musicKey = data ? data.musicKey : null;
        
        this.isQuitModalOpen = false;
        this.isRestartModalOpen = false;
    }

    /**
     * Determines whether the settings menu can be opened.
     * @returns {boolean} True if no modal dialogues are currently active.
     */
    canOpenSettings() {
        return !this.isQuitModalOpen && !this.isRestartModalOpen;
    }

    /**
     * Lifecycle method: Called when the scene is created.
     * Initializes the loading screen and triggers world construction or asset loading.
     */
    async create() {
        super.create();
        if (window.webController) window.webController.setFooterVisibility(false);
        // --- Setup Loading Screen ---
        let cx = this.scale.width / 2;
        let cy = this.scale.height / 2;

        this.loadingText = this.add.text(cx, cy, "Extracting Matrix Architecture...", {
            fontFamily: 'sans-serif',
            fontSize: '24px',
            color: '#38bdf8',
            align: 'center'
        }).setOrigin(0.5);

        if (!this.zipFile) {
            this.showError("No file provided. System halted.");
            return;
        }

        // Ensure footer is visible but floats over the game without taking layout space
        if (window.webController) window.webController.setFooterVisibility(true);
        let appFooter = document.getElementById('app-footer');
        if (appFooter) {
            // Ensure smooth transition for sliding
            appFooter.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            appFooter.style.transform = 'translateY(0)';

            // Inject a toggle button if it doesn't exist
            if (!document.getElementById('scene-footer-toggle')) {
                let toggleBtn = document.createElement('button');
                toggleBtn.id = 'scene-footer-toggle';
                toggleBtn.innerHTML = '▼';
                toggleBtn.style.position = 'absolute';
                toggleBtn.style.top = '-24px';
                toggleBtn.style.right = '20px';
                toggleBtn.style.width = '40px';
                toggleBtn.style.height = '24px';
                toggleBtn.style.backgroundColor = '#0f172a'; // slate-900
                toggleBtn.style.color = '#38bdf8'; // sky-400
                toggleBtn.style.border = '1px solid #1e293b'; // slate-800
                toggleBtn.style.borderBottom = 'none';
                toggleBtn.style.borderTopLeftRadius = '8px';
                toggleBtn.style.borderTopRightRadius = '8px';
                toggleBtn.style.cursor = 'pointer';
                toggleBtn.style.display = 'flex';
                toggleBtn.style.alignItems = 'center';
                toggleBtn.style.justifyContent = 'center';
                toggleBtn.style.fontSize = '10px';
                toggleBtn.style.outline = 'none';
                
                let isFooterOpen = true;
                toggleBtn.onclick = () => {
                    isFooterOpen = !isFooterOpen;
                    if (isFooterOpen) {
                        appFooter.style.transform = 'translateY(0)';
                        toggleBtn.innerHTML = '▼';
                    } else {
                        appFooter.style.transform = 'translateY(100%)';
                        toggleBtn.innerHTML = '▲';
                    }
                };

                appFooter.appendChild(toggleBtn);
            }
        }

        try {
            if (this.levelData) {
                // If levelData is preserved from a restart, skip extraction to prevent memory leaks and speed up load
                if (this.loadingText) this.loadingText.destroy();
                this.buildWorld();
            } else {
                // Load and parse LevelData asynchronously
                this.levelData = await LevelData.fromZip(this.zipFile);
                this.loadDynamicAssets();
            }
        } catch (err) {
            this.showError(err.message);
        }
    }

    /**
     * Displays a critical error message on the loading screen.
     * @param {string} msg - The error message to display.
     */
    showError(msg) {
        if (this.loadingText) {
            this.loadingText.setText("ERROR:\n" + msg).setColor('#ef4444');
            // Wraps long error texts
            this.loadingText.setWordWrapWidth(this.scale.width * 0.8);
        }
    }

    /**
     * Dynamically loads assets (images, audio) specified in the parsed LevelData.
     */
    loadDynamicAssets() {
        let hasAssets = false;
        
        // Use a unique key for this level to avoid cache collisions across reloads
        this.bgKey = 'bg_' + Date.now();
        this.musicKey = 'music_' + Date.now();

        if (this.levelData.bgImageUrl) {
            this.load.image(this.bgKey, this.levelData.bgImageUrl);
            hasAssets = true;
        }
        if (this.levelData.bgMusicUrl) {
            this.load.audio(this.musicKey, this.levelData.bgMusicUrl);
            hasAssets = true;
        }

        if (hasAssets) {
            this.load.once('complete', this.buildWorld, this);
            this.load.start();
        } else {
            this.buildWorld();
        }
    }

    /**
     * Constructs the physical world, populating blocks, the player, and configuring cameras.
     */
    buildWorld() {
        if (this.loadingText) this.loadingText.destroy();

        // 1. Background Color
        this.cameras.main.setBackgroundColor(this.levelData.bgColor || '#000000');

        // 2. Parallax Background Image
        // (Deferred after map dimensions are computed so we can scale it exactly)
        
        // 3. Music
        if (this.levelData.bgMusicUrl && this.cache.audio.exists(this.musicKey)) {
            this.sound.stopAll();
            this.sound.play(this.musicKey, { loop: true, volume: ConfigManager.musicVolume });
        }

        // 4. Physics Groups for Matrix Architecture
        this.blocksGroup = this.physics.add.staticGroup();
        this.allLevelElements = []; // Track all elements to hide them from the UI camera

        let ts = this.levelData.tileSize;
        let layers = this.levelData.mapLayers;
        let mapCols = 0;
        let mapRows = 0;

        if (Array.isArray(layers) && layers.length > 0) {
            for (let l = 0; l < layers.length; l++) {
                let isMiddle = (l === 1); // Layer 1 is where collisions happen
                let matrix = layers[l];

                if (!Array.isArray(matrix)) continue;

                mapRows = Math.max(mapRows, matrix.length);

                for (let r = 0; r < matrix.length; r++) {
                    if (!Array.isArray(matrix[r])) continue;

                    mapCols = Math.max(mapCols, matrix[r].length);

                    for (let c = 0; c < matrix[r].length; c++) {
                        let tileId = matrix[r][c];
                        if (tileId > 0) {
                            let cx = c * ts + ts / 2;
                            let cy = r * ts + ts / 2;

                            let block = new Block(this, cx, cy, ts, tileId, isMiddle);
                            block.setDepth(l); // Maintain visual z-index layering
                            this.allLevelElements.push(block);

                            if (isMiddle) {
                                this.blocksGroup.add(block);
                            }
                        }
                    }
                }
            }
        }

        this.mapCols = mapCols;
        this.mapRows = mapRows;

        // Configure world boundaries
        let mapPxWidth = mapCols * ts;
        let mapPxHeight = Math.max(mapRows * ts, this.scale.height);
        this.physics.world.setBounds(0, 0, mapPxWidth, mapPxHeight);
        // Ensure gravity is enabled
        this.physics.world.gravity.y = 800; 

        // 4.5. Create Background
        if (this.levelData.bgImageUrl && this.textures.exists(this.bgKey)) {
            let rawOpacity = this.levelData.bgOpacity !== undefined ? this.levelData.bgOpacity : 100;
            let alpha = rawOpacity > 1 ? rawOpacity / 100 : rawOpacity;

            let scrollFactorX = 0.2;
            let scrollFactorY = 0.2;

            let zoom = 2.5;
            let cx = this.cameras.main.width / 2;
            let cy = this.cameras.main.height / 2;
            
            // Compensate for the offset caused by the camera's centered zoom
            let offsetX = cx * (1 - 1/zoom) * (1 - scrollFactorX);
            let offsetY = cy * (1 - 1/zoom) * (1 - scrollFactorY);

            this.bgImage = this.add.image(offsetX, offsetY, this.bgKey).setOrigin(0, 0);
            this.bgImage.setAlpha(alpha);
            this.bgImage.setDepth(-100);
            this.bgImage.setScrollFactor(scrollFactorX, scrollFactorY);

            let viewW = this.cameras.main.width / zoom;
            let viewH = this.cameras.main.height / zoom;
            
            let maxScrollX = Math.max(0, mapPxWidth - viewW);
            let maxScrollY = Math.max(0, mapPxHeight - viewH);

            // Scale the background to exactly cover the parallax margins, ignoring aspect ratio
            let targetW = viewW + maxScrollX * scrollFactorX;
            let targetH = viewH + maxScrollY * scrollFactorY;

            this.bgImage.setDisplaySize(targetW, targetH);
            
            // Register it to hide from the UI camera
            this.allLevelElements.push(this.bgImage);
        }

        // 5. Instantiate Player
        let startX = this.scale.width / 2;
        let startY = 0;

        if (this.levelData.spawnPoints && this.levelData.spawnPoints.length > 0) {
            let sp = this.levelData.spawnPoints[0];
            startX = (sp.c !== undefined ? sp.c : 0) * ts + ts / 2;
            startY = (sp.r !== undefined ? sp.r : 0) * ts + ts / 2;
        }

        this.player = new Player(this, startX, startY);
        this.player.setDepth(1); 
        this.allLevelElements.push(this.player);
        
        // Enable collisions
        this.physics.add.collider(this.player, this.blocksGroup);

        // 6. World Camera
        this.cameras.main.setBounds(0, 0, mapPxWidth, mapPxHeight);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(2.5); // Zoom to emulate Phaser 4 look and feel

        // 7. UI Camera
        this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height);
        
        // Ignore all world elements (INCLUDING the background) in the UI camera to prevent a "minimap" effect
        this.uiCamera.ignore(this.allLevelElements);

        // 8. User Interface
        this.initUI();
    }

    /**
     * Initializes the user interface elements and input handlers.
     */
    initUI() {
        // Main UI container to easily ignore it in the world camera
        this.uiContainer = this.add.container(0, 0);

        this.btnSettings = new MenuButton(this, this.scale.width - 40, 40, 50, 50, "⚙️", () => {
            this.scene.launch('SettingsScene', { parentScene: this });
            this.scene.pause();
        });
        this.btnSettings.setScrollFactor(0);

        this.btnRestart = new MenuButton(this, this.scale.width - 100, 40, 50, 50, "🔄", () => {
            this.toggleRestartModal();
        });
        this.btnRestart.setScrollFactor(0);

        // Dialog Modals
        this.modalQuit = new ConfirmationModalDialog(this, {
            title: I18n.getText('quit_title') || 'Do you want to exit to menu?',
            leftText: I18n.getText('quit_yes') || 'Yes',
            rightText: I18n.getText('quit_no') || 'No',
            leftAction: () => { this.scene.start('MainMenuScene'); },
            rightAction: () => { this.toggleQuitModal(); },
            borderColor: '#ef4444'
        });
        this.modalQuit.setScrollFactor(0);
        this.modalQuit.setVisible(false);
        this.modalQuit.setActive(false);

        this.modalRestart = new ConfirmationModalDialog(this, {
            title: I18n.getText('restart_title') || 'Do you want to restart the level?',
            leftText: I18n.getText('restart_yes') || 'Yes',
            rightText: I18n.getText('quit_no') || 'No',
            leftAction: () => { this.scene.start('GameLevelScene', { zipFile: this.zipFile }); },
            rightAction: () => { this.toggleRestartModal(); },
            borderColor: '#ef4444'
        });
        this.modalRestart.setScrollFactor(0);
        this.modalRestart.setVisible(false);
        this.modalRestart.setActive(false);

        this.uiContainer.add([this.btnSettings, this.btnRestart, this.modalQuit, this.modalRestart]);
        
        // Ignore the UI in the world camera
        this.cameras.main.ignore(this.uiContainer);

        // ESC / Hotkeys handler
        this.input.keyboard.on('keydown-ESC', () => {
            if (!this.isRestartModalOpen && !this.isQuitModalOpen) {
                this.toggleQuitModal();
            }
        });

        this.input.keyboard.on('keydown-R', () => {
            if (!this.isQuitModalOpen && !this.isRestartModalOpen) {
                this.toggleRestartModal();
            }
        });


        // Resize
        this.scale.on('resize', this.resize, this);

        // Handle Language Change
        this.game.events.on('language-changed', this.updateTexts, this);

        // Auto-hide footer after 1.5 seconds of the game being ready
        this.time.delayedCall(1500, () => {
            let toggleBtn = document.getElementById('scene-footer-toggle');
            // Only hide if it's currently open
            if (toggleBtn && toggleBtn.innerHTML === '▼') {
                toggleBtn.click();
            }
        });

        this.events.once('shutdown', () => {
            this.scale.off('resize', this.resize, this);
            this.game.events.off('language-changed', this.updateTexts, this);

            // Restore footer layout
            let appFooter = document.getElementById('app-footer');
            if (appFooter) {
                appFooter.style.transition = '';
                appFooter.style.transform = '';

                let btn = document.getElementById('scene-footer-toggle');
                if (btn) btn.remove();
            }
        });
    }

    /**
     * Updates UI text based on the active language.
     */
    updateTexts() {
        if (this.modalQuit) {
            this.modalQuit.updateTexts(
                I18n.getText('quit_title') || 'Do you want to exit to menu?',
                I18n.getText('quit_yes') || 'Yes',
                I18n.getText('quit_no') || 'No'
            );
        }
        if (this.modalRestart) {
            this.modalRestart.updateTexts(
                I18n.getText('restart_title') || 'Do you want to restart the level?',
                I18n.getText('restart_yes') || 'Yes',
                I18n.getText('quit_no') || 'No'
            );
        }
    }

    /**
     * Lifecycle method: Called every frame to update game logic.
     * @param {number} time - The current time.
     * @param {number} delta - The delta time in ms since the last frame.
     */
    update(time, delta) {
        if (this.player && !this.isQuitModalOpen && !this.isRestartModalOpen) {
            this.player.update(time, delta);
            
            // If the player falls into the void, restart the level preserving the data
            if (this.player.y > this.physics.world.bounds.height + 200) {
                this.scene.restart({ zipFile: this.zipFile, levelData: this.levelData, bgKey: this.bgKey, musicKey: this.musicKey });
            }
        }
        
        // Native parallax (scrollFactor) automatically manages the movement of this.bgImage
    }

    /**
     * Toggles the visibility of the quit confirmation modal.
     */
    toggleQuitModal() {
        if (this.isRestartModalOpen) this.toggleRestartModal();
        this.isQuitModalOpen = !this.isQuitModalOpen;
        this.modalQuit.setVisible(this.isQuitModalOpen);
        this.modalQuit.setActive(this.isQuitModalOpen);
        
        if (this.isQuitModalOpen) this.physics.pause();
        else this.physics.resume();
    }

    /**
     * Toggles the visibility of the restart confirmation modal.
     */
    toggleRestartModal() {
        if (this.isQuitModalOpen) this.toggleQuitModal();
        this.isRestartModalOpen = !this.isRestartModalOpen;
        this.modalRestart.setVisible(this.isRestartModalOpen);
        this.modalRestart.setActive(this.isRestartModalOpen);

        if (this.isRestartModalOpen) this.physics.pause();
        else this.physics.resume();
    }

    /**
     * Adjusts the camera sizes and UI elements upon window resize.
     * @param {Object} gameSize - Object containing the new dimensions (width, height).
     */
    resize(gameSize) {
        let width = gameSize.width;
        let height = gameSize.height;

        if (this.uiCamera) {
            this.uiCamera.setSize(width, height);
        }
        
        // Ensure bounds are updated if the window resizes
        if (this.levelData) {
            let ts = this.levelData.tileSize;
            let mapPxWidth = (this.mapCols || 0) * ts || width;
            let mapPxHeight = Math.max(((this.mapRows || 0) * ts) || height, height);
            
            if (this.physics && this.physics.world) {
                this.physics.world.setBounds(0, 0, mapPxWidth, mapPxHeight);
            }
            if (this.cameras && this.cameras.main) {
                this.cameras.main.setBounds(0, 0, mapPxWidth, mapPxHeight);
            }
        }

        if (this.bgImage) {
            let zoom = 2.5;
            let cx = width / 2;
            let cy = height / 2;
            
            let offsetX = cx * (1 - 1/zoom) * (1 - this.bgImage.scrollFactorX);
            let offsetY = cy * (1 - 1/zoom) * (1 - this.bgImage.scrollFactorY);
            this.bgImage.setPosition(offsetX, offsetY);

            let viewW = width / zoom;
            let viewH = height / zoom;
            
            let maxScrollX = Math.max(0, this.physics.world.bounds.width - viewW);
            let maxScrollY = Math.max(0, this.physics.world.bounds.height - viewH);

            let targetW = viewW + maxScrollX * this.bgImage.scrollFactorX;
            let targetH = viewH + maxScrollY * this.bgImage.scrollFactorY;

            this.bgImage.setDisplaySize(targetW, targetH);
        }

        if (this.btnSettings) this.btnSettings.setPosition(width - 40, 40);
        if (this.btnRestart) this.btnRestart.setPosition(width - 100, 40);
        
        if (this.modalQuit) this.modalQuit.resize(gameSize);
        if (this.modalRestart) this.modalRestart.resize(gameSize);
    }
}


