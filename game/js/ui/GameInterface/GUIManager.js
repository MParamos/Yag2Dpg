/**
 * @file GUIManager.js
 * @description Manages a collection of GUI elements (buttons, labels, etc.) 
 * to separate GUI logic from the physics and world rendering.
 * @author Miguel Páramos
 */
class GUIManager {
    constructor() {
        this.elements = [];
    }

    /**
     * Adds a UI element to the manager.
     * @param {Object} element - The UI element (must have update/draw methods).
     */
    add(element) {
        this.elements.push(element);
    }

    /**
     * Removes a UI element from the manager.
     * @param {Object} element - The UI element to remove.
     */
    remove(element) {
        this.elements = this.elements.filter(e => e !== element);
    }

    /**
     * Clears all UI elements.
     */
    clear() {
        this.elements = [];
    }

    /**
     * Updates all UI elements.
     */
    update() {
        for (let el of this.elements) {
            if (typeof el.update === 'function') {
                el.update();
            }
        }
    }

    /**
     * Draws all UI elements.
     */
    draw() {
        for (let el of this.elements) {
            if (typeof el.draw === 'function') {
                el.draw();
            }
        }
    }
}
