/**
 * @file editor.js
 * @description Core graphics engine and canvas event handling for the Yagce Level Editor.
 * Integrates with q5.js (a lightweight p5.js alternative) to manage rendering, 
 * grid interactions, zoom/pan camera logic, and painting history (undo/redo).
 * @author Miguel Páramos
 */

import { state, palette, MAX_HISTORY } from './config.js';
import { showAlert, changeToolUI } from './ui.js';
import { getText } from './i18n.js';
import { executeSave, executeReset, executeDiscard } from './storage.js';

/**
 * Validates if a given string is a properly formatted URL.
 * Leverages the native URL API for robust validation and enforces a valid hostname.
 * @param {string} string - The URL string to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
function isValidUrl(string) {
  if (!string || typeof string !== 'string') return false;

  let urlToTest = string.trim();
  
  if (!urlToTest.startsWith('http://') && !urlToTest.startsWith('https://')) {
    urlToTest = 'https://' + urlToTest;
  }

  try { 
    const url = new URL(urlToTest);
    
    if (!url.hostname.includes('.') && url.hostname !== 'localhost' && url.hostname !== 'workbench') {
      return false;
    }
    
    return true; 
  } catch (_) { 
    return false; 
  }
}

/**
 * Initializes the 3D array structure for the map (3 layers: Background, Middle, Foreground).
 */
export function initializeMapMatrix() {
  state.editorMap = [ [], [], [] ]; 
  for (let z = 0; z < 3; z++) {
    for (let i = 0; i < state.rows; i++) {
      let row = [];
      for (let j = 0; j < state.columns; j++) row.push(0);
      state.editorMap[z].push(row);
    }
  }
}

/**
 * Saves the current state of the map and logical markers into the history array for Undo/Redo.
 * Ensures the history array doesn't exceed MAX_HISTORY.
 */
export function saveState() {
  if (state.historyIndex < state.history.length - 1) { 
      state.history = state.history.slice(0, state.historyIndex + 1); 
  }
  state.history.push(JSON.parse(JSON.stringify({
    map: state.editorMap, spawns: state.spawnPoints, goals: state.goalPoints
  })));
  
  if (state.history.length > MAX_HISTORY) state.history.shift(); 
  else state.historyIndex++;
}

/**
 * Reverts the map to the previous state in the history stack.
 */
export function undo() {
  if (state.historyIndex > 0) {
    state.historyIndex--;
    let snapshot = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
    state.editorMap = snapshot.map; 
    state.spawnPoints = snapshot.spawns || []; 
    state.goalPoints = snapshot.goals || [];
  }
}

/**
 * Restores the map to the next state in the history stack if available.
 */
export function redo() {
  if (state.historyIndex < state.history.length - 1) {
    state.historyIndex++;
    let snapshot = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
    state.editorMap = snapshot.map; 
    state.spawnPoints = snapshot.spawns || []; 
    state.goalPoints = snapshot.goals || [];
  }
}

/**
 * Validates configuration form inputs and initializes the canvas editor environment.
 */
