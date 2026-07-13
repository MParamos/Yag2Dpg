/**
 * @file CreditsScene.js
 * @description Credits screen scene for Phaser. Displays developer, AI, music, and SFX attribution.
 * Fully encapsulated and OOP compliant using Phaser GameObjects and RexUI Sizers.
 */
class CreditsScene extends BaseScene {
    constructor() {
        super({ key: 'CreditsScene' });
    }

    preload() {
        this.load.image('miguel_profile', 'assets/characters/official/miguel/profilePicture.webp');
        this.load.image('garnata_profile', 'assets/characters/official/garnata/profilePicture.webp');
        this.load.audio('credits_music', "assets/music/official/After a hard day's work.mp3");
    }

    create() {
        super.create();
        if (window.webController) window.webController.setFooterVisibility(true);

        let cx = this.scale.width / 2;
        let cy = this.scale.height / 2;
        let isMobile = this.scale.width < 600;

        // Dynamic background placeholder (updated in update())
        this.bgRect = this.add.rectangle(0, 0, this.scale.width, this.scale.height).setOrigin(0);

        // Music
        if (!this.sound.get('credits_music') || !this.sound.get('credits_music').isPlaying) {
            this.sound.stopAll();
            this.sound.play('credits_music', { loop: true, volume: ConfigManager.musicVolume });
        }

        // --- REXUI MASTER SIZER ---
        this.mainSizer = this.rexUI.add.sizer({
            x: cx, y: cy,
            orientation: 'y',
            space: { item: 15 }
        });

        // Title
        this.titleText = this.add.text(0, 0, (I18n.getText('menu_button_credits') || 'CRÉDITOS').toUpperCase(), {
            fontFamily: 'sans-serif',
            fontSize: isMobile ? '24px' : '36px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.mainSizer.add(this.titleText, { align: 'center', padding: { bottom: 10 } });

        // Profiles
        this.profilesSizer = this.rexUI.add.sizer({ orientation: isMobile ? 'y' : 'x', space: { item: isMobile ? 30 : 100 } });
        
        const createProfile = (imgKey, name, role) => {
            let sizer = this.rexUI.add.sizer({ orientation: 'y', space: { item: 5 } });
            let img = this.add.image(0, 0, imgKey);
            let nameTxt = this.add.text(0, 0, name, { fontFamily: 'sans-serif', color: '#38bdf8' });
            let roleTxt = this.add.text(0, 0, role, { fontFamily: 'sans-serif', color: '#94a3b8' });
            sizer.add(img, { align: 'center' });
            sizer.add(nameTxt, { align: 'center', padding: { top: 10 } });
            sizer.add(roleTxt, { align: 'center' });
            return { sizer, img, nameTxt, roleTxt };
        };

        this.miguelProfile = createProfile('miguel_profile', "Miguel Páramos", I18n.getText('credits_role_dev') || 'Developer');
        this.garnataProfile = createProfile('garnata_profile', "Garnata", I18n.getText('credits_role_ai') || 'AI Assistant');

        this.profilesSizer.add(this.miguelProfile.sizer, { expand: false });
        this.profilesSizer.add(this.garnataProfile.sizer, { expand: false });

        this.mainSizer.add(this.profilesSizer, { align: 'center', padding: { bottom: 15 } });

        // RexUI ScrollablePanel for Attributions
        this.creditsPanel = this.rexUI.add.scrollablePanel({
            scrollMode: 0, // vertical
            panel: {
                child: this.rexUI.add.BBCodeText(0, 0, '', {
                    fontFamily: 'sans-serif',
                    fontSize: isMobile ? '12px' : '14px',
                    color: '#94a3b8',
                    align: 'center',
                    wrap: { mode: 'word', width: (isMobile ? this.scale.width * 0.8 : 550) }
                }),
                mask: { padding: 1 }
            },
            slider: {
                track: this.rexUI.add.roundRectangle(0, 0, 10, 10, 5, 0x1e293b),
                thumb: this.rexUI.add.roundRectangle(0, 0, 10, 10, 5, 0x0ea5e9)
            },
            mouseWheelScroller: { focus: false, speed: 1 }
        });

        // Handle URL clicks in BBCodeText
        this.creditsPanel.getElement('panel').setInteractive().on('linkclick', function(link) {
            window.open(link, '_blank');
        });

        // Proportion: 1 makes the scrollablePanel expand to fill remaining vertical space in mainSizer
        this.mainSizer.add(this.creditsPanel, { proportion: 1, expand: true, padding: { bottom: 15 } });

        // Back Button
        this.btnBack = new RedMenuButton(this, 0, 0, 200, 50, I18n.getText('credits_back') || 'Volver', () => {
            this.scene.start('MainMenuScene');
        });

        this.mainSizer.add(this.btnBack, { align: 'center' });

        // ESC handler
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('MainMenuScene');
        });

        // Handle Resize
        this.scale.on('resize', this.resize, this);

        // Handle Language Change
        this.game.events.on('language-changed', this.updateTexts, this);

        this.events.once('shutdown', () => {
            this.scale.off('resize', this.resize, this);
            this.game.events.off('language-changed', this.updateTexts, this);
        });

        this.resize(this.scale);
        this.updateTexts();
    }

