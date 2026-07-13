/**
 * @file LevelData.js
 * @description Data structure and parser for Yagce levels.
 * Handles in-memory ZIP extraction and ES6 Module dynamic loading.
 * Provides Blob URLs for Phaser's Loader to ingest.
 * @author Miguel Páramos
 */
class LevelData {
    static PALETTE = {
        1: '#8B0000', 2: '#B22222', 3: '#FF0000', 4: '#FF4500', 5: '#FF6347', 6: '#FA8072', 7: '#E9967A', 8: '#BC8F8F',
        9: '#FF8C00', 10: '#FFA500', 11: '#FFD700', 12: '#FFFF00', 13: '#F0E68C', 14: '#EEE8AA', 15: '#BDB76B', 16: '#DAA520',
        17: '#006400', 18: '#228B22', 19: '#32CD32', 20: '#00FF00', 21: '#98FB98', 22: '#90EE90', 23: '#8FBC8F', 24: '#2E8B57',
        25: '#008B8B', 26: '#00CED1', 27: '#00FFFF', 28: '#E0FFFF', 29: '#4682B4', 30: '#4169E1', 31: '#0000FF', 32: '#00008B',
        33: '#4B0082', 34: '#800080', 35: '#8A2BE2', 36: '#9370DB', 37: '#D8BFD8', 38: '#FF00FF', 39: '#C71585', 40: '#DB7093',
        41: '#FFC0CB', 42: '#FFB6C1', 43: '#FF69B4', 44: '#8B4513', 45: '#A0522D', 46: '#D2691E', 47: '#CD853F', 48: '#DEB887',
        49: '#2F4F4F', 50: '#708090', 51: '#778899', 52: '#A9A9A9', 53: '#C0C0C0', 54: '#D3D3D3', 55: '#E5E4E2', 56: '#FFFFFF',
        57: '#000000', 58: '#333333', 59: '#666666', 60: '#999999', 61: '#FF5733', 62: '#33FF57', 63: '#3357FF', 64: '#F333FF'
    };

    constructor() {
        this.licenseMetadata = {};
        this.mapWidth = 0;
        this.mapHeight = 0;
        this.tileSize = 0;
        this.spawnPoints = [];
        this.goalPoints = [];
        this.mapLayers = []; 
        this.bgImageUrl = null;
        this.bgMusicUrl = null;
        this.bgColor = '#000000';
        this.bgOpacity = 1.0;
    }

    /**
     * Factory method. Asynchronously parses a .zip file and returns a populated LevelData instance.
     * @param {File} file - The .zip File object from the input picker.
     * @returns {Promise<LevelData>}
     */
    static async fromZip(file) {
        let instance = new LevelData();
        const zip = await JSZip.loadAsync(file);

        // 1. Identify the root folder (e.g., LevelName-Author/)
        let rootFolder = Object.keys(zip.files).find(path => path.endsWith('/'));
        if (!rootFolder) throw new Error("Invalid level structure: Root directory missing.");

        // 2. Parse LICENSE.txt
        let licenseFile = zip.file(rootFolder + 'LICENSE.txt');
        if (licenseFile) {
            let licenseText = await licenseFile.async('string');
            instance.licenseMetadata = LevelData.#parseLicense(licenseText);
        } else {
            throw new Error("Invalid Level: LICENSE.txt is mandatory.");
        }

        // 3. Parse map.js
        let mapFile = zip.file(rootFolder + 'map.js');
        if (mapFile) {
            let mapText = await mapFile.async('string');
            
            if (!mapText.includes('export ')) {
                mapText += `
                export default {
                    backgroundColor: typeof backgroundColor !== 'undefined' ? backgroundColor : null,
                    backgroundImage: typeof backgroundImage !== 'undefined' ? backgroundImage : null,
                    backgroundOpacity: typeof backgroundOpacity !== 'undefined' ? backgroundOpacity : null,
                    backgroundMusic: typeof backgroundMusic !== 'undefined' ? backgroundMusic : null,
                    tileSize: typeof tileSize !== 'undefined' ? tileSize : null,
                    mapWidth: typeof mapWidth !== 'undefined' ? mapWidth : null,
                    mapHeight: typeof mapHeight !== 'undefined' ? mapHeight : null,
                    spawnPoints: typeof spawnPoints !== 'undefined' ? spawnPoints : [],
                    goalPoints: typeof goalPoints !== 'undefined' ? goalPoints : [],
                    map: typeof map !== 'undefined' ? map : []
                };`;
            }

            const blob = new Blob([mapText], { type: 'application/javascript' });
            const url = URL.createObjectURL(blob);
            
            try {
                const moduleNamespace = await import(url);
                const mapData = moduleNamespace.default || moduleNamespace;
                
                instance.tileSize = mapData.tileSize;
                instance.mapWidth = mapData.mapWidth;
                instance.mapHeight = mapData.mapHeight;
                instance.spawnPoints = mapData.spawnPoints || [];
                instance.goalPoints = mapData.goalPoints || [];
                
                instance.mapLayers = mapData.map || mapData.mapLayers || [];
                
                if (mapData.backgroundColor) instance.bgColor = mapData.backgroundColor;
                if (mapData.backgroundOpacity !== undefined) instance.bgOpacity = mapData.backgroundOpacity;
            } catch (e) {
                throw new Error("Failed to parse map.js structure. Ensure it has correct ES6 exports.");
            } finally {
                URL.revokeObjectURL(url);
            }
        } else {
            throw new Error("Invalid Level: map.js is mandatory.");
        }

        // 4. Extract Background Image as Blob URL
        let imgRegex = new RegExp(`^${rootFolder}img/background\\.(png|jpg|jpeg|webp|gif)$`, 'i');
        let imgPath = Object.keys(zip.files).find(path => imgRegex.test(path));
        if (imgPath) {
            let imgBlob = await zip.file(imgPath).async('blob');
            instance.bgImageUrl = URL.createObjectURL(imgBlob);
        }

        // 5. Extract Background Music as Blob URL
        let musicRegex = new RegExp(`^${rootFolder}music/background\\.(mp3|wav|ogg)$`, 'i');
        let musicPath = Object.keys(zip.files).find(path => musicRegex.test(path));
        if (musicPath) {
            let musicBlob = await zip.file(musicPath).async('blob');
            instance.bgMusicUrl = URL.createObjectURL(musicBlob);
        }

        return instance;
    }

    /**
     * Parses the custom text block format of the license file.
     * @private
     */
    static #parseLicense(text) {
        let parsed = {};
        let sections = text.split(/--\s*(.*?)\s*--/);
        for (let i = 1; i < sections.length; i += 2) {
            let title = sections[i].trim();
            let content = sections[i+1].trim();
            parsed[title] = content;
        }
        return parsed;
    }
}