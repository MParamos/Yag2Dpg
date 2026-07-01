/**
 * @file Player.js
 * @description Represents the player character. Extends p5.play Sprite.
 * @author Miguel Páramos
 */
class Player {
    /**
     * Creates the Player instance.
     * @param {number} x - The starting X coordinate.
     * @param {number} y - The starting Y coordinate.
     */
    constructor(x, y) {
        // Envolvemos el Sprite dinámico en la clase usando composición
        this.sprite = new Sprite(x, y, 40, 40, 'dynamic');

        this.sprite.color = 'red';
        this.sprite.shape = 'box';
        this.sprite.strokeWeight = 0;

        // Propiedades físicas
        this.sprite.friction = 0;         // Evita que se quede pegado a las paredes
        this.sprite.rotationLock = true;  // Evita que el rectángulo vuelque
        this.sprite.bounciness = 0;       // Evita que rebote al caer

        // Atributos de control
        this.speedX = 5;
        this.jumpForce = 5;
    }

    /**
     * Lógica principal del jugador. 
     * Debe ser llamada en el draw() de la escena principal.
     */
    update() {
        // --- Movimiento Horizontal ---
        if (kb.pressing('left') || kb.pressing('a')) {
            this.sprite.vel.x = -this.speedX;
        } else if (kb.pressing('right') || kb.pressing('d')) {
            this.sprite.vel.x = this.speedX;
        } else {
            this.sprite.vel.x = 0; // Detenerse al soltar
        }

        // --- Salto ---
        // Comprobamos si la tecla de salto acaba de ser pulsada.
        let isGrounded = Math.abs(this.sprite.vel.y) < 0.2;

        if ((kb.presses('up') || kb.presses('w') || kb.presses('space')) && isGrounded) {
            this.sprite.vel.y = -this.jumpForce;
        }

        // --- Cámara ---
        // Seguimos al jugador actual
        camera.x = this.sprite.x;
        camera.y = this.sprite.y;
    }
}
