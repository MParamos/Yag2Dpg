/**
 * @file scene_level.js
 * @description Physics test level (formerly the main game.js). 
 * Handles sandbox mechanics like spawning boxes with gravity.
 * @author Miguel Páramos
 */

const LevelScene = {
    floor: null,

    setup: function() {
        // Restore gravity for the physics simulation
        world.gravity.y = 9.8;
        
        this.floor = new Sprite(width / 2, height - 20, width, 40, 'static');
        this.floor.color = '#00ff88'; 
        this.floor.stroke = '#ffffff';
        
        this.spawnBox(width / 2, 50);
    },

    draw: function(lang) {
        fill(255);
        noStroke();
        textAlign(CENTER, CENTER);
        
        // Level title
        textSize(24);
        text(getText(lang, 'game_hello'), width / 2, height / 2 - 50);
        
        // Game instructions
        textSize(14);
        fill('#aadafa'); 
        text(getText(lang, 'game_instructions'), width / 2, height / 2 - 20);
        
        // Custom escape button to return to the menu
        textSize(12);
        fill('#ff5555');
        text("[ Esc ] or click up here to Return to Menu", width / 2, 30);
        
        // Level mechanics (Input handling)
        if (mouse.presses()) {
            // Detect if clicking at the top to return, or anywhere else to spawn boxes
            if (mouse.y < 50) {
                changeScene('menu');
            } else {
                this.spawnBox(mouse.x, mouse.y);
            }
        }
        
        if (kb.presses('escape')) {
            changeScene('menu');
        }
    },

    /**
     * Helper function to instantiate physical dynamic boxes.
     * @param {number} x - The x-coordinate for the box spawning point.
     * @param {number} y - The y-coordinate for the box spawning point.
     */
    spawnBox: function(x, y) {
        let box = new Sprite(x, y, 40, 40);
        box.color = '#0ea5e9'; 
        box.bounciness = 0.5;
    },

    windowResized: function() {
        // Adjust the floor size and position dynamically
        if (this.floor) {
            this.floor.x = width / 2;
            this.floor.y = height - 20;
            this.floor.width = width;
        }
    }
};