/**
 * @file ConfirmationModalDialog.js
 * @description Encapsulates a generic ConfirmationModalDialog with a title and Yes/No buttons.
 * Rewritten to use RexUI for automatic layout and scaling.
 * @author Miguel Páramos
 */
class ConfirmationModalDialog extends Phaser.GameObjects.Container {
    /**
     * Creates a new ConfirmationModalDialog using RexUI.
     * @param {Phaser.Scene} scene - The scene this modal belongs to.
     * @param {Object} config - Configuration object.
     * @param {string} config.title - The text shown in the middle of the modal.
     * @param {string} config.leftText - Text for the left button (e.g. "Yes").
     * @param {string} config.rightText - Text for the right button (e.g. "No").
     * @param {Function} config.leftAction - Callback for the left button.
     * @param {Function} config.rightAction - Callback for the right button.
     * @param {string} [config.borderColor='#ef4444'] - Border color for the modal box.
     */
    constructor(scene, config) {
        super(scene, 0, 0);

        this.config = config;
        let borderColor = config.borderColor || '#ef4444';

        let cx = scene.scale.width / 2;
        let cy = scene.scale.height / 2;

        // Background Dark Overlay - Blocks interaction below it
        this.overlay = scene.add.rectangle(cx, cy, scene.scale.width, scene.scale.height, 0x000000, 0.7);
        this.overlay.setInteractive();

        // Modal Box Graphics using RexUI Dialog
        let bColor = parseInt(borderColor.replace('#', '0x'));
        
        let isMobile = scene.scale.width < 600;
        let fontSize = isMobile ? '18px' : '22px';

        this.dialog = scene.rexUI.add.dialog({
            x: cx,
            y: cy,
            background: scene.rexUI.add.roundRectangle(0, 0, 100, 100, 15, 0x0f172a).setStrokeStyle(2, bColor),
            title: scene.rexUI.add.label({
                text: scene.add.text(0, 0, config.title, { fontFamily: 'sans-serif', fontSize: fontSize, color: '#ffffff', align: 'center', wordWrap: { width: (isMobile ? scene.scale.width * 0.8 : 500) } }),
                space: { left: 15, right: 15, top: 20, bottom: 20 }
            }),
            actions: [
                new RedMenuButton(scene, 0, 0, 150, 40, config.leftText, config.leftAction),
                new GreenMenuButton(scene, 0, 0, 150, 40, config.rightText, config.rightAction)
            ],
            space: {
                title: 10,
                content: 20,
                action: 20,
                left: 20,
                right: 20,
                top: 20,
                bottom: 20,
            },
            align: {
                actions: 'center'
            },
            expand: {
                title: false,
            }
        })
        .layout();

        this.add([this.overlay, this.dialog]);
        
        // Ensure modal is always on top
        this.setDepth(100);

        scene.add.existing(this);

        scene.input.keyboard.on('keydown-ENTER', () => {
            if (this.visible && this.active) {
                let actions = this.dialog.getElement('actions');
                if (actions && actions.length > 0 && actions[0].simulateClick) {
                    actions[0].simulateClick();
                }
            }
        });

        // Bind ESC key to the right action if the modal is visible
        scene.input.keyboard.on('keydown-ESC', () => {
            if (this.visible && this.active) {
                let actions = this.dialog.getElement('actions');
                if (actions && actions.length > 1 && actions[1].simulateClick) {
                    actions[1].simulateClick();
                }
            }
        });
    }


    close() {
        this.destroy();
    }

    resize(gameSize) {
        let cx = gameSize.width / 2;
        let cy = gameSize.height / 2;
        let isMobile = gameSize.width < 600;
        
        this.overlay.setSize(gameSize.width, gameSize.height);
        this.overlay.setPosition(cx, cy);
        
        let titleText = this.dialog.getElement('title').getElement('text');
        if (titleText) {
            titleText.setFontSize(isMobile ? '18px' : '22px');
            titleText.setWordWrapWidth(isMobile ? gameSize.width * 0.8 : 500);
        }

        this.dialog.setPosition(cx, cy);
        this.dialog.layout();
    }

    updateTexts(titleStr, leftStr, rightStr) {
        if (titleStr) this.dialog.getElement('title').getElement('text').setText(titleStr);
        if (leftStr) this.dialog.getElement('actions')[0].setText(leftStr);
        if (rightStr) this.dialog.getElement('actions')[1].setText(rightStr);
        this.dialog.layout();
    }
}
