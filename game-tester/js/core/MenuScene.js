/**
 * @file MenuScene.js
 * @description Base class for data-driven menus. Parses a JSON configuration
 * to automatically build UI elements using Phaser GameObjects and RexUI.
 * Inherits from BaseScene.
 */
class MenuScene extends BaseScene {
    constructor(config) {
        super(config);
        this.uiElements = {};
        this.menuConfig = null;
        this.bgType = null;
    }

    /**
     * Builds the scene UI from a JSON configuration object.
     * @param {Object} config - The JSON configuration object.
     */
    buildFromJSON(config) {
        this.menuConfig = config;
        this.uiElements = {}; // Reset

        if (config.background) {
            this.buildBackground(config.background);
        }

        if (config.elements) {
            config.elements.forEach(elData => {
                this.buildElement(elData, this);
            });
        }
    }

    buildBackground(bgData) {
        const width = this.scale.width;
        const height = this.scale.height;
        this.bgType = bgData.type;

        if (bgData.type === 'gradient_dynamic') {
            this.bgRect = this.add.rectangle(0, 0, width, height).setOrigin(0).setDepth(0);
        } else if (bgData.type === 'solid' && bgData.color) {
            let color = Phaser.Display.Color.HexStringToColor(bgData.color).color;
            this.bgRect = this.add.rectangle(0, 0, width, height, color).setOrigin(0).setDepth(0);
        } else if (bgData.type === 'image' && bgData.asset) {
            this.bgImage = this.add.image(width/2, height/2, bgData.asset).setOrigin(0.5).setDepth(0);
        }
    }

    buildElement(data, parent) {
        let element = null;

        switch (data.type) {
            case 'image':
                element = this.add.image(0, 0, data.asset);
                if (data.alpha !== undefined) element.setAlpha(data.alpha);
                if (data.tintFill) {
                    let color = typeof data.tintFill === 'string' && data.tintFill.startsWith('0x') 
                                ? parseInt(data.tintFill) 
                                : Phaser.Display.Color.HexStringToColor(data.tintFill).color;
                    
                    if (element.setTint) {
                        element.setTint(color);
                        if (Phaser.TintModes && Phaser.TintModes.FILL) {
                            element.setTintMode(Phaser.TintModes.FILL);
                        }
                    }
                }
                break;

            case 'text':
                let textStr = data.text || (data.textKey ? (window.I18n ? I18n.getText(data.textKey) : data.defaultText) : '');
                element = this.add.text(0, 0, textStr, data.style || {});
                
                if (data.interactive) {
                    element.setInteractive({ useHandCursor: true });
                    if (data.hoverColor) {
                        const origColor = data.style && data.style.color ? data.style.color : '#ffffff';
                        element.on('pointerover', () => element.setColor(data.hoverColor));
                        element.on('pointerout', () => element.setColor(origColor));
                    }
                }
                break;

            case 'container':
                element = this.add.container(0, 0);
                if (data.children) {
                    data.children.forEach(childData => {
                        let child = this.buildElement(childData, this);
                        if (childData.offsetX !== undefined || childData.offsetY !== undefined) {
                            child.setPosition(childData.offsetX || 0, childData.offsetY || 0);
                        }
                        element.add(child);
                    });
                }
                break;

            case 'sizer':
                let sizerConfig = {
                    orientation: data.orientation || 'x',
                    space: data.space || {}
                };
                element = this.rexUI.add.sizer(sizerConfig);
                
                if (data.children) {
                    data.children.forEach(childData => {
                        let child = this.buildElement(childData, this);
                        let padding = childData.padding || {};
                        let expand = childData.expand !== undefined ? childData.expand : false;
                        element.add(child, { expand: expand, padding: padding });
                    });
                }
                element.layout();
                break;

            case 'blueMenuButton':
                let btnTextStr = data.text || (data.textKey ? (window.I18n ? I18n.getText(data.textKey) : data.defaultText) : '');
                // Requires BlueMenuButton to be globally available or imported
                element = new BlueMenuButton(this, 0, 0, data.width || 200, data.height || 60, btnTextStr, () => {
                    this.handleAction(data.action, data);
                });
                break;
        }

        if (element) {
            // Apply generic properties
            if (data.origin) element.setOrigin(data.origin[0], data.origin.length > 1 ? data.origin[1] : data.origin[0]);
            if (data.depth !== undefined) element.setDepth(data.depth);
            
            // Store interactive action for non-buttons
            if (data.action && data.type !== 'blueMenuButton') {
                element.setInteractive({ useHandCursor: true });
                element.on('pointerdown', () => this.handleAction(data.action, data));
            }

            // Store in elements dict
            if (data.id) {
                this.uiElements[data.id] = element;
                // Add reference to element data for resize logic
                element._configData = data; 
            }
        }

        return element;
    }

    /**
     * Resolves an action string to a method call.
     */
    handleAction(actionName, data) {
        if (!actionName) return;

        // Built-in generic actions
        if (actionName === 'openUrl' && data.url) {
            window.open(data.url, '_blank');
            return;
        }

        // Scene-specific actions (overriden in subclasses like MainMenuScene)
        if (typeof this[actionName] === 'function') {
            this[actionName](data);
        } else {
            console.warn(`MenuScene: Action '${actionName}' not implemented in this scene.`);
        }
    }

    update(time, delta) {
        if (this.bgType === 'gradient_dynamic' && this.bgRect) {
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
    }
}