export function startEditor() {
  let levelAuthor = document.getElementById('in-level-author').value.trim();
  let authorEmail = document.getElementById('in-author-email').value.trim();
  let authorUrl = document.getElementById('in-level-author-url').value.trim();
  let levelLicense = document.getElementById('sel-level-license').value;
  let levelLicenseCustom = document.getElementById('in-level-license-custom').value.trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (levelAuthor.length < 3 || levelAuthor.length > 50) { showAlert('err_val_autor'); return; }
  if (!emailRegex.test(authorEmail)) { showAlert('err_val_email'); return; }
  if (authorUrl !== "" && !isValidUrl(authorUrl)) { showAlert('err_val_url'); return; }
  
  if (levelLicense === "") { showAlert('req_lic_nivel'); return; }
  if ((levelLicense === "other") && levelLicenseCustom === "") { showAlert('req_lic_esp'); return; }

  state.levelData.author = levelAuthor;
  state.levelData.email = authorEmail;
  state.levelData.url = authorUrl;
  
  let selLevelLicElem = document.getElementById('sel-level-license');
  state.levelData.license = (levelLicense === "other") ? levelLicenseCustom : selLevelLicElem.options[selLevelLicElem.selectedIndex].text;

  let imageLicense = document.getElementById('sel-image-license').value;
  if (document.getElementById('check-background').checked && imageLicense === "") { showAlert('req_lic_fondo'); return; }
  
  const checkMusic = document.getElementById('check-music');
  const fileInputMusic = document.getElementById('in-music-file');
  const inMusicTitle = document.getElementById('in-music-title');
  const selMusicLicense = document.getElementById('sel-music-license');
  const inMusicAuthor = document.getElementById('in-music-author');
  const inMusicUrl = document.getElementById('in-music-url');

  if (checkMusic && checkMusic.checked) {
    if (fileInputMusic.files.length === 0) { showAlert("req_musica"); return; }
    if (inMusicTitle.value.trim() === "") { showAlert("req_tit_musica"); return; }
    
    let typeMusicLicense = selMusicLicense.value;
    if (typeMusicLicense === "") { showAlert("req_lic_musica"); return; }
    
    let reqMusicCredit = ['copyright', 'cc-by', 'cc-by-sa', 'cc-by-nc', 'cc-by-nc-sa', 'cc-by-nd', 'mit', 'gpl', 'apache', 'other'].includes(typeMusicLicense);
    if (reqMusicCredit && (inMusicAuthor.value.trim() === '' || inMusicUrl.value.trim() === '')) {
      showAlert("req_aut_musica"); return;
    }

    if (inMusicUrl.value.trim() !== '' && !isValidUrl(inMusicUrl.value.trim())) { showAlert("err_val_url"); return; }

    let inCustomMusicLicense = document.getElementById('in-custom-music-license');
    if (typeMusicLicense === 'other' && inCustomMusicLicense.value.trim() === '') { showAlert("req_lic_esp_musica"); return; }

    if (typeMusicLicense === 'copyright') {
      let checkCopyrightMusic = document.getElementById('check-music-copyright-auth');
      if (checkCopyrightMusic && !checkCopyrightMusic.checked) { showAlert("req_copy_musica"); return; }
    }

    const fileMusic = fileInputMusic.files[0];
    state.originalMusicFile = fileMusic;
    state.musicExtension = fileMusic.name.split('.').pop();
    state.musicMetadata.inUse = true;
    state.musicMetadata.title = inMusicTitle.value.trim();
    state.musicMetadata.license = typeMusicLicense === 'other' ? inCustomMusicLicense.value.trim() : selMusicLicense.options[selMusicLicense.selectedIndex].text;
    state.musicMetadata.author = inMusicAuthor.value.trim();
    state.musicMetadata.url = inMusicUrl.value.trim();
  }

  let inputWidth = parseInt(document.getElementById('in-width').value);
  let inputHeight = parseInt(document.getElementById('in-height').value);
  state.tileSize = state.globalTileSize; 

  if (inputWidth < 100 || inputWidth > 2000 || inputHeight < 100 || inputHeight > 2000) { alert(getText('dim_mapa')); return; }
  if (state.tileSize < 5 || state.tileSize > 100) { alert(getText('dim_tile')); return; }
  if (inputWidth % state.tileSize !== 0 || inputHeight % state.tileSize !== 0) { alert(getText('div_tile')); return; }

  const checkBackground = document.getElementById('check-background');
  const fileInputImage = document.getElementById('in-image-file');
  const selImageLicense = document.getElementById('sel-image-license');
  const inImageAuthor = document.getElementById('in-image-author');
  const inImageUrl = document.getElementById('in-image-url');
  
  if (checkBackground && checkBackground.checked) {
    if(fileInputImage.files.length === 0) { showAlert("req_img"); return; }
    
    let typeLicense = selImageLicense.value;
    let reqCredit = ['copyright', 'cc-by', 'cc-by-sa', 'cc-by-nc', 'cc-by-nc-sa', 'cc-by-nd', 'mit', 'gpl', 'apache', 'other'].includes(typeLicense);
    
    if (reqCredit && (inImageAuthor.value.trim() === '' || inImageUrl.value.trim() === '')) { showAlert("req_aut_fondo"); return; }
    if (inImageUrl.value.trim() !== '' && !isValidUrl(inImageUrl.value.trim())) { showAlert("err_val_url"); return; }

    let inCustomLicense = document.getElementById('in-custom-license');
    if (typeLicense === 'other' && inCustomLicense.value.trim() === '') { showAlert("req_lic_esp_fondo"); return; }
    if (typeLicense === 'copyright') {
      let checkCopyright = document.getElementById('check-copyright-auth');
      if (checkCopyright && !checkCopyright.checked) { showAlert("req_copy_fondo"); return; }
    }

    const file = fileInputImage.files[0];
    if (state.currentBackgroundUrl !== null) URL.revokeObjectURL(state.currentBackgroundUrl);
    
    state.currentBackgroundUrl = URL.createObjectURL(file);
    state.originalBackgroundImage = file;
    state.backgroundExtension = file.name.split('.').pop();
    state.backgroundMetadata.inUse = true;
    state.backgroundMetadata.license = typeLicense === 'other' ? inCustomLicense.value.trim() : selImageLicense.options[selImageLicense.selectedIndex].text;
    state.backgroundMetadata.author = inImageAuthor.value.trim();
    state.backgroundMetadata.url = inImageUrl.value.trim();
    
    state.backgroundImageObj = loadImage(state.currentBackgroundUrl);
  }

  state.columns = inputWidth / state.tileSize;
  state.rows = inputHeight / state.tileSize;

  document.getElementById('form-screen').classList.add('hidden');
  document.getElementById('editor-screen').classList.remove('hidden');
  document.getElementById('editor-screen').classList.add('flex');

  let canvasW = document.getElementById('editor-screen').clientWidth || window.innerWidth;
  let canvasH = document.getElementById('editor-screen').clientHeight || window.innerHeight;
  resizeCanvas(canvasW, canvasH);
  
  state.camX = canvasW / 2 - (state.columns * state.tileSize) / 2;
  state.camY = canvasH / 2 - (state.rows * state.tileSize) / 2;
  
  let toolsPanel = document.getElementById('tab-tools');
  if (toolsPanel && state.backgroundMetadata.inUse) {
      if (!document.getElementById('opacity-slider')) {
          let div = document.createElement('div');
          div.className = 'w-full flex flex-col gap-1 mt-2 p-2 bg-slate-800 rounded border border-slate-700 shadow-inner';
          div.innerHTML = `<span class="text-slate-300 text-[10px] sm:text-xs font-bold">${getText('opacidad')}</span>
                           <input type="range" id="opacity-slider" class="w-full accent-sky-500 cursor-pointer" min="0" max="100" value="50">`;
          toolsPanel.appendChild(div);
          state.opacitySliderDom = document.getElementById('opacity-slider');
      }
  }

  initializeMapMatrix();
  changeToolUI('hand'); // Force move tool on start
  
  state.editorStarted = true;
  saveState();
}

