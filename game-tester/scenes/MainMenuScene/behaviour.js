import { MenuScene, ConfigManager, I18n } from '../../../engine/src/index.js';
/**
 * @file MainMenuScene.js
 * @description Main menu screen scene for Phaser.
 * Handles UI initialization via MenuScene data-driven builder, dynamic background, settings overlay, and navigation.
 * @author Miguel PÃ¡ramos
 */
export class MainMenuScene extends MenuScene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    preload() {
        this.load.audio('sfx_start', 'assets/sfx/startpressed.mp3');
        this.load.audio('sfx_hover', 'assets/sfx/buttonhover.mp3');
        this.load.audio('sfx_click', 'assets/sfx/buttonpressed.mp3');
        this.load.image('logo', 'assets/logos/YAGCE-GameTester-logo.png');
        this.load.image('console_upper', 'assets/objects/YARC-upper.png');
        this.load.image('console_lower', 'assets/objects/YARC-lower.png');
        this.load.audio('menu_music', 'assets/music/official/When I inserted the cartridge.mp3');
        
        // Load the JSON configuration
        this.load.json('main_menu_config', 'scenes/MainMenuScene/elements.json');
    }

    canOpenSettings() {
        return !this.introState && !this.introTransitioning;
    }

    create() {
        super.create();
        if (window.webController) window.webController.setFooterVisibility(true);
        
        if (!window.phaserConfigApplied) {
            this.game.sound.pauseOnBlur = ConfigManager.pauseOnBlur;
            
            this.game.events.off('hidden', this.game.loop.sleep, this.game.loop);
            this.game.events.off('visible', this.game.loop.wake, this.game.loop);
            
            window.addEventListener('blur', () => {
                if (ConfigManager.pauseOnBlur) {
                    let levelScene = this.game.scene.getScene('GameLevelScene');
                    if (levelScene && levelScene.sys.isActive() && !levelScene.scene.isPaused()) {
                        levelScene.scene.pause();
                        window.wasPausedByBlur = true;
                    }
                }
            });
            window.addEventListener('focus', () => {
                if (ConfigManager.pauseOnBlur) {
                    let levelScene = this.game.scene.getScene('GameLevelScene');
                    if (levelScene && window.wasPausedByBlur) {
                        levelScene.scene.resume();
                        window.wasPausedByBlur = false;
                    }
                }
            });

            window.phaserConfigApplied = true;
        }

        // Parse URL to see if intro is skipped
        let urlParams = new URLSearchParams(window.location.search);
        let skipIntro = urlParams.get('skipIntro') === '1';
        
        if (skipIntro) {
            let cleanUrl = new URL(window.location.href);
            cleanUrl.searchParams.delete('skipIntro');
            window.history.replaceState(null, '', cleanUrl.toString());
        }

        this.introState = !(window.yagce_hasSeenIntro || skipIntro);
        this.introTransitioning = false;

        // Build UI from JSON
        this.buildFromJSON(this.cache.json.get('main_menu_config'));

        // Proportions specific to this UI
        this.consoleSlotWidthRatio = 0.42; 

        // Initial Visibility based on intro state
        const menuSizer = this.uiElements['menuSizer'];
        const introText = this.uiElements['introText'];
        
        if (this.introState) {
            if (menuSizer) menuSizer.setVisible(false);
        } else {
            if (introText) introText.setVisible(false);
            if (!this.sound.get('menu_music') || !this.sound.get('menu_music').isPlaying) {
                this.sound.stopAll();
                this.sound.play('menu_music', { loop: true, volume: ConfigManager.musicVolume });
            }
        }

        // Setup layout y posiciones
        this.resize(this.scale);

        // --- EVENTOS DE INTRO Y MENU ---
        const handleInteraction = () => {
            if (this.introState && !this.introTransitioning) {
                this.introTransitioning = true;
                window.yagce_hasSeenIntro = true;
                
                if (this.sound && this.cache.audio.exists('sfx_start')) {
                    this.sound.play('sfx_start', { volume: ConfigManager.sfxVolume });
                }
                
                // 1) Esperamos a que termine el parpadeo rÃ¡pido del texto (1000ms)
                this.time.delayedCall(1000, () => {
                    const iText = this.uiElements['introText'];
                    if (iText) {
                        iText.destroy();
                        this.uiElements['introText'] = null;
                    }
                    
                    const logo = this.uiElements['logo'];
                    let targetLogoY = this.scale.height / 2 - 80;
                    let targetWidth = this.scale.width < 600 ? this.scale.width * 0.9 : 550;
                    let scaleFactor = logo ? targetWidth / logo.width : 1;
                    let cartridgeBottom = targetLogoY + ((logo ? logo.height : 0) * scaleFactor) / 2 - (35 * scaleFactor);
                    
                    let consoleTargetY = cartridgeBottom;

                    // 2) Bajamos cartucho
                    this.tweens.add({
                        targets: this.uiElements['logoContainer'],
                        y: targetLogoY,
                        duration: 1200,
                        ease: 'Power2'
                    });
                    
                    // 3) Subimos consola
                    this.tweens.add({
                        targets: [this.uiElements['consoleBack'], this.uiElements['consoleFront']],
                        y: consoleTargetY,
                        duration: 1200,
                        ease: 'Power2',
                        onComplete: () => {
                            this.introState = false;
                            this.introTransitioning = false;
                            
                            if (this.sound && this.cache.audio.exists('sfx_click')) {
                                this.sound.play('sfx_click', { volume: ConfigManager.sfxVolume });
                            }
                            
                            // 4) Mostramos el menÃº por encima
                            const mSizer = this.uiElements['menuSizer'];
                            if (mSizer) {
                                mSizer.setPosition(this.scale.width / 2, targetLogoY + 40);
                                mSizer.setVisible(true);
                                mSizer.setAlpha(0);
                                
                                // Asegurar depth tras mostrarse
                                mSizer.setDepth(20);
                                mSizer.getAllChildren().forEach(child => {
                                    if (child.setDepth) child.setDepth(20);
                                });
                                
                                this.tweens.add({
                                    targets: mSizer,
                                    alpha: 1,
                                    y: targetLogoY + 20, 
                                    duration: 500,
                                    ease: 'Cubic.out'
                                });
                            }

                            if (!this.sound.get('menu_music') || !this.sound.get('menu_music').isPlaying) {
                                this.sound.stopAll();
                                this.sound.play('menu_music', { loop: true, volume: ConfigManager.musicVolume });
                            }
                        }
                    });
                });
            }
        };

        this.input.on('pointerdown', () => {
            if (this.introState && !this.introTransitioning) handleInteraction();
        });

        this.input.keyboard.on('keydown', () => {
            if (this.introState && !this.introTransitioning) handleInteraction();
        });

        // Event Listeners
        this.scale.on('resize', this.resize, this);
        this.game.events.on('language-changed', this.updateTexts, this);

        this.events.once('shutdown', () => {
            this.scale.off('resize', this.resize, this);
            this.game.events.off('language-changed', this.updateTexts, this);
        });
    }

    // Actions called from JSON
    openSettings() {
        this.scene.launch('SettingsScene', { parentScene: this });
        this.scene.pause();
    }

    openCredits() {
        this.scene.start('CreditsScene');
    }

    triggerFilePicker() {
        let fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.zip';
        fileInput.style.display = 'none';
        
        fileInput.addEventListener('change', (e) => {
            let file = e.target.files[0];
            if (file) {
                this.scene.start('GameLevelScene', { zipFile: file }); 
            }
            fileInput.remove();
        });

        document.body.appendChild(fileInput);
        fileInput.click();
    }

    updateTexts() {
        if (this.uiElements['introText'] && this.uiElements['introText'].active) {
            this.uiElements['introText'].setText(I18n.getText('menu_press_start') || 'Haga click o pulse cualquier tecla para comenzar');
        }
        if (this.uiElements['subtitleText'] && this.uiElements['subtitleText'].active) {
            this.uiElements['subtitleText'].setText(I18n.getText('menu_subtitle') || 'Un juego de plataformas');
        }
        if (this.uiElements['btnLoad']) this.uiElements['btnLoad'].setText(I18n.getText('menu_button_load') || 'Cargar nivel de juego');
        if (this.uiElements['btnCredits']) this.uiElements['btnCredits'].setText(I18n.getText('menu_button_credits') || 'CrÃ©ditos');
        
        if (this.uiElements['menuSizer']) this.uiElements['menuSizer'].layout();
    }

    update(time, delta) {
        // Base update for dynamic background
        super.update(time, delta);

        if (this.introState && this.uiElements['introText']) {
            if (this.introTransitioning) {
                this.uiElements['introText'].setVisible(Math.floor(time / 50) % 2 === 0);
            } else {
                this.uiElements['introText'].setVisible(Math.floor(time / 600) % 2 === 0);
            }
        }
    }

    resize(gameSize) {
        let width = gameSize.width;
        let height = gameSize.height;
        let cx = width / 2;
        let cy = height / 2;

        if (this.bgRect) this.bgRect.setSize(width, height);
        
        const logo = this.uiElements['logo'];
        const logoGlow = this.uiElements['logoGlow'];
        const logoContainer = this.uiElements['logoContainer'];
        const consoleBack = this.uiElements['consoleBack'];
        const consoleFront = this.uiElements['consoleFront'];
        const menuSizer = this.uiElements['menuSizer'];
        const introText = this.uiElements['introText'];

        if (!logo || !consoleBack) return;

        // 1. Escalar el cartucho (logo)
        let targetWidth = width < 600 ? width * 0.9 : 550;
        let scaleFactor = targetWidth / logo.width;
        
        logo.setDisplaySize(targetWidth, logo.height * scaleFactor);
        if (logoGlow) {
            let glowWidth = targetWidth * 1.05;
            logoGlow.setDisplaySize(glowWidth, (logoGlow.height * scaleFactor) * 1.05);
        }

        // 2. Escalar la consola para que la ranura mida EXACTAMENTE el ancho del cartucho
        let requiredConsoleWidth = targetWidth / this.consoleSlotWidthRatio;
        let consoleScale = requiredConsoleWidth / consoleBack.width;
        
        consoleBack.setScale(consoleScale);
        if (consoleFront) consoleFront.setScale(consoleScale);

        // Update font sizes
        if (this.uiElements['linkText']) this.uiElements['linkText'].setFontSize(width < 600 ? '28px' : '40px');
        if (this.uiElements['subtitleText']) this.uiElements['subtitleText'].setFontSize(width < 600 ? '12px' : '15px');
        if (introText) introText.setFontSize(width < 600 ? '16px' : '24px');
        
        if (menuSizer) menuSizer.layout();

        // Position calculations
        let targetLogoY = cy - 80;
        let cartridgeBottom = targetLogoY + (logo.height * scaleFactor) / 2 - (35 * scaleFactor);
        let consoleTargetY = cartridgeBottom;
        let offScreenY = height + (consoleFront ? consoleFront.displayHeight : 0) + consoleBack.displayHeight;

        if (this.introState) {
            if (!this.introTransitioning) {
                if (logoContainer) logoContainer.setPosition(cx, cy - 120);
                if (consoleBack) consoleBack.setPosition(cx, offScreenY);
                if (consoleFront) consoleFront.setPosition(cx, offScreenY);
                if (introText) introText.setPosition(cx, cy + 150);
            }
        } else {
            if (logoContainer) logoContainer.setPosition(cx, targetLogoY);
            if (consoleBack) consoleBack.setPosition(cx, consoleTargetY);
            if (consoleFront) consoleFront.setPosition(cx, consoleTargetY);
            
            if (!this.introTransitioning) {
                if (menuSizer) menuSizer.setPosition(cx, targetLogoY + 20);
            }
        }
    }
}
