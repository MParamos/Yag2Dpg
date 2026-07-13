/**
 * @file ui.js
 * @description User Interface logic and DOM event bindings for the Yagce Level Editor.
 * Manages state updates reflecting on the UI, tool selection, layer switching, 
 * and dynamic configuration panels.
 * @author Miguel Páramos
 */

import { state, palette } from './config.js';
import { getText, setLanguage } from './i18n.js';
import { undo, redo } from './editor.js';

/**
 * Displays a custom modal alert.
 * @param {string} messageKey - The i18n key for the message to display.
 */
export function showAlert(messageKey) {
  document.getElementById('mr-alert-text').innerText = getText(messageKey);
  document.getElementById('mr-custom-alert').classList.remove('hidden');
  document.getElementById('mr-custom-alert').classList.add('flex');
}

/**
 * Hides the custom modal alert.
 */
export function closeAlert() {
  document.getElementById('mr-custom-alert').classList.add('hidden');
  document.getElementById('mr-custom-alert').classList.remove('flex');
}

/**
 * Clears active visual states from all tool buttons.
 */
function clearToolsUI() {
    document.querySelectorAll('.btn-tool').forEach(b => {
        b.classList.remove('border-amber-500', 'border-white', 'bg-amber-600', 'bg-slate-500');
        b.classList.add('border-transparent', 'bg-slate-700');
    });
}

/**
 * Updates the visual state of the "Set Background" button based on the selected color.
 * @param {number|null} colorId - The ID of the currently selected color palette swatch.
 */
export function updateBackgroundButton(colorId) {
    let btnBackground = document.getElementById('btn-fill-background');
    if (!btnBackground) return;
    
    if (!colorId || colorId === 0 || state.currentBrush === 'hand') {
        btnBackground.style.backgroundColor = '';
        btnBackground.style.color = '';
        btnBackground.style.textShadow = '';
        btnBackground.classList.add('cursor-not-allowed', 'text-slate-400');
        btnBackground.classList.remove('hover:bg-slate-600', 'text-slate-300');
    } else {
        btnBackground.classList.remove('cursor-not-allowed', 'text-slate-400');
        btnBackground.classList.add('hover:bg-slate-600', 'text-slate-300');
        btnBackground.style.backgroundColor = palette[colorId];
        
        // Ensure contrast for light colors
        let isLight = (colorId === 56 || colorId === 13 || colorId === 14);
        btnBackground.style.color = isLight ? '#000000' : '#ffffff';
        btnBackground.style.textShadow = isLight ? 'none' : '0 1px 3px rgba(0,0,0,0.8)';
    }
}

/**
 * Updates the active layer state and UI indicators.
 * @param {string|number|null} layer - The target layer identifier.
 */
export function changeLayerUI(layer) {
    document.querySelectorAll('.btn-layer').forEach(b => {
        b.classList.remove('border-sky-500', 'bg-sky-600', 'border-red-500', 'bg-red-600', 'border-emerald-500', 'bg-emerald-600');
        b.classList.add('border-transparent', 'bg-slate-700');
    });
    
    // Passing null visually deselects all layers (used for the move tool)
    if (layer === null) {
        state.activeLayer = null;
        return;
    }

    let btn = document.querySelector(`.btn-layer[data-layer="${layer}"]`);
    if(!btn) return;
    
    btn.classList.remove('border-transparent', 'bg-slate-700');
    
    if (layer === 'spawn') {
        btn.classList.add('border-red-500', 'bg-red-600');
        state.activeLayer = 'spawn'; 
        state.currentBrush = 'spawn';
        updateBackgroundButton(null); 
    } else if (layer === 'goal') {
        btn.classList.add('border-emerald-500', 'bg-emerald-600');
        state.activeLayer = 'goal'; 
        state.currentBrush = 'goal';
        updateBackgroundButton(null); 
    } else {
        btn.classList.add('border-sky-500', 'bg-sky-600');
        state.activeLayer = parseInt(layer); 
        state.lastStandardLayer = state.activeLayer;
        
        if (state.currentBrush === 'spawn' || state.currentBrush === 'goal' || state.currentBrush === 'hand') { 
            selectColor(1);
        }
    }
    
    if (layer === 'spawn' || layer === 'goal' || state.currentBrush === 'hand') {
        clearToolsUI();
    }
}

/**
 * Updates the active tool state and UI indicators.
 * @param {string|number} tool - The target tool identifier.
 */
export function changeToolUI(tool) {
    clearToolsUI();
    document.querySelectorAll('.color-swatch').forEach(sw => sw.classList.remove('active'));
    
    let btn = document.querySelector(`.btn-tool[data-tool="${tool}"]`);
    if(!btn) return;

    btn.classList.remove('border-transparent', 'bg-slate-700');
    
    if (tool === 'hand') {
        btn.classList.add('border-amber-500', 'bg-amber-600'); 
        state.currentBrush = 'hand';
        changeLayerUI(null); 
    } else if (tool === '0') {
        btn.classList.add('border-white', 'bg-slate-500'); 
        state.currentBrush = 0; 
        
        if (state.activeLayer === null) {
            changeLayerUI(state.lastStandardLayer.toString());
        }
    }
    updateBackgroundButton(null); 
}