/**
 * Handles logic for drawing tiles or markers onto the grid based on current brush/layer state.
 */
function paintTile() {
  if (!state.editorStarted) return;
  if (state.currentBrush === 'hand' || mouseButton === RIGHT || mouseButton === CENTER) return;

  let worldX = (mouseX - state.camX) / state.zoom;
  let worldY = (mouseY - state.camY) / state.zoom;

  if (worldY < state.rows * state.tileSize && worldY > 0 && worldX > 0 && worldX < state.columns * state.tileSize) {
    let j = floor(worldX / state.tileSize);
    let i = floor(worldY / state.tileSize);
    
    if (i >= 0 && i < state.rows && j >= 0 && j < state.columns) {
      if (state.activeLayer === 'spawn') {
        if (state.currentBrush === 'spawn') {
          if (!state.spawnPoints.some(p => p.i === i && p.j === j)) {
            state.spawnPoints.push({i, j});
            state.goalPoints = state.goalPoints.filter(p => !(p.i === i && p.j === j));
            state.modifiedInCurrentStroke = true;
          }
        } else if (state.currentBrush === 0) {
          let oldLen = state.spawnPoints.length;
          state.spawnPoints = state.spawnPoints.filter(p => !(p.i === i && p.j === j));
          if (state.spawnPoints.length !== oldLen) state.modifiedInCurrentStroke = true;
        }
      } 
      else if (state.activeLayer === 'goal') {
        if (state.currentBrush === 'goal') {
          if (!state.goalPoints.some(p => p.i === i && p.j === j)) {
            state.goalPoints.push({i, j});
            state.spawnPoints = state.spawnPoints.filter(p => !(p.i === i && p.j === j));
            state.modifiedInCurrentStroke = true;
          }
        } else if (state.currentBrush === 0) {
          let oldLen = state.goalPoints.length;
          state.goalPoints = state.goalPoints.filter(p => !(p.i === i && p.j === j));
          if (state.goalPoints.length !== oldLen) state.modifiedInCurrentStroke = true;
        }
      } 
      else { 
        if (state.editorMap[state.activeLayer][i][j] !== state.currentBrush) {
          state.editorMap[state.activeLayer][i][j] = state.currentBrush;
          state.modifiedInCurrentStroke = true; 
        }
      }
    }
  }
}

// ====================================================
// q5.js GLOBAL BINDINGS
// ====================================================

