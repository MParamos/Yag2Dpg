/**
 * @file Player.js
 * @description Represents the player character. Extends Phaser.Physics.Arcade.Sprite.
 * @author Miguel Páramos
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
    /**
     * Creates the Player instance.
     * @param {Phaser.Scene} scene - The scene this player belongs to.
     * @param {number} x - The starting X coordinate.
     * @param {number} y - The starting Y coordinate.
     */
    constructor(scene, x, y) {
        // Create a 40x40 red texture dynamically if it doesn't exist
        if (!scene.textures.exists('playerTex')) {
            let g = scene.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0xff0000, 1);
            g.fillRect(0, 0, 40, 40);
            g.generateTexture('playerTex', 40, 40);
        }

        super(scene, x, y, 'playerTex');

        // Add to scene and physics world
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Physics properties
        this.body.setFriction(0, 0); 
        this.body.setBounce(0, 0);
        this.body.setCollideWorldBounds(true);

        // Control attributes
        this.speedX = 250;
        this.jumpForce = 350;

        // Input Setup
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.keyA = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyW = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    }

    /**
     * Lógica principal del jugador. 
     * Debe ser llamada en el update() de la escena principal.
     */
    update() {
        if (!this.body) return;

        // --- Movimiento Horizontal ---
        if (this.cursors.left.isDown || this.keyA.isDown) {
            this.setVelocityX(-this.speedX);
        } else if (this.cursors.right.isDown || this.keyD.isDown) {
            this.setVelocityX(this.speedX);
        } else {
            this.setVelocityX(0);
        }

        // --- Salto ---
        let isGrounded = this.body.blocked.down || this.body.touching.down;

        if ((this.cursors.up.isDown || this.keyW.isDown || this.cursors.space.isDown) && isGrounded) {
            this.setVelocityY(-this.jumpForce);
        }
    }
}
