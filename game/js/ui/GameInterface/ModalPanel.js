/**
 * @file ModalPanel.js
 * @description Encapsulates a generic Modal Panel with a title and Yes/No buttons.
 * Inherits the standard UI update/draw flow to work inside GUIManager.
 * @author Miguel Páramos
 */
class ModalPanel {
    /**
     * Creates a new ModalPanel.
     * @param {string} titleStr - The text shown in the middle of the modal.
     * @param {string} leftBtnText - Text for the left button (e.g. "Yes").
     * @param {string} rightBtnText - Text for the right button (e.g. "No").
     * @param {Function} leftAction - Callback for the left button.
     * @param {Function} rightAction - Callback for the right button.
     * @param {string} borderColor - Border color for the modal box (e.g. '#ef4444').
     */
    constructor(titleStr, leftBtnText, rightBtnText, leftAction, rightAction, borderColor = '#ef4444') {
        this.titleStr = titleStr;
        this.borderColor = borderColor;

        let isMobile = width < 600;
        this.boxWidth = isMobile ? width * 0.9 : 560;
        this.boxHeight = isMobile ? 240 : 200;

        // Creating internal buttons
        this.btnLeft = new MenuButton(
            width / 2 - (isMobile ? 0 : 120),
            height / 2 + (isMobile ? 20 : 60),
            200, 50, leftBtnText, leftAction, 'red'
        );

        this.btnRight = new MenuButton(
            width / 2 + (isMobile ? 0 : 120),
            height / 2 + (isMobile ? 80 : 60),
            200, 50, rightBtnText, rightAction, 'green'
        );
        
        // Modal buttons are allowed to bypass the isGloballyBlocked check in MenuButton 
        // by masquerading as quit modal buttons
        this.btnLeft.isQuitModalButton = true;
        this.btnRight.isQuitModalButton = true;
    }

    update() {
        this.btnLeft.update();
        this.btnRight.update();
    }

    draw() {
        push();
        fill(0, 0, 0, 180);
        rectMode(CORNER);
        rect(0, 0, width, height);

        rectMode(CENTER);
        fill(15, 23, 42);
        stroke(this.borderColor);
        strokeWeight(2);
        rect(width / 2, height / 2, this.boxWidth, this.boxHeight, 15);

        noStroke();
        fill('#ffffff');
        let isMobile = width < 600;
        textSize(isMobile ? 18 : 22);

        GUITools.drawWrappedText(
            this.titleStr,
            width / 2,
            height / 2 - 40,
            this.boxWidth - 40,
            30
        );
        pop();

        // Draw buttons OVER the modal
        this.btnLeft.draw();
        this.btnRight.draw();
    }

    windowResized() {
        let isMobile = width < 600;
        this.boxWidth = isMobile ? width * 0.9 : 560;
        this.boxHeight = isMobile ? 240 : 200;

        this.btnLeft.x = width / 2 - (isMobile ? 0 : 120);
        this.btnLeft.y = height / 2 + (isMobile ? 20 : 60);
        
        this.btnRight.x = width / 2 + (isMobile ? 0 : 120);
        this.btnRight.y = height / 2 + (isMobile ? 80 : 60);
    }
}
