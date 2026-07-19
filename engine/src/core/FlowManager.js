/**
 * @file FlowManager.js
 * @description Maneja el flujo de escenas basado en el game_config.json.
 */

export class FlowManager {
    constructor(engine) {
        this.engine = engine;
        this.config = null;
        this.currentPlayableIndex = 0;
    }

    async loadConfig(url) {
        try {
            const response = await fetch(url);
            this.config = await response.json();
        } catch (error) {
            console.error("Error loading game configuration:", error);
        }
    }
    
    /**
     * Start the first PlayableLevel defined in the configuration.
     */
    startPlayableLevels() {
        if (!this.config || !this.config.PlayableLevels || this.config.PlayableLevels.length === 0) {
            console.error("No PlayableLevels defined in game_config.json");
            return;
        }
        
        this.currentPlayableIndex = 0;
        this.loadPlayableLevel(this.currentPlayableIndex);
    }
    
    /**
     * Load a specific PlayableLevel by index
     */
    async loadPlayableLevel(index) {
        if (index >= this.config.PlayableLevels.length) {
            // Juego completado
            console.log("All PlayableLevels completed!");
            // this.engine.game.scene.start('CreditsScene'); // Ejemplo
            return;
        }
        
        const levelData = this.config.PlayableLevels[index];
        const path = `game-levels/${levelData.levelPath}`;
        
        try {
            // Fetch the .zip file as a Blob
            const response = await fetch(path);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const blob = await response.blob();
            
            // Create a File object from the Blob to maintain compatibility with JSZip/GameLevelScene
            const file = new File([blob], levelData.levelPath, { type: 'application/zip' });
            
            // Pass it to the GameLevelScene
            this.engine.game.scene.start('GameLevelScene', { zipFile: file });
        } catch (error) {
            console.error("Error loading level zip:", error);
        }
    }
}
