/**
 * @file GameScene.js
 * @description Core gameplay scene. Parses the ZIP level package and renders 
 * the 3D map matrix according to La Hermandad del Silicio standards.
 * @author Miguel Páramos
 */
class GameLevelScene extends Scene {
    #zipFile;
    #levelData;
    #isLoading;
    #loadError;
    #btnSettings;
    #modalQuit;
    #modalRestart;
    #btnRestart;
    #isQuitModalOpen;
    #isRestartModalOpen;
    #ui;

    /**
     * @param {File} zipFile - The raw .zip file object selected by the user.
     */
    constructor(zipFile = null) {
        super('game_level', null);
        this.#zipFile = zipFile;
        this.#levelData = null;
        this.#isLoading = true;
        this.#loadError = null;
        this.#isQuitModalOpen = false;
        this.#isRestartModalOpen = false;
        this.#ui = new GUIManager();

        this.levelBlocks = null;
        this.player = null;
    }

    get isQuitModalOpen() { return this.#isQuitModalOpen; }

    setup() {
        world.gravity.y = 9.8;

        this.#btnSettings = new MenuButton(width - 40, 40, 50, 50, "⚙️", () => { sceneManager.settings.toggle(); });
        this.#ui.add(this.#btnSettings);

        this.#modalQuit = new ModalPanel(
            I18n.getText('quit_title'),
            I18n.getText('quit_yes'),
            I18n.getText('quit_no'),
            () => { sceneManager.changeScene(new MainMenuScene()); },
            () => { this.#toggleQuitModal(); },
            '#ef4444' // Red border for quit
        );

        this.#btnRestart = new MenuButton(width - 100, 40, 50, 50, "🔄", () => { this.#toggleRestartModal(); });
        this.#ui.add(this.#btnRestart);

        this.#modalRestart = new ModalPanel(
            "¿Deseas reiniciar el nivel?",
            I18n.getText('restart_yes'),
            I18n.getText('quit_no'),
            () => { sceneManager.changeScene(new GameLevelScene(this.#zipFile)); },
            () => { this.#toggleRestartModal(); },
            '#ef4444' // Red border for restart
        );

        camera.zoom = 3;

        this.windowResized();

        // Ocultar footer web automáticamente si está visible
        let footerContent = document.getElementById('footer-content');
        if (footerContent && !footerContent.classList.contains('max-h-0')) {
            let footerToggle = document.getElementById('footer-toggle');
            if (footerToggle) footerToggle.click();
        }

        // Arranca la descompresión y lectura asíncrona
        this.#loadLevelFromZip(this.#zipFile);
    }

    async #loadLevelFromZip(file) {
        if (!file) {
            this.#loadError = "No file provided. System halted.";
            this.#isLoading = false;
            return;
        }

        try {
            // Aquí está la clave: delegamos el trabajo sucio a LevelData
            this.#levelData = await LevelData.fromZip(file);

            // Si el nivel traía música, inyectamos la pista en la escena y la disparamos
            if (this.#levelData.bgMusic) {
                this.setMusic(this.#levelData.bgMusic);
                this.playMusic();
            }

            this.#generateWorld();

            this.#isLoading = false;
            console.log("[GameLevelScene] Matrix Architecture successfully injected.");
        } catch (err) {
            this.#loadError = err.message;
            this.#isLoading = false;
            console.error("[GameLevelScene] Extraction Failed:", err);
        }
    }

    #generateWorld() {
        this.levelBlocks = new Group();

        let ts = this.#levelData.tileSize;
        let layers = this.#levelData.mapLayers;

        if (Array.isArray(layers) && layers.length > 0) {
            for (let l = 0; l < layers.length; l++) {
                let isMiddle = (l === 1);
                let matrix = layers[l];

                if (!Array.isArray(matrix)) continue;

                for (let r = 0; r < matrix.length; r++) {
                    if (!Array.isArray(matrix[r])) continue;

                    for (let c = 0; c < matrix[r].length; c++) {
                        let tileId = matrix[r][c];

                        if (tileId > 0) {
                            let cx = c * ts + ts / 2;
                            let cy = r * ts + ts / 2;

                            let block = new Block(cx, cy, ts, tileId);
                            // Las capas de p5.play (Z-index). Fondo (0), Jugador y colisiones (1), Frente (2)
                            block.sprite.layer = l;

                            if (!isMiddle) {
                                block.sprite.collider = 'none'; // No colisiona
                                let col = color(LevelData.PALETTE[tileId] || '#FF00FF');
                                col.setAlpha(178); // 70% opacidad
                                block.sprite.color = col;
                            }

                            this.levelBlocks.add(block.sprite);
                        }
                    }
                }
            }
        }

        // Instanciar el Player
        let startX = width / 2;
        let startY = 0; // Arriba por defecto

        if (this.#levelData.spawnPoints && this.#levelData.spawnPoints.length > 0) {
            let sp = this.#levelData.spawnPoints[0];
            // sp suele tener x, y o c, r. Si tiene c, r:
            startX = (sp.c !== undefined ? sp.c : 0) * ts + ts / 2;
            startY = (sp.r !== undefined ? sp.r : 0) * ts + ts / 2;
        }

        this.player = new Player(startX, startY);
        this.player.sprite.layer = 1; // Capa del medio

        // --- MUROS INVISIBLES DE FÍSICA ---
        // Obtenemos el ancho del mapa de forma segura
        let mapCols = (layers && layers[0] && layers[0][0]) ? layers[0][0].length : 0;
        let mapPxWidth = mapCols * ts;
        
        // Muro Izquierdo
        let wallLeft = new Sprite(0, height / 2, 10, height * 10, 'static');
        wallLeft.color = '#00000000'; // Transparente
        wallLeft.strokeWeight = 0;
        wallLeft.layer = 1;
        this.levelBlocks.add(wallLeft);

        // Muro Derecho
        let wallRight = new Sprite(mapPxWidth, height / 2, 10, height * 10, 'static');
        wallRight.color = '#00000000'; // Transparente
        wallRight.strokeWeight = 0;
        wallRight.layer = 1;
        this.levelBlocks.add(wallRight);
    }

    #toggleQuitModal() {
        if (this.#isRestartModalOpen) this.#toggleRestartModal();
        this.#isQuitModalOpen = !this.#isQuitModalOpen;
        
        if (this.#isQuitModalOpen) {
            this.#ui.add(this.#modalQuit);
        } else {
            this.#ui.remove(this.#modalQuit);
        }
    }

    #toggleRestartModal() {
        if (this.#isQuitModalOpen) this.#toggleQuitModal();
        this.#isRestartModalOpen = !this.#isRestartModalOpen;
        
        if (this.#isRestartModalOpen) {
            this.#ui.add(this.#modalRestart);
        } else {
            this.#ui.remove(this.#modalRestart);
        }
    }

    isPaused() {
        return this.#isQuitModalOpen || this.#isRestartModalOpen || (sceneManager.settings && sceneManager.settings.isOpen);
    }

    onEscape() {
        // Esc actúa como "No" si algún modal está abierto
        if (this.#isRestartModalOpen) {
            this.#modalRestart.btnRight.simulateClick();
            return true;
        }
        if (this.#isQuitModalOpen) {
            this.#modalQuit.btnRight.simulateClick();
            return true;
        }
        // Si no hay ninguno abierto, abrimos el de salir
        this.#toggleQuitModal();
        return true;
    }

    hasBlockingModal() {
        return this.#isQuitModalOpen || this.#isRestartModalOpen;
    }

    draw() {
        if (this.#isLoading) {
            background('#0f172a');
            fill('#38bdf8'); noStroke(); textAlign(CENTER, CENTER); textSize(24);
            text("Extracting Matrix Architecture...", width / 2, height / 2);
            return;
        }

        if (this.#loadError) {
            background('#0f172a');
            fill('#ef4444'); noStroke(); textAlign(CENTER, CENTER); textSize(18);
            // Usamos tu nueva utilidad para que los errores largos no se salgan
            GUITools.drawWrappedText("ERROR:\n" + this.#loadError, width / 2, height / 2 - 40, width * 0.8, 25);
            return;
        }

        // 1. Color de fondo base (Se queda fijo, no se mueve con la cámara)
        background(color(this.#levelData.bgColor || '#000000'));

        // === GESTIÓN DE PAUSA GLOBAL ===
        if (this.isPaused()) {
            world.timeScale = 0; // Congela físicas y animaciones de Sprites
            
            // Atajos rápidos para contestar Modales (Intro = Sí)
            let isSettingsOpen = sceneManager && sceneManager.settings && sceneManager.settings.isOpen;
            if (!isSettingsOpen) {
                if (kb.presses('enter')) {
                    if (this.#isQuitModalOpen) this.#modalQuit.btnLeft.simulateClick();
                    else if (this.#isRestartModalOpen) this.#modalRestart.btnLeft.simulateClick();
                }
            }
        } else {
            world.timeScale = 1;
            if (kb.presses('r') || kb.presses('R')) {
                this.#toggleRestartModal();
            }
        }

        // === ACTUALIZACIÓN DEL JUGADOR ===
        if (!this.isPaused() && this.player) {
            this.player.update();
        }



        // 2. Imagen de fondo con Parallax (Dibujada en espacio de pantalla)
        if (this.#levelData && this.#levelData.bgImage) {
            push();

            let viewW = width / camera.zoom;
            let viewH = height / camera.zoom;

            let ts = this.#levelData.tileSize || 10;
            let gridCols = (this.#levelData.mapLayers && this.#levelData.mapLayers[0] && this.#levelData.mapLayers[0][0]) ? this.#levelData.mapLayers[0][0].length : 0;
            let gridRows = (this.#levelData.mapLayers && this.#levelData.mapLayers[0]) ? this.#levelData.mapLayers[0].length : 0;
            let pxWidth = gridCols * ts;
            let pxHeight = gridRows * ts;

            let camMinX = viewW / 2;
            let camMaxX = pxWidth - viewW / 2;
            if (camMaxX < camMinX) camMaxX = camMinX;

            let camMinY = viewH / 2;
            let camMaxY = pxHeight - viewH / 2;
            if (camMaxY < camMinY) camMaxY = camMinY;

            // Calculamos el ratio directamente respecto al mapa total, sin limitar por cámara,
            // para que el desplazamiento del fondo no se detenga en los bordes.
            let scrollRatioX = (pxWidth === 0) ? 0.5 : camera.x / pxWidth;
            let scrollRatioY = (pxWidth === 0) ? 0.5 : camera.y / pxHeight; // Fallback if no height

            // El fondo debe ser un poco más grande que la pantalla para hacer el efecto parallax.
            // Digamos un 30% más grande.
            let bgW = width * 1.3;
            let bgH = height * 1.3;

            // En scrollRatio = 0, bgX = 0. En scrollRatio = 1, bgX = width - bgW (lo que sobra)
            let bgX = -scrollRatioX * (bgW - width);
            let bgY = -scrollRatioY * (bgH - height);

            let rawOpacity = this.#levelData.bgOpacity !== undefined ? this.#levelData.bgOpacity : 100;
            drawingContext.globalAlpha = rawOpacity > 1 ? rawOpacity / 100 : rawOpacity;

            imageMode(CORNER);
            image(this.#levelData.bgImage, bgX, bgY, bgW, bgH);
            pop();
        }

        // 3. Matrices del mapa ya no se dibujan aquí.
        // p5.play dibujará los Sprites (Block y Player) automáticamente.
        if (!this.levelBlocks || this.levelBlocks.length === 0) {
            // Un chivato visual por si mapLayers llega vacío
            fill('#FF0000');
            textSize(20);
            text("NO LAYERS DETECTED", width / 2, height / 2);
        }

        // === DIBUJAR SPRITES EN ESPACIO DE MUNDO ===
        // Activamos la cámara para que p5.play aplique zoom y posición al dibujar los Sprites.
        camera.on();
        allSprites.draw();
        camera.off(); // Desactivamos para que la interfaz se dibuje normal en pantalla.

        // Modales y Botones se pintan usando el GUIManager en el orden correcto
        this.#ui.update();
        this.#ui.draw();
    }

    windowResized() {
        if (this.#btnSettings) this.#btnSettings.x = width - 40;
        if (this.#btnRestart) this.#btnRestart.x = width - 100;
        
        if (this.#modalQuit) this.#modalQuit.windowResized();
        if (this.#modalRestart) this.#modalRestart.windowResized();
    }
}