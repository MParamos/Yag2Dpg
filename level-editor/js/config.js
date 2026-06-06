/**
 * @file config.js
 * @description Global configuration and state management module for the Yag2Dpg Level Editor.
 * Centralizes the application state, constants, and color palette definitions to ensure
 * consistent data flow across all modules.
 * @author Miguel Páramos
 */

export const palette = {
  1: '#8B0000', 2: '#B22222', 3: '#FF0000', 4: '#FF4500', 5: '#FF6347', 6: '#FA8072', 7: '#E9967A', 8: '#BC8F8F',
  9: '#FF8C00', 10: '#FFA500', 11: '#FFD700', 12: '#FFFF00', 13: '#F0E68C', 14: '#EEE8AA', 15: '#BDB76B', 16: '#DAA520',
  17: '#006400', 18: '#228B22', 19: '#32CD32', 20: '#00FF00', 21: '#98FB98', 22: '#90EE90', 23: '#8FBC8F', 24: '#2E8B57',
  25: '#008B8B', 26: '#00CED1', 27: '#00FFFF', 28: '#E0FFFF', 29: '#4682B4', 30: '#4169E1', 31: '#0000FF', 32: '#00008B',
  33: '#4B0082', 34: '#800080', 35: '#8A2BE2', 36: '#9370DB', 37: '#D8BFD8', 38: '#FF00FF', 39: '#C71585', 40: '#DB7093',
  41: '#FFC0CB', 42: '#FFB6C1', 43: '#FF69B4', 44: '#8B4513', 45: '#A0522D', 46: '#D2691E', 47: '#CD853F', 48: '#DEB887',
  49: '#2F4F4F', 50: '#708090', 51: '#778899', 52: '#A9A9A9', 53: '#C0C0C0', 54: '#D3D3D3', 55: '#E5E4E2', 56: '#FFFFFF',
  57: '#000000', 58: '#333333', 59: '#666666', 60: '#999999', 61: '#FF5733', 62: '#33FF57', 63: '#3357FF', 64: '#F333FF'
};

export const MAX_HISTORY = 30;

export const state = {
  tileDivisors: [],
  globalTileSize: 40,
  currentBackgroundColor: 57,
  
  rows: 0,
  columns: 0,
  tileSize: 0,
  
  editorMap: [ [], [], [] ],
  activeLayer: 1,
  lastStandardLayer: 1,
  currentBrush: 'hand',
  paletteHeight: 170,
  editorStarted: false,
  
  levelData: { author: '', email: '', url: '', license: '' },
  
  // Background Image
  originalBackgroundImage: null,
  backgroundExtension: '',
  backgroundMetadata: { inUse: false, license: '', author: '', url: '' },
  backgroundImageObj: null,
  currentBackgroundUrl: null,
  opacitySliderDom: null,
  backgroundOpacity: 50,

  // Background Music
  originalMusicFile: null,
  musicExtension: '',
  musicMetadata: { inUse: false, title: '', license: '', author: '', url: '' },
  
  // Logic Markers & History
  spawnPoints: [],
  goalPoints: [],
  history: [],
  historyIndex: -1,
  modifiedInCurrentStroke: false,
  
  // Camera
  sidebarWidth: 0,
  camX: 50,
  camY: 50,
  zoom: 1.0
};