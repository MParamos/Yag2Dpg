/**
 * @file Block.js
 * @description Represents a solid tile/block in the game world. Extends Phaser.Physics.Arcade.Sprite.
 * @author Miguel Páramos
 */
class Block extends Phaser.Physics.Arcade.Sprite {
    /**
     * Creates a new Block.
     * @param {Phaser.Scene} scene - The scene this block belongs to.
     * @param {number} x - The center X coordinate.
     * @param {number} y - The center Y coordinate.
     * @param {number} size - The width and height of the block.
     * @param {number} tileId - The numeric ID representing the block type/color.
     * @param {boolean} isSolid - Whether this block has physics collisions.
     */
    constructor(scene, x, y, size, tileId, isSolid = true) {
        let colorStr = LevelData.PALETTE[tileId] || '#FF00FF';
        let texKey = 'block_' + colorStr;

        // Generate texture if it doesn't exist
        if (!scene.textures.exists(texKey)) {
            let g = scene.make.graphics({ x: 0, y: 0, add: false });
            let col = Phaser.Display.Color.HexStringToColor(colorStr);
            
            // If not solid, we might want it transparent (background blocks)
            if (!isSolid) g.fillStyle(col.color, 0.7);
            else g.fillStyle(col.color, 1);
            
            g.fillRect(0, 0, size, size);
            g.generateTexture(texKey, size, size);
        }

        super(scene, x, y, texKey);
        
        this.tileId = tileId;
        this.isBreakable = false; // For future scaling
        this.isSolid = isSolid;

        scene.add.existing(this);

        if (isSolid) {
            scene.physics.add.existing(this, true); // true = static body
        }
    }
}
