/**
 * @file MenuButton.js
 * @description Factory classes for interactive UI buttons using RexUI Label.
 * Encapsulates rendering, state management, and audio feedback, maintaining full RexUI compatibility.
 */
class MenuButton {
    
    /**
     * Instantiates a new interactive menu button using RexUI Label.
     * Note: This returns a RexUI Label instance directly.
     */
    constructor(scene, x, y, w, h, textStr, actionCallback, palette) {
        let selected = palette || { base: 0x0ea5e9, hover: 0x38bdf8 };
        let fontSize = w > 80 ? '18px' : '26px';

        let bgShape = scene.rexUI.add.roundRectangle(0, 0, w, h, 15, selected.base).setStrokeStyle(2, 0xffffff);

        let label = scene.rexUI.add.label({
            x: x, y: y,
            width: w, height: h,
            background: bgShape,
            text: scene.add.text(0, 0, textStr, {
                fontFamily: 'sans-serif',
                fontSize: fontSize,
                color: '#ffffff',
                fontStyle: 'bold'
            }),
            space: { left: 10, right: 10, top: 10, bottom: 10 },
            align: 'center'
        });

        label.btnWidth = w;
        label.btnHeight = h;
        label.isDisabled = false;
        label.baseColor = selected.base;
        label.hoverColor = selected.hover;
        label.disabledBaseColor = 0x1e293b;
        label.disabledTextColor = '#94a3b8';

        // Extract handlers to avoid crashing RexUI's internal listeners with fake events
        label.executePointerDown = function() {
            if (this.isDisabled) return;
            scene.tweens.add({ targets: this, scale: 0.92, duration: 50 });
            if (scene.sound && scene.cache.audio.exists('sfx_click')) {
                scene.sound.play('sfx_click', { volume: ConfigManager.sfxVolume });
            }
        };

        label.executePointerUp = function() {
            if (this.isDisabled) return;
            scene.tweens.add({ targets: this, scale: 1, duration: 50 });
            this.isDisabled = true;
            
            if (typeof actionCallback === 'function') {
                scene.tweens.addCounter({
                    from: 0, to: 100, duration: 80, yoyo: true, repeat: 2,
                    onUpdate: (tween) => {
                        let val = tween.getValue();
                        let mix = (val / 100) * 40;
                        let color = Phaser.Display.Color.Interpolate.ColorWithColor(
                            Phaser.Display.Color.IntegerToColor(this.hoverColor),
                            Phaser.Display.Color.IntegerToColor(0xffffff),
                            100, mix
                        );
                        bgShape.setFillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
                    }
                });
                scene.time.delayedCall(500, () => {
                    actionCallback();
                    if (scene && scene.sys && scene.sys.isActive()) {
                        this.isDisabled = false;
                        bgShape.setFillStyle(this.baseColor);
                    }
                });
            } else {
                this.isDisabled = false;
            }
        };

        label.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                if (label.isDisabled) return;
                bgShape.setFillStyle(label.hoverColor);
                if (scene.sound && scene.cache.audio.exists('sfx_hover')) {
                    scene.sound.play('sfx_hover', { volume: ConfigManager.sfxVolume });
                }
            })
            .on('pointerout', () => {
                if (label.isDisabled) return;
                bgShape.setFillStyle(label.baseColor);
                scene.tweens.add({ targets: label, scale: 1, duration: 50 });
            })
            .on('pointerdown', () => label.executePointerDown())
            .on('pointerup', () => label.executePointerUp());

        label.setDisabled = function(disabled) {
            this.isDisabled = disabled;
            if (disabled) {
                this.disableInteractive();
                bgShape.setFillStyle(this.disabledBaseColor);
                bgShape.setStrokeStyle(2, this.disabledBaseColor);
                this.getElement('text').setColor(this.disabledTextColor);
            } else {
                this.setInteractive();
                bgShape.setFillStyle(this.baseColor);
                bgShape.setStrokeStyle(2, 0xffffff);
                this.getElement('text').setColor('#ffffff');
            }
        };

        label.simulateClick = function() {
            if (this.isDisabled) return;
            this.executePointerDown();
            scene.time.delayedCall(150, () => {
                this.executePointerUp();
            });
        };

        label.setMinWidth(w);
        label.setMinHeight(h);
        label.layout();

        return label;
    }
}

class BlueMenuButton extends MenuButton {
    constructor(scene, x, y, w, h, textStr, actionCallback) {
        super(scene, x, y, w, h, textStr, actionCallback, { base: 0x0ea5e9, hover: 0x38bdf8 });
    }
}

class RedMenuButton extends MenuButton {
    constructor(scene, x, y, w, h, textStr, actionCallback) {
        super(scene, x, y, w, h, textStr, actionCallback, { base: 0xef4444, hover: 0xf87171 });
    }
}

class GreenMenuButton extends MenuButton {
    constructor(scene, x, y, w, h, textStr, actionCallback) {
        super(scene, x, y, w, h, textStr, actionCallback, { base: 0x22c55e, hover: 0x4ade80 });
    }
}
