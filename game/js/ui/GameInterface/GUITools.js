/**
 * @file GUITools.js
 * @description Static utilities for advanced canvas UI rendering.
 * @author Miguel Páramos
 */
class GUITools {
    /**
     * Draws text that automatically wraps within a maximum width.
     * @param {string} strContent - The text string to draw.
     * @param {number} x - The x-coordinate.
     * @param {number} y - The starting y-coordinate.
     * @param {number} maxWidth - The maximum width of the text block.
     * @param {number} lineHeight - The pixel height of each line.
     */
    static drawWrappedText(strContent, x, y, maxWidth, lineHeight) {
        let words = strContent.split(' ');
        let currentLine = '';
        let currentY = y;

        for (let n = 0; n < words.length; n++) {
            let testLine = currentLine + words[n] + ' ';
            let metrics = drawingContext.measureText(testLine);
            let testWidth = metrics.width;

            if (testWidth > maxWidth && n > 0) {
                text(currentLine, x, currentY); 
                currentLine = words[n] + ' ';
                currentY += lineHeight;
            } else {
                currentLine = testLine;
            }
        }
        text(currentLine, x, currentY);
    }
}
