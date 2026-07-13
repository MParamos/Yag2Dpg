/**
 * @file storage.js
 * @description Export and file management system for the Yagce Level Editor.
 * Handles the packaging of level data, including metadata, map arrays, and assets 
 * (images, music) into a downloadable ZIP file.
 * @author Miguel Páramos
 */

import { state } from './config.js';
import { showAlert } from './ui.js';
import { initializeMapMatrix, saveState } from './editor.js';
import { getText } from './i18n.js';

/**
 * Compiles the current level data and assets, generating a ZIP file for download.
 * Validates the existence of at least one spawn and one goal point before proceeding.
 */
export async function executeSave() {
  if (state.spawnPoints.length === 0 || state.goalPoints.length === 0) {
    showAlert('err_spawngoal');
    return;
  }
  
  let fileName = prompt(getText('prompt_nombre'), "level_1");
  if (fileName !== null && fileName.trim() !== "") {
    
    let mapName = fileName.trim().replace(/\s+/g, '_');
    let cleanAuthorName = state.levelData.author.trim().replace(/\s+/g, '_');
    let zipFolderName = `${mapName}_-_${cleanAuthorName}`;

    let zip = new JSZip(); // Relies on the global script imported in index.html
    let rootFolder = zip.folder(zipFolderName);

    // Generate map.js content
    let exportMap = `let backgroundColor = ${state.currentBackgroundColor};\n`;
    if (state.backgroundMetadata.inUse) exportMap += `let backgroundImage = 'img/background.${state.backgroundExtension}';\n`;
    if (state.backgroundMetadata.inUse) exportMap += `let backgroundOpacity = ${state.backgroundOpacity};\n`;
    if (state.musicMetadata.inUse) exportMap += `let backgroundMusic = 'music/background.${state.musicExtension}';\n`;
    exportMap += `let tileSize = ${state.globalTileSize};\n`;
    exportMap += `let mapWidth = ${state.columns * state.globalTileSize};\n`;
    exportMap += `let mapHeight = ${state.rows * state.globalTileSize};\n`;
    
    let spawnStrings = state.spawnPoints.map(p => `[${p.j}, ${p.i}]`).join(", ");
    let goalStrings = state.goalPoints.map(p => `[${p.j}, ${p.i}]`).join(", ");
    exportMap += `let spawnPoints = [${spawnStrings}];\n`;
    exportMap += `let goalPoints = [${goalStrings}];\n\n`;
    
    exportMap += `let map = [\n`;
    for (let z = 0; z < 3; z++) {
      exportMap += "  [\n"; 
      for (let i = 0; i < state.rows; i++) {
        exportMap += "    [" + state.editorMap[z][i].join(", ") + "]";
        if (i < state.rows - 1) exportMap += ",\n";
        else exportMap += "\n";
      }
      exportMap += "  ]";
      if (z < 2) exportMap += ",\n"; 
      else exportMap += "\n";
    }
    exportMap += "];\n";
    rootFolder.file("map.js", exportMap);

    // Generate LICENSE.txt content
    let exportLicense = `Map for the Yagce game, created with the level editor at https://www.mparamos.com/games/Yagce/editor\n\n`;
    exportLicense += `mapVersion = 0.0.1\n`;
    exportLicense += `-- Level Data --\n`;
    exportLicense += `Author: ${state.levelData.author}\n`;
    exportLicense += `Email: ${state.levelData.email}\n`;
    if (state.levelData.url) exportLicense += `Website: ${state.levelData.url}\n`;
    exportLicense += `License: ${state.levelData.license}\n`;
    exportLicense += `Spawn Points marked: ${state.spawnPoints.length}\n`;
    exportLicense += `Goal Points marked: ${state.goalPoints.length}\n`;
    exportLicense += `Creation Date: ${new Date().toLocaleString()}\n`;

    if (state.backgroundMetadata.inUse && state.originalBackgroundImage) {
        exportLicense += `\n-- Background Image Information --\n`;
        exportLicense += `License: ${state.backgroundMetadata.license}\n`;
        if (state.backgroundMetadata.author) exportLicense += `Author: ${state.backgroundMetadata.author}\n`;
        if (state.backgroundMetadata.url) exportLicense += `URL: ${state.backgroundMetadata.url}\n`;
    }

    if (state.musicMetadata.inUse && state.originalMusicFile) {
        exportLicense += `\n-- Background Music Information --\n`;
        exportLicense += `Title: ${state.musicMetadata.title}\n`;
        exportLicense += `License: ${state.musicMetadata.license}\n`;
        if (state.musicMetadata.author) exportLicense += `Author: ${state.musicMetadata.author}\n`;
        if (state.musicMetadata.url) exportLicense += `URL: ${state.musicMetadata.url}\n`;
    }
    
    rootFolder.file("LICENSE.txt", exportLicense);

    // Process background image
    if (state.backgroundMetadata.inUse && state.originalBackgroundImage) {
        let imgFolder = rootFolder.folder("img");
        let arrayBuffer = await state.originalBackgroundImage.arrayBuffer();
        imgFolder.file(`background.${state.backgroundExtension}`, arrayBuffer);
    }

    // Process background music
    if (state.musicMetadata.inUse && state.originalMusicFile) {
        let musicFolder = rootFolder.folder("music");
        let musicArrayBuffer = await state.originalMusicFile.arrayBuffer();
        musicFolder.file(`background.${state.musicExtension}`, musicArrayBuffer);
    }

    // Generate and download ZIP
    zip.generateAsync({ type: "blob" }).then(function(content) {
        const url = URL.createObjectURL(content);
        const hiddenLink = document.createElement('a');
        hiddenLink.href = url;
        hiddenLink.download = `${zipFolderName}.zip`;
        document.body.appendChild(hiddenLink);
        hiddenLink.click();
        document.body.removeChild(hiddenLink);
        URL.revokeObjectURL(url);
    });
  }
}

/**
 * Clears the current map arrays and logical markers.
 * Prompts the user for confirmation before executing.
 */
export function executeReset() {
  if (confirm(getText('conf_reset'))) {
    initializeMapMatrix();
    state.spawnPoints = [];
    state.goalPoints = [];
    state.history = [];
    state.historyIndex = -1;
    saveState(); 
  }
}

/**
 * Discards the current level and reloads the application.
 * Prompts the user for confirmation before executing.
 */
export function executeDiscard() {
  if (confirm(getText('conf_discard'))) {
    location.reload(); 
  }
}