    updateTexts() {
        if (this.titleText) this.titleText.setText((I18n.getText('menu_button_credits') || 'CRÉDITOS').toUpperCase());
        if (this.miguelProfile) this.miguelProfile.roleTxt.setText(I18n.getText('credits_role_dev') || 'Developer');
        if (this.garnataProfile) this.garnataProfile.roleTxt.setText(I18n.getText('credits_role_ai') || 'AI Assistant');
        if (this.btnBack) this.btnBack.setText(I18n.getText('credits_back') || 'Volver');

        let isMobile = this.scale.width < 600;
        
        let textObj = this.creditsPanel.getElement('panel');
        if (textObj) {
            textObj.setFontSize(isMobile ? '12px' : '14px');
            textObj.setWrapWidth(isMobile ? this.scale.width * 0.8 : 550);

            let s = `[b][color=white]${(I18n.getText('credits_libs') || 'Motor y Librerías').toUpperCase()}[/color][/b]
[url=https://phaser.io][color=#38bdf8]Phaser 4[/color][/url] ([url=https://opensource.org/licenses/MIT][color=#38bdf8]MIT[/color][/url])
[url=https://stuk.github.io/jszip/][color=#38bdf8]JSZip[/color][/url] ([url=https://opensource.org/licenses/MIT][color=#38bdf8]MIT[/color][/url])
[url=https://rexrainbow.github.io/phaser3-rex-notes/docs/site/ui-overview/][color=#38bdf8]RexUI[/color][/url] ([url=https://opensource.org/licenses/MIT][color=#38bdf8]MIT[/color][/url])
[url=https://tailwindcss.com/][color=#38bdf8]Tailwind CSS[/color][/url] ([url=https://opensource.org/licenses/MIT][color=#38bdf8]MIT[/color][/url])

[b][color=white]${(I18n.getText('credits_music') || 'Música').toUpperCase()}[/color][/b]
"When I inserted the cartridge" - [url=https://suno.com][color=#38bdf8]Suno[/color][/url]
([url=https://suno.com/terms][color=#38bdf8]Commercial License[/color][/url])
"After a hard day's work" - [url=https://suno.com][color=#38bdf8]Suno[/color][/url]
([url=https://suno.com/terms][color=#38bdf8]Commercial License[/color][/url])

[b][color=white]${(I18n.getText('credits_sfx') || 'Efectos de Sonido').toUpperCase()}[/color][/b]
[url=https://pixabay.com/users/universfield-28281460/][color=#38bdf8]Universfield (Pixabay)[/color][/url] - Button Selected SFX ([url=https://pixabay.com/service/license-summary/][color=#38bdf8]Pixabay License[/color][/url])
[url=https://freesound.org/people/plasterbrain/][color=#38bdf8]plasterbrain (Freesound)[/color][/url] - Game Start SFX ([url=https://creativecommons.org/publicdomain/zero/1.0/][color=#38bdf8]CC0[/color][/url])
[url=https://pixabay.com/users/floraphonic-38928062/][color=#38bdf8]floraphonic (Pixabay)[/color][/url] - Hover SFX ([url=https://pixabay.com/service/license-summary/][color=#38bdf8]Pixabay License[/color][/url])`;

            textObj.setText(s);
            this.resize(this.scale);
        }
    }

    update(time, delta) {
        let t = time / 1000;
        let rTop = Math.floor(30 - Math.sin(t) * 20);
        let gTop = 10;
        let bTop = Math.floor(80 - Math.cos(t) * 30);

        let rBot = Math.floor(30 + Math.sin(t) * 20);
        let gBot = 50;
        let bBot = Math.floor(80 + Math.cos(t) * 30);

        let colorTop = Phaser.Display.Color.GetColor(rTop, gTop, bTop);
        let colorBottom = Phaser.Display.Color.GetColor(rBot, gBot, bBot);

        this.bgRect.setFillStyle(colorTop, colorTop, colorBottom, colorBottom);
    }

    resize(gameSize) {
        let width = gameSize.width;
        let height = gameSize.height;
        let isMobile = width < 600;
        let cx = width / 2;
        let cy = height / 2;

        this.bgRect.setSize(width, height);

        this.titleText.setFontSize(isMobile ? '24px' : '36px');

        let spriteScale = isMobile ? 0.35 : 0.75;
        this.miguelProfile.img.setScale(spriteScale);
        this.garnataProfile.img.setScale(spriteScale);
        
        this.miguelProfile.nameTxt.setFontSize(isMobile ? '16px' : '22px');
        this.garnataProfile.nameTxt.setFontSize(isMobile ? '16px' : '22px');
        this.miguelProfile.roleTxt.setFontSize(isMobile ? '12px' : '14px');
        this.garnataProfile.roleTxt.setFontSize(isMobile ? '12px' : '14px');

        this.profilesSizer.setOrientation(isMobile ? 'y' : 'x');
        // Usamos un pequeño hack de RexUI para forzar el repintado al cambiar la orientación y espaciado
        this.profilesSizer.space.item = isMobile ? 20 : 100;

        if (this.btnBack) {
            this.btnBack.setMinWidth(isMobile ? 160 : 200);
        }

        // Layout the sizer at the center of the screen
        let targetWidth = Math.min(width * 0.9, 800);
        let targetHeight = height * 0.9;
        
        this.mainSizer.setPosition(cx, cy);
        this.mainSizer.setMinSize(targetWidth, targetHeight);
        this.mainSizer.layout();

        // Check if slider is needed
        let textObj = this.creditsPanel.getElement('panel');
        let contentHeight = textObj ? textObj.height + 40 : 250;
        let maxPanelHeight = this.creditsPanel.height;
        if (contentHeight <= maxPanelHeight) {
            this.creditsPanel.setSliderEnable(false);
            let sliderElement = this.creditsPanel.getElement('slider');
            if (sliderElement) sliderElement.setVisible(false);
        } else {
            this.creditsPanel.setSliderEnable(true);
            let sliderElement = this.creditsPanel.getElement('slider');
            if (sliderElement) sliderElement.setVisible(true);
        }
    }
}