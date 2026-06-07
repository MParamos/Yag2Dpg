/**
 * @file ui_elements.js
 * @description Global functions for generating user interface elements.
 * @author Miguel Páramos
 */

/**
 * Creates a customized interactive button sprite.
 * * @param {number} x - The x-coordinate of the button's center.
 * @param {number} y - The y-coordinate of the button's center.
 * @param {number} w - The width of the button.
 * @param {number} h - The height of the button.
 * @param {string} textStr - The text or icon to display inside the button.
 * @param {function} actionCallback - The function to execute when the button is pressed.
 * @returns {Sprite} The configured p5play Sprite object acting as a button.
 */
/**
 * @file ui_elements.js
 * @description Global functions for generating user interface elements.
 */

function createCyberButton(x, y, w, h, textStr, actionCallback) {
    let btn = new Sprite(x, y, w, h, 'kinematic');
    btn.color = '#0ea5e9';
    btn.textStr = textStr;
    btn.action = actionCallback;
    btn.disabled = false;
    btn.alpha = 1; 
    btn.wasHovering = false; // Tracks previous frame state for hover SFX
    
    btn.draw = () => {
        push();
        drawingContext.globalAlpha = btn.alpha; 
        rectMode(CENTER);
        
        if (!btn.disabled) {
            drawingContext.shadowBlur = 20;
            drawingContext.shadowColor = btn.color;
        }
        
        stroke('#ffffff');
        strokeWeight(2);
        fill(btn.disabled ? '#1e293b' : btn.color);
        rect(0, 0, btn.width, btn.height, 15);
        drawingContext.shadowBlur = 0;
        
        noStroke();
        fill(btn.disabled ? '#94a3b8' : '#ffffff');
        textAlign(CENTER, CENTER);
        
        textSize(btn.width > 80 ? 18 : 26); 
        text(btn.textStr, 0, 0);
        pop();
    };

    btn.update = () => {
        if (btn.disabled) {
            btn.wasHovering = false;
            return;
        }

        let isHoveringNow = btn.mouse.hovering();

        if (isHoveringNow) {
            btn.color = '#38bdf8'; 
            cursor('pointer');
            
            // Trigger hover SFX only on the exact entry frame
            if (!btn.wasHovering && typeof sfxHover !== 'undefined' && sfxHover.isLoaded()) {
                sfxHover.setVolume(window.GameConfig.sfxVolume);
                sfxHover.play();
            }
        } else {
            btn.color = '#0ea5e9'; 
        }
        
        btn.wasHovering = isHoveringNow;

        if (btn.mouse.presses() && typeof btn.action === 'function') {
            // Trigger click SFX
            if (typeof sfxClick !== 'undefined' && sfxClick.isLoaded()) {
                sfxClick.setVolume(window.GameConfig.sfxVolume);
                sfxClick.play();
            }
            btn.action();
        }
    };

    return btn;
}