export function initializeQ5Events() {
  window.setup = function() {
    let canvasInstance = createCanvas(1, 1);
    canvasInstance.parent('canvas-wrapper');
  };

  window.draw = function() {
    if (!state.editorStarted) return;   
    clear(); 
    background('#0f172a');

    push();
    translate(state.camX, state.camY);
    scale(state.zoom);

    fill(palette[state.currentBackgroundColor] || '#000000');
    noStroke();
    rect(0, 0, state.columns * state.tileSize, state.rows * state.tileSize);

    if (state.backgroundImageObj) {
      state.backgroundOpacity = state.opacitySliderDom ? parseInt(state.opacitySliderDom.value) : 50;
      drawingContext.globalAlpha = state.backgroundOpacity / 100;
      image(state.backgroundImageObj, 0, 0, state.columns * state.tileSize, state.rows * state.tileSize);
      drawingContext.globalAlpha = 1.0; 
    }
    
    // Draw Grid
    for (let i = 0; i < state.rows; i++) {
      for (let j = 0; j < state.columns; j++) {
        noFill(); 
        stroke('rgba(255, 255, 255, 0.08)'); 
        strokeWeight(1 / state.zoom); 
        rect(j * state.tileSize, i * state.tileSize, state.tileSize, state.tileSize);
      }
    }
    
    // Draw Map Layers
    for (let z = 0; z < 3; z++) {
      for (let i = 0; i < state.rows; i++) {
        for (let j = 0; j < state.columns; j++) {
          let blockType = state.editorMap[z][i][j];
          if (blockType !== 0) {
            let baseColor = palette[blockType] || '#FFFFFF';
            if (z === state.activeLayer) {
                stroke('#ffffff'); strokeWeight(2 / state.zoom);
            } else {
                noStroke();
            }
            if (z === 0 || z === 2) fill(baseColor + '78'); else fill(baseColor);
            rect(j * state.tileSize, i * state.tileSize, state.tileSize, state.tileSize);
          }
        }
      }
    }

    // Draw Spawn Points
    for (let pt of state.spawnPoints) {
      fill('rgba(255, 69, 0, 0.55)'); stroke('#FF4500'); strokeWeight(2 / state.zoom); 
      rect(pt.j * state.tileSize, pt.i * state.tileSize, state.tileSize, state.tileSize);
      fill(255); noStroke(); textAlign(CENTER, CENTER); textSize(state.tileSize * 0.55);
      text("🎬", pt.j * state.tileSize + state.tileSize/2, pt.i * state.tileSize + state.tileSize/2);
    }

    // Draw Goal Points
    for (let pt of state.goalPoints) {
      fill('rgba(15, 23, 42, 0.4)'); stroke('#00FFFF'); strokeWeight(2 / state.zoom);
      rect(pt.j * state.tileSize, pt.i * state.tileSize, state.tileSize, state.tileSize);
      let subSize = state.tileSize / 4;
      noStroke();
      for (let sy = 0; sy < 4; sy++) {
        for (let sx = 0; sx < 4; sx++) {
          fill((sx + sy) % 2 === 0 ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)');
          rect(pt.j * state.tileSize + sx * subSize, pt.i * state.tileSize + sy * subSize, subSize, subSize);
        }
      }
    }
    pop();
  };

  window.mouseDragged = function(e) { 
    if (e && e.target && e.target.tagName !== 'CANVAS') return;
    if (state.currentBrush === 'hand' || mouseButton === RIGHT || mouseButton === CENTER) {
      state.camX += e.movementX;
      state.camY += e.movementY;
      return;
    }
    paintTile(); 
  };

  window.mousePressed = function(e) { 
    if (e && e.target && e.target.tagName !== 'CANVAS') return;
    paintTile(); 
  };

  window.mouseReleased = function(e) { 
    if (state.modifiedInCurrentStroke) { 
        saveState(); 
        state.modifiedInCurrentStroke = false; 
    } 
  };
}

// Window Events
window.addEventListener('keydown', function(e) {
  if (state.editorStarted && (e.ctrlKey || e.metaKey)) {
    switch (e.key.toLowerCase()) {
      case 's': e.preventDefault(); executeSave(); break;
      case 'r': e.preventDefault(); executeReset(); break;
      case 'q': e.preventDefault(); executeDiscard(); break;
      case 'z': e.preventDefault(); if (e.shiftKey) redo(); else undo(); break;
      case 'y': e.preventDefault(); redo(); break;
    }
  }
});

window.addEventListener('resize', () => {
  if (state.editorStarted) {
    let mainContainer = document.getElementById('canvas-wrapper');
    let canvasW = Math.max(mainContainer ? mainContainer.clientWidth : window.innerWidth, 1);
    let canvasH = Math.max(mainContainer ? mainContainer.clientHeight : window.innerHeight, 1);
    resizeCanvas(canvasW, canvasH);
  }
});

window.addEventListener('touchmove', function(e) {
  if (state.editorStarted && e.target.tagName === 'CANVAS') e.preventDefault();
}, { passive: false });

window.addEventListener('wheel', (e) => {
  if (!state.editorStarted || e.target.tagName !== 'CANVAS') return;
  let zoomDelta = e.deltaY > 0 ? 0.9 : 1.1; 
  state.camX = mouseX - (mouseX - state.camX) * zoomDelta;
  state.camY = mouseY - (mouseY - state.camY) * zoomDelta;
  state.zoom *= zoomDelta;
}, { passive: false });

document.addEventListener('contextmenu', event => {
  if (state.editorStarted) event.preventDefault();
});