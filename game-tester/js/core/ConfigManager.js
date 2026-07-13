/**
 * @file ConfigManager.js
 * @description Global static configuration manager. Handles persistent 
 * engine state (like audio levels) via localStorage to maintain separation of concerns.
 */
class ConfigManager {
    /**
     * Retrieves the persistent music volume. Defaults to 0.5 (50%).
     * @returns {number}
     */
    static get musicVolume() {
        let vol = localStorage.getItem('yagce_music_volume');
        return vol !== null ? parseFloat(vol) : 0.5;
    }

    /**
     * Saves the music volume to local storage.
     * @param {number} value - The volume level (0.0 to 1.0).
     */
    static set musicVolume(value) {
        localStorage.setItem('yagce_music_volume', value);
    }

    /**
     * Retrieves the persistent SFX volume. Defaults to 1.0 (100%).
     * @returns {number}
     */
    static get sfxVolume() {
        let vol = localStorage.getItem('yagce_sfx_volume');
        return vol !== null ? parseFloat(vol) : 1.0;
    }

    /**
     * Saves the SFX volume to local storage.
     * @param {number} value - The volume level (0.0 to 1.0).
     */
    static set sfxVolume(value) {
        localStorage.setItem('yagce_sfx_volume', value);
    }

    /**
     * Retrieves the persistent Pause on Blur setting. Defaults to false.
     * @returns {boolean}
     */
    static get pauseOnBlur() {
        let val = localStorage.getItem('yagce_pause_blur');
        return val !== null ? (val === 'true') : false;
    }

    /**
     * Saves the Pause on Blur setting to local storage.
     * @param {boolean} value
     */
    static set pauseOnBlur(value) {
        localStorage.setItem('yagce_pause_blur', value);
    }
}