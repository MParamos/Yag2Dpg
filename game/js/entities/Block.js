/**
 * @file Block.js
 * @description Represents a solid tile/block in the game world. Extends p5.play Sprite.
 * @author Miguel Páramos
 */
class Block {
    /**
     * Creates a new Block.
     * @param {number} x - The center X coordinate.
     * @param {number} y - The center Y coordinate.
     * @param {number} size - The width and height of the block.
     * @param {number} tileId - The numeric ID representing the block type/color.
     */
    constructor(x, y, size, tileId) {
        // Envolvemos el Sprite estático en la clase usando composición
        this.sprite = new Sprite(x, y, size, size, 'static');
        
        this.tileId = tileId;
        this.sprite.shape = 'box';
        this.sprite.strokeWeight = 0; // Sin bordes, como los antiguos rect()
        
        // Asignar el color usando la paleta de LevelData
        this.sprite.color = LevelData.PALETTE[tileId] || '#FF00FF';

        // Propiedades futuras para escalabilidad
        this.isBreakable = false;
        
        // Referencia cruzada por si el motor necesita acceder a la clase lógica desde el Sprite
        this.sprite.entity = this;
    }
}