/**
 * Selects a color from the palette and updates the UI accordingly.
 * @param {string|number} id - The ID of the color palette swatch.
 */
export function selectColor(id) {
    if (state.activeLayer === null || state.activeLayer === 'spawn' || state.activeLayer === 'goal') {
        changeLayerUI('1'); 
    }
    
    state.currentBrush = parseInt(id);
    
    document.querySelectorAll('.color-swatch').forEach(sw => sw.classList.remove('active'));
    let swatch = document.querySelector(`.color-swatch[data-color="${id}"]`);
    if(swatch) swatch.classList.add('active');
    
    clearToolsUI();
    updateBackgroundButton(id); 
}

/**
 * Sets the current solid background color for the canvas based on active selection.
 */
export function setBackgroundColor() {
    if (state.activeLayer !== 'spawn' && state.activeLayer !== 'goal' && state.currentBrush !== 'hand' && state.currentBrush !== 0 && typeof state.currentBrush === 'number') {
        state.currentBackgroundColor = state.currentBrush;
    }
}

/**
 * Initializes the entire User Interface layout, bindings, and logic for metadata config.
 */
export function initUI() {
  const widthSlider = document.getElementById('in-width');
  const heightSlider = document.getElementById('in-height');
  const tileSlider = document.getElementById('in-tile');
  const widthVal = document.getElementById('val-width');
  const heightVal = document.getElementById('val-height');
  const tileVal = document.getElementById('val-tile');
  
  const checkBackground = document.getElementById('check-background');
  const imagePanel = document.getElementById('image-panel');
  const selImageLicense = document.getElementById('sel-image-license');
  const creditsPanel = document.getElementById('credits-panel');
  
  const selLevelLicense = document.getElementById('sel-level-license');
  const inLevelLicenseCustom = document.getElementById('in-level-license-custom');
  
  const checkMusic = document.getElementById('check-music');
  const musicPanel = document.getElementById('music-panel');
  const selMusicLicense = document.getElementById('sel-music-license');
  const musicCreditsPanel = document.getElementById('music-credits-panel');

  if (!widthSlider) return; 

  /**
   * Toggles required metadata fields based on license type selection.
   */
  function updateLicenseUI(value, creditsPanelElem, inputCustomElem, checkCopyrightElem) {
    const requiresCredit = ['copyright', 'cc-by', 'cc-by-sa', 'cc-by-nc', 'cc-by-nc-sa', 'cc-by-nd', 'mit', 'gpl', 'apache', 'other'].includes(value);
    
    if (creditsPanelElem) {
      if (requiresCredit) { 
        creditsPanelElem.classList.remove('hidden'); 
        creditsPanelElem.classList.add('flex'); 
      } else { 
        creditsPanelElem.classList.add('hidden'); 
        creditsPanelElem.classList.remove('flex'); 
      }
    }
    
    if (inputCustomElem) {
      if (value === 'other') {
        inputCustomElem.classList.remove('hidden');
        inputCustomElem.classList.add(inputCustomElem.tagName === 'INPUT' ? 'block' : 'flex');
      } else {
        inputCustomElem.classList.add('hidden');
        inputCustomElem.classList.remove('block', 'flex');
      }
    }
    
    if (checkCopyrightElem) {
      if (value === 'copyright') { 
        checkCopyrightElem.classList.remove('hidden'); 
        checkCopyrightElem.classList.add('block'); 
      } else { 
        checkCopyrightElem.classList.add('hidden'); 
        checkCopyrightElem.classList.remove('block'); 
      }
    }
  }

  /**
   * Calculates and updates the available tile dimensions dynamically 
   * based on map constraints to ensure perfect division.
   */
  function updateDivisors() {
    let w = parseInt(widthSlider.value);
    let h = parseInt(heightSlider.value);
    widthVal.innerText = w + " px";
    heightVal.innerText = h + " px";

    state.tileDivisors = [];
    for (let i = 5; i <= 100; i++) {
      if (w % i === 0 && h % i === 0) state.tileDivisors.push(i);
    }
    
    tileSlider.min = 0;
    tileSlider.max = state.tileDivisors.length - 1;
    
    let minDim = Math.min(w, h);
    let idealTarget = minDim <= 300 ? 10 : (minDim <= 500 ? 20 : (minDim <= 800 ? 30 : 40));

    let bestIndex = 0;
    let minDifference = Infinity;
    for (let i = 0; i < state.tileDivisors.length; i++) {
      let diff = Math.abs(state.tileDivisors[i] - idealTarget);
      if (diff < minDifference) {
        minDifference = diff;
        bestIndex = i;
      }
    }
    tileSlider.value = bestIndex;
    updateTileSize();
  }

  /**
   * Updates the UI display of the selected tile constraints.
   */
  function updateTileSize() {
    let index = parseInt(tileSlider.value);
    state.globalTileSize = state.tileDivisors[index];
    let cols = parseInt(widthSlider.value) / state.globalTileSize;
    let rows = parseInt(heightSlider.value) / state.globalTileSize;
    tileVal.innerText = state.globalTileSize + " px (" + cols + "x" + rows + ")";
  }

  // Event Bindings for Dimensions
  widthSlider.addEventListener('input', updateDivisors);
  heightSlider.addEventListener('input', updateDivisors);
  tileSlider.addEventListener('input', updateTileSize);

  // Level License Binding
  if (selLevelLicense) {
    selLevelLicense.addEventListener('change', (e) => updateLicenseUI(e.target.value, null, inLevelLicenseCustom, null));
  }

  // Background Image Bindings
  if (checkBackground) {
    checkBackground.addEventListener('change', (e) => {
      if (e.target.checked) { 
        imagePanel.classList.remove('hidden'); 
        imagePanel.classList.add('flex'); 
      } else { 
        imagePanel.classList.add('hidden'); 
        imagePanel.classList.remove('flex'); 
      }
    });
    selImageLicense.addEventListener('change', (e) => updateLicenseUI(e.target.value, creditsPanel, document.getElementById('group-custom-license'), document.getElementById('group-check-copyright')));
  }

  // Background Music Bindings
  if (checkMusic) {
    checkMusic.addEventListener('change', (e) => {
      if (e.target.checked) { 
        musicPanel.classList.remove('hidden'); 
        musicPanel.classList.add('flex'); 
      } else { 
        musicPanel.classList.add('hidden'); 
        musicPanel.classList.remove('flex'); 
      }
    });
    selMusicLicense.addEventListener('change', (e) => updateLicenseUI(e.target.value, musicCreditsPanel, document.getElementById('group-custom-music-license'), document.getElementById('group-check-music-copyright')));
  }

  updateDivisors();

  // Footer Year
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) yearSpan.innerText = new Date().getFullYear();

  // Multi-Language Support Bindings
  const flags = document.querySelectorAll('#lang-selector .flag-btn');
  
  function applyLanguage(lang) {
      setLanguage(lang);
      flags.forEach(b => b.classList.toggle('active', b.getAttribute('data-lang') === lang));
      window.history.replaceState(null, '', '?lang=' + lang);

      let mailLink = document.getElementById('bug-link');
      if (mailLink) mailLink.href = "mailto:hola@mparamos.com?subject=" + encodeURIComponent(getText('bug_subject'));

      document.querySelectorAll('[data-i18n]').forEach(el => {
          let translatedText = getText(el.getAttribute('data-i18n'));
          if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) el.placeholder = translatedText;
          else if (translatedText.includes('<')) el.innerHTML = translatedText;
          else el.textContent = translatedText;
      });
  }

  flags.forEach(btn => btn.addEventListener('click', () => applyLanguage(btn.getAttribute('data-lang'))));

  const urlParams = new URLSearchParams(window.location.search);
  applyLanguage(['es', 'en', 'fr'].includes(urlParams.get('lang')) ? urlParams.get('lang') : 'es');

  // Palette Generation
  const paletteContainer = document.getElementById('palette-container');
  if (paletteContainer && palette) {
      for (let i = 1; i <= 64; i++) {
          let divC = document.createElement('div');
          divC.className = 'color-swatch';
          divC.style.backgroundColor = palette[i]; 
          divC.setAttribute('data-color', i);
          divC.onclick = () => selectColor(i);
          paletteContainer.appendChild(divC);
      }
  }

  // Mobile Tabs bindings
  document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
          let wasActive = btn.classList.contains('border-b-2');
          document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('text-sky-400', 'border-sky-400', 'border-b-2'));
          document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active-tab'));
          
          if (!wasActive) {
              btn.classList.add('text-sky-400', 'border-sky-400', 'border-b-2');
              document.getElementById(btn.getAttribute('data-tab')).classList.add('active-tab');
          }
      });
  });

  // Tools & Layer button bindings
  document.querySelectorAll('.btn-layer').forEach(btn => btn.addEventListener('click', () => changeLayerUI(btn.getAttribute('data-layer'))));
  document.querySelectorAll('.btn-tool').forEach(btn => btn.addEventListener('click', () => changeToolUI(btn.getAttribute('data-tool'))));

  // File selection UI updates
  document.getElementById('in-image-file').addEventListener('change', (e) => document.getElementById('txt-in-image-file').textContent = e.target.files.length > 0 ? e.target.files[0].name : "Sin archivo");
  document.getElementById('in-music-file').addEventListener('change', (e) => document.getElementById('txt-in-music-file').textContent = e.target.files.length > 0 ? e.target.files[0].name : "Sin archivo");
  
  changeToolUI('hand');
}