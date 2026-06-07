/**
 * @file config.js
 * @description Global configuration state for the Yag2Dpg engine.
 * Handles persistent variables such as audio levels across sessions.
 * @author Miguel Páramos
 */

window.GameConfig = {
    /**
     * Retrieves the saved music volume from localStorage (default 50%).
     * @type {number}
     */
    musicVolume: localStorage.getItem('yag2dpg_music_volume') !== null 
        ? parseFloat(localStorage.getItem('yag2dpg_music_volume')) 
        : 0.5,
        
    /**
     * Retrieves the saved SFX volume from localStorage (default 50%).
     * @type {number}
     */
    sfxVolume: localStorage.getItem('yag2dpg_sfx_volume') !== null 
        ? parseFloat(localStorage.getItem('yag2dpg_sfx_volume')) 
        : 1
};