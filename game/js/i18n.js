/**
 * @file i18n.js
 * @description Internationalization dictionary specific to the Yag2Dpg engine environment.
 * Contains translated strings for the footer UI (licenses, credits, privacy) 
 * and the q5play canvas overlay (game instructions).
 * @author Miguel Páramos
 */

const currentLangDictionary = {
    es: {
        credits_title: "Miguel Páramos - Yet another generic 2D platformer game (Yag2Dpg)",
        credits_license1: "Distribuido bajo licencia",
        credits_license2: "Por favor, dar atribución con enlace a",
        credits_license3: "Creado con",
        credits_and: " y ",
        credits_source: "Descarga el código fuente aquí",
        credits_privacy: "Este editor de niveles solo usa cookies esenciales, toda tu información se almacena de forma local, y no se almacena en mi servidor ni se transmite a terceros, ni se usa para fines comerciales en modo alguno.",
        credits_bug: "¿Has encontrado algún error? Por favor escríbeme a ",
        credits_bug2: " para que pueda arreglarlo.",
        game_hello: "Yag2Dpg - Hola Mundo",
        game_instructions: "Haz clic en cualquier parte para crear cajas",
        bug_subject: "Bug detectado en Yag2Dpg",
        menu_subtitle: "Yet another generic 2D platformer game",
        menu_button_load: "Cargar nivel de juego",
        options_title: "Opciones",
        options_music_vol: "Música",
        options_sfx_vol: "Efectos (SFX)",
        options_close: "[ Haz clic fuera o pulsa ESC para cerrar ]",
        menu_press_start: "Haz clic o pulsa cualquier tecla para comenzar",
        menu_button_credits: "Créditos",
        credits_back: "Atrás",
        credits_role_dev: "Desarrollador y Diseño Principal",
        credits_role_ai: "Asistente IA (Basada en Google Gemini)",
        credits_music: "Música Original",
        credits_sfx: "Efectos de Sonido (SFX)",
        credits_libs: "Motor y Librerías",
    },
    en: {
        credits_title: "Miguel Páramos - Yet another generic 2D platformer game (Yag2Dpg)",
        credits_license1: "Distributed under",
        credits_license2: "Please provide attribution with a link to",
        credits_license3: "Built with",
        credits_and: " and ",
        credits_source: "Download the source code here",
        credits_privacy: "This level editor only uses essential cookies, all your information is stored locally, and is not stored on my server, transmitted to third parties, or used for commercial purposes in any way.",
        credits_bug: "Found a bug? Please write to me at ",
        credits_bug2: " so I can fix it.",
        game_hello: "Yag2Dpg - Hello World",
        game_instructions: "Click anywhere to spawn boxes",
        game_instructions: "Bug detectado en Ya2Dpg",
        bug_subject: "Bug detected in Yag2Dpg",
        menu_subtitle: "Yet another generic 2D platformer game",
        menu_button_load: "Load game level",
        options_title: "Options",
        options_music_vol: "Music",
        options_sfx_vol: "Sound (SFX)",
        options_close: "[ Click outside or press ESC to close ]",
        menu_press_start: "Click or press any key to start",
        menu_button_credits: "Credits",
        credits_back: "Back",
        credits_role_dev: "Lead Developer & Game Design",
        credits_role_ai: "AI Assistant (Powered by Google Gemini)",
        credits_music: "Original Music",
        credits_sfx: "Sound Effects (SFX)",
        credits_libs: "Engine & Libraries",
    },
    fr: {
        credits_title: "Miguel Páramos - Yet another generic 2D platformer game (Yag2Dpg)",
        credits_license1: "Distribué sous",
        credits_license2: "Veuillez fournir une attribution avec un lien vers",
        credits_license3: "Créé avec",
        credits_and: " et ",
        credits_source: "Téléchargez le code source ici",
        credits_privacy: "Cet éditeur de niveaux n'utilise que des cookies essentiels, toutes vos informations sont stockées localement, et ne sont ni stockées sur mon serveur, ni transmises à des tiers, ni utilisées à des fins commerciales de quelque manière que ce soit.",
        credits_bug: "Vous avez trouvé un bug ? Veuillez m'écrire à ",
        credits_bug2: " pour que je puisse le corriger.",
        game_hello: "Yag2Dpg - Bonjour le Monde",
        game_instructions: "Cliquez n'importe où pour faire apparaître des boîtes",
        bug_subject: "Bug détecté dans Yag2Dpg",
        menu_subtitle: "Yet another generic 2D platformer game",
        menu_button_load: "Charger un niveau de jeu",
        options_title: "Options",
        options_music_vol: "Musique",
        options_sfx_vol: "Effets (SFX)",
        options_close: "[ Cliquez en dehors ou appuyez sur ESC pour fermer ]",
        menu_press_start: "Cliquez ou appuyez sur n'importe quelle touche pour commencer",
        menu_button_credits: "Crédits",
        credits_back: "Retour",
        credits_role_dev: "Développeur Principal et Design",
        credits_role_ai: "Assistant IA (Propulsé par Google Gemini)",
        credits_music: "Musique Originale",
        credits_sfx: "Effets Sonores (SFX)",
        credits_libs: "Moteur et Bibliothèques",
    }
};

/**
 * Retrieves the translated string for a given key.
 * Falls back to Spanish if the key or language is missing.
 * @param {string} lang - The active language code ('es', 'en', 'fr')
 * @param {string} key - The dictionary key to lookup
 * @returns {string} The translated text
 */
function getText(lang, key) {
    return currentLangDictionary[lang]?.[key] || currentLangDictionary['es'][key] || key;
}