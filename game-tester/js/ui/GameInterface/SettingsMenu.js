/**
 * @file SettingsMenu.js
 * @description Universal settings overlay scene for Volume & SFX.
 * Rewritten to use RexUI for native WebGL rendering and scaling.
 * @author Miguel Páramos
 */
class SettingsMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'SettingsScene' });
    }

    create(data) {
        this.parentScene = data && data.parentScene ? data.parentScene : null;
        let isGameLevel = this.parentScene && this.parentScene.scene.key === 'GameLevelScene';

        let cx = this.scale.width / 2;
        let cy = this.scale.height / 2;

        // Dark background overlay (Phaser Native)
        this.darkOverlay = this.add.rectangle(cx, cy, this.scale.width, this.scale.height, 0x000000, 0.7);
        this.darkOverlay.setInteractive();
        this.darkOverlay.on('pointerdown', () => this.closeSettings());

        let isMobile = this.scale.width < 600;

        // Create main Sizer for the Modal
        this.mainPanel = this.rexUI.add.sizer({
            x: cx, y: cy,
            width: isMobile ? this.scale.width * 0.9 : 460,
            orientation: 'y',
            space: { left: 20, right: 20, top: 30, bottom: 30, item: 25 }
        })
        .addBackground(
            this.rexUI.add.roundRectangle(0, 0, 100, 100, 15, 0x0f172a).setStrokeStyle(2, 0x0ea5e9)
        );

        // Prevent clicks on the panel from closing the settings
        this.mainPanel.setInteractive()
            .on('pointerdown', (pointer, localX, localY, event) => {
                event.stopPropagation();
            });

        // Title
        this.titleLabel = this.rexUI.add.label({
            text: this.add.text(0, 0, I18n.getText('options_title') || 'Opciones', { fontFamily: 'sans-serif', fontSize: '28px', color: '#ffffff', fontStyle: 'bold' }),
            align: 'center'
        });
        this.mainPanel.add(this.titleLabel, { expand: false, align: 'center' });

        // Content Sizer (for sliders and toggles)
        this.contentSizer = this.rexUI.add.sizer({
            orientation: 'y',
            space: { item: 20 }
        });
        this.mainPanel.add(this.contentSizer, { expand: true });

        // --- Music Volume ---
        this.musicValueText = this.add.text(0, 0, `${Math.round(ConfigManager.musicVolume * 100)}%`, { fontFamily: 'sans-serif', fontSize: '18px', color: '#38bdf8' });
        this.musicSlider = this.createSliderSizer(
            I18n.getText('options_music_vol') || 'Música',
            ConfigManager.musicVolume,
            this.musicValueText,
            (value) => {
                ConfigManager.musicVolume = value;
                this.updatePhaserSound('music', value);
                this.musicValueText.setText(`${Math.round(value * 100)}%`);
            }
        );
        this.contentSizer.add(this.musicSlider, { expand: true });

        // --- SFX Volume ---
        this.sfxValueText = this.add.text(0, 0, `${Math.round(ConfigManager.sfxVolume * 100)}%`, { fontFamily: 'sans-serif', fontSize: '18px', color: '#38bdf8' });
        this.sfxSlider = this.createSliderSizer(
            I18n.getText('options_sfx_vol') || 'SFX',
            ConfigManager.sfxVolume,
            this.sfxValueText,
            (value) => {
                ConfigManager.sfxVolume = value;
                this.updatePhaserSound('sfx', value);
                this.sfxValueText.setText(`${Math.round(value * 100)}%`);
            },
            () => {
                 if (this.sound.get('sfx_hover')) this.sound.play('sfx_hover', { volume: ConfigManager.sfxVolume });
            }
        );
        this.contentSizer.add(this.sfxSlider, { expand: true });

        // --- Pause Blur Checkbox ---
        this.pauseCheckLabel = this.createCheckbox(
            I18n.getText('options_pause_blur') || 'Pausar al perder foco',
            ConfigManager.pauseOnBlur,
            (isChecked) => {
                ConfigManager.pauseOnBlur = isChecked;
                this.sound.pauseOnBlur = isChecked;
            }
        );
        this.contentSizer.add(this.pauseCheckLabel, { expand: false, align: 'center' });

        // --- Main Menu Button (Optional) ---
        if (isGameLevel) {
            this.btnMainMenu = new RedMenuButton(
                this, 0, 0, 220, 40,
                I18n.getText('settings_main_menu') || 'Menú Principal',
                () => {
                    this.closeSettings();
                    this.parentScene.scene.stop();
                    this.scene.start('MainMenuScene');
                }
            );
            this.contentSizer.add(this.btnMainMenu, { expand: false, align: 'center', padding: { top: 15 } });
        }

        // --- Close Note ---
        this.closeNote = this.rexUI.add.label({
            text: this.add.text(0, 0, I18n.getText('options_close') || 'Haz clic fuera para cerrar', { fontFamily: 'sans-serif', fontSize: '12px', color: '#94a3b8' }),
            align: 'center'
        });
        this.mainPanel.add(this.closeNote, { expand: false, align: 'center', padding: { top: 10 } });

        this.mainPanel.layout();

        // Escuchar escape o enter globales
        this.input.keyboard.on('keydown-ESC', () => this.closeSettings());
        this.input.keyboard.on('keydown-ENTER', () => this.closeSettings());

        this.scale.on('resize', this.resize, this);
        this.game.events.on('language-changed', this.updateTexts, this);

        this.events.once('shutdown', () => {
            this.scale.off('resize', this.resize, this);
            this.game.events.off('language-changed', this.updateTexts, this);
        });
    }

    createSliderSizer(labelText, initValue, valueTextObj, onChange, onInputEnd) {
        let labelObj = this.add.text(0, 0, labelText, { fontFamily: 'sans-serif', fontSize: '18px', color: '#ffffff' });
        labelObj.setFixedSize(80, 0);

        let slider = this.rexUI.add.slider({
            width: 150,
            height: 20,
            orientation: 'x',
            value: initValue,
            track: this.rexUI.add.roundRectangle(0, 0, 0, 8, 4, 0x1e293b),
            indicator: this.rexUI.add.roundRectangle(0, 0, 0, 8, 4, 0x0ea5e9),
            thumb: this.rexUI.add.roundRectangle(0, 0, 16, 16, 8, 0xffffff),
            valuechangeCallback: onChange
        });
        
        valueTextObj.setFixedSize(50, 0);
        valueTextObj.setAlign('right');

        let sizer = this.rexUI.add.sizer({
            orientation: 'x',
            space: { item: 15 }
        });
        sizer.add(labelObj, { expand: false });
        sizer.add(slider, { expand: true });
        sizer.add(valueTextObj, { expand: false });

        slider.on('pointerup', () => { 
            slider.emit('inputend'); 
            if (onInputEnd) onInputEnd();
        });

        return sizer;
    }

    createCheckbox(labelText, initChecked, onChange) {
        let isChecked = initChecked;
        
        let checkboxRect = this.rexUI.add.roundRectangle(0, 0, 20, 20, 4, isChecked ? 0x0ea5e9 : 0x1e293b).setStrokeStyle(2, 0x38bdf8);
        
        let label = this.rexUI.add.label({
            orientation: 'x',
            icon: checkboxRect,
            text: this.add.text(0, 0, labelText, { fontFamily: 'sans-serif', fontSize: '18px', color: '#ffffff' }),
            space: { icon: 10 }
        });

        label.setInteractive({ useHandCursor: true })
             .on('pointerdown', () => {
                 isChecked = !isChecked;
                 checkboxRect.setFillStyle(isChecked ? 0x0ea5e9 : 0x1e293b);
                 onChange(isChecked);
             });

        return label;
    }



    updatePhaserSound(type, volume) {
        if (this.sound.sounds) {
            this.sound.sounds.forEach(snd => {
                if (snd.key && snd.key.includes(type) && snd.isPlaying) {
                    snd.setVolume(volume);
                }
            });
        }
    }

    updateTexts() {
        this.titleLabel.getElement('text').setText(I18n.getText('options_title') || 'Opciones');
        this.musicSlider.children[0].setText(I18n.getText('options_music_vol') || 'Música');
        this.sfxSlider.children[0].setText(I18n.getText('options_sfx_vol') || 'SFX');
        this.pauseCheckLabel.getElement('text').setText(I18n.getText('options_pause_blur') || 'Pausar al perder foco');
        if (this.btnMainMenu) this.btnMainMenu.setText(I18n.getText('settings_main_menu') || 'Menú Principal');
        this.closeNote.getElement('text').setText(I18n.getText('options_close') || 'Haz clic fuera para cerrar');
        
        this.mainPanel.layout();
    }

    resize(gameSize) {
        let cx = gameSize.width / 2;
        let cy = gameSize.height / 2;
        let isMobile = gameSize.width < 600;

        this.darkOverlay.setSize(gameSize.width, gameSize.height);
        this.darkOverlay.setPosition(cx, cy);

        this.mainPanel.setPosition(cx, cy);
        this.mainPanel.setMinWidth(isMobile ? gameSize.width * 0.9 : 460);
        this.mainPanel.layout();
    }

    closeSettings() {
        if (this.parentScene) {
            this.parentScene.scene.resume();
        }
        this.scene.stop();
    }
}
