/**
 * @file game.js
 * @description Application entry point. Initializes the YAGCE Game Engine.
 */

import { YagceEngine } from '../engine/src/index.js';

window.onload = async () => {
    // 1. Instanciamos el motor apuntando al JSON de configuración
    const game = new YagceEngine('game_config.json');
    
    // 2. Iniciamos el motor
    await game.start();
    
    // Exponer de forma global por si es necesario para debugging y para el FlowManager
    window.game = game.game; // game.game será la instancia interna de Phaser cuando se cree
    window.yagce = game;
};