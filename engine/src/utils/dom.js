/**
 * @file dom.js
 * @description Utilidades del DOM para el motor YAGCE.
 */

/**
 * Abre una ventana de selección de archivos del sistema operativo para elegir un .zip.
 * @returns {Promise<File|null>} El archivo seleccionado, o null si se cancela.
 */
export function promptForExternalZip() {
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.zip';
        
        input.onchange = (e) => {
            if (e.target.files && e.target.files.length > 0) {
                resolve(e.target.files[0]);
            } else {
                resolve(null);
            }
        };
        
        // Simular clic para abrir la ventana
        input.click();
    });
}
