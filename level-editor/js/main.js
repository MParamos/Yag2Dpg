/**
 * @file main.js
 * @description Application entry point for the Yag2Dpg Level Editor.
 * Initializes the User Interface, binds core events, and dynamically injects 
 * the q5.js library to ensure proper global execution context.
 * @author Miguel Páramos
 */

import { initUI, closeAlert, setBackgroundColor } from './ui.js';
import { startEditor, undo, redo, initializeQ5Events } from './editor.js';
import { executeSave, executeReset, executeDiscard } from './storage.js';

// 1. Initialize the entire user interface and DOM bindings
initUI();

// 2. Prepare the canvas environment by attaching setup() and draw() to the global window object
initializeQ5Events();

// 3. DYNAMIC Q5 INJECTION: Now that setup() exists, q5.js will initialize correctly in global mode
const q5Script = document.createElement('script');
q5Script.src = 'js/libraries/q5.min.js';
document.head.appendChild(q5Script);

// 4. Bind primary application events to their corresponding HTML buttons
document.getElementById('btn-create-level')?.addEventListener('click', startEditor);
document.getElementById('btn-close-alert')?.addEventListener('click', closeAlert);
document.getElementById('btn-reset-map')?.addEventListener('click', executeReset);
document.getElementById('btn-discard-level')?.addEventListener('click', executeDiscard);
document.getElementById('btn-save-zip')?.addEventListener('click', executeSave);
document.getElementById('btn-fill-background')?.addEventListener('click', setBackgroundColor);
document.getElementById('btn-undo')?.addEventListener('click', undo);
document.getElementById('btn-redo')?.addEventListener('click', redo);