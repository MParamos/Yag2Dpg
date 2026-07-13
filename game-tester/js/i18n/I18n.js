/**
 * @file I18n.js
 * @description Static class handling internationalization and language state.
 */
class I18n {
    static #activeLanguage = 'es';

    static #dictionary = {
    es: {
        credits_title: "Miguel Páramos - YAGCE (Yet Another Game Creation Engine)",
        credits_license1: "Distribuido bajo licencia",
        credits_license2: "Por favor, dar atribución con enlace a",
        credits_license3: "Creado con",
        credits_and: " y ",
        credits_source: "Descarga el código fuente aquí",
        credits_privacy: "Este juego solo usa cookies esenciales, toda tu información se almacena de forma local, y no se almacena en mi servidor ni se transmite a terceros, ni se usa para fines comerciales en modo alguno.",
        credits_bug: "¿Has encontrado algún error? Por favor escríbeme a ",
        credits_bug2: " para que pueda arreglarlo.",
        game_hello: "Yagce - Hola Mundo",
        game_instructions: "Haz clic en cualquier parte para crear cajas",
        bug_subject: "Bug detectado en Yagce",
        menu_subtitle: "YAGCE (Yet Another Game Creation Engine)",
        menu_button_load: "Cargar nivel de juego",
        options_title: "Opciones",
        options_music_vol: "Música",
        options_sfx_vol: "Efectos (SFX)",
        menu_press_start: "Haz clic o pulsa cualquier tecla para comenzar",
        menu_button_credits: "Créditos",
        credits_back: "Atrás",
        credits_role_dev: "Desarrollador y Diseño Principal",
        credits_role_ai: "Asistente IA (Basada en Google Gemini)",
        credits_music: "Música Original",
        credits_sfx: "Efectos de Sonido (SFX)",
        credits_libs: "Motor y Librerías",
        settings_main_menu: "Volver al Menú Principal",
        options_close: "[ Haz clic fuera o pulsa INTRO para cerrar ]",
        quit_title: "¿Seguro que quieres abandonar la partida y salir al menú?",
        quit_yes: "Sí, salir",
        quit_no: "No, seguir jugando",
        restart_yes: "Sí, reiniciar",
        restart_title: "¿Deseas reiniciar el nivel?",
        options_pause_blur: "Pausar en segundo plano",
    },
    en: {
        credits_title: "Miguel Páramos - YAGCE (Yet Another Game Creation Engine)",
        credits_license1: "Distributed under",
        credits_license2: "Please provide attribution with a link to",
        credits_license3: "Built with",
        credits_and: " and ",
        credits_source: "Download the source code here",
        credits_privacy: "This game only uses essential cookies, all your information is stored locally, and is not stored on my server, transmitted to third parties, or used for commercial purposes in any way.",
        credits_bug: "Found a bug? Please write to me at ",
        credits_bug2: " so I can fix it.",
        game_hello: "Yagce - Hello World",
        game_instructions: "Click anywhere to spawn boxes",
        bug_subject: "Bug detected in Yagce",
        menu_subtitle: "YAGCE (Yet Another Game Creation Engine)",
        menu_button_load: "Load game level",
        options_title: "Options",
        options_music_vol: "Music",
        options_sfx_vol: "Sound (SFX)",
        menu_press_start: "Click or press any key to start",
        menu_button_credits: "Credits",
        credits_back: "Back",
        credits_role_dev: "Lead Developer & Game Design",
        credits_role_ai: "AI Assistant (Powered by Google Gemini)",
        credits_music: "Original Music",
        credits_sfx: "Sound Effects (SFX)",
        credits_libs: "Engine & Libraries",
        settings_main_menu: "Return to Main Menu",
        options_close: "[ Click outside or press ENTER to close ]",
        quit_title: "Are you sure you want to quit the game and return to the menu?",
        quit_yes: "Yes, quit",
        quit_no: "No, keep playing",
        restart_yes: "Yes, restart",
        restart_title: "Do you want to restart the level?",
        options_pause_blur: "Pause in background",
    },
    fr: {
        credits_title: "Miguel Páramos - YAGCE (Yet Another Game Creation Engine)",
        credits_license1: "Distribué sous",
        credits_license2: "Veuillez fournir une attribution avec un lien vers",
        credits_license3: "Créé avec",
        credits_and: " et ",
        credits_source: "Téléchargez le code source ici",
        credits_privacy: "Ce jeu n'utilise que des cookies essentiels, toutes vos informations sont stockées localement, et ne sont ni stockées sur mon serveur, ni transmises à des tiers, ni utilisées à des fins commerciales de quelque manière que ce soit.",
        credits_bug: "Vous avez trouvé un bug ? Veuillez m'écrire à ",
        credits_bug2: " pour que je puisse le corriger.",
        game_hello: "Yagce - Bonjour le Monde",
        game_instructions: "Cliquez n'importe où pour faire apparaître des boîtes",
        bug_subject: "Bug détecté dans Yagce",
        menu_subtitle: "YAGCE (Yet Another Game Creation Engine)",
        menu_button_load: "Charger un niveau de jeu",
        options_title: "Options",
        options_music_vol: "Musique",
        options_sfx_vol: "Effets (SFX)",
        menu_press_start: "Cliquez ou appuyez sur n'importe quelle touche pour commencer",
        menu_button_credits: "Crédits",
        credits_back: "Retour",
        credits_role_dev: "Développeur Principal et Design",
        credits_role_ai: "Assistant IA (Propulsé par Google Gemini)",
        credits_music: "Musique Originale",
        credits_sfx: "Effets Sonores (SFX)",
        credits_libs: "Moteur et Bibliothèques",
        settings_main_menu: "Retour au menu principal",
        options_close: "[ Cliquez en dehors ou appuyez sur ENTRÉE pour fermer ]",
        quit_title: "Voulez-vous vraiment quitter la partie et retourner au menu ?",
        quit_yes: "Oui, quitter",
        quit_no: "Non, continuer",
        restart_yes: "Oui, recommencer",
        restart_title: "Voulez-vous redémarrer le niveau ?",
        options_pause_blur: "Pause en arrière-plan",
    }
};

    /**
     * Gets the currently active language code.
     * @returns {string}
     */
    static get activeLang() {
        return this.#activeLanguage;
    }

    /**
     * Sets a new active language.
     * @param {string} langCode - The language code ('es', 'en', 'fr').
     */
    static set activeLang(langCode) {
        if (['es', 'en', 'fr'].includes(langCode)) {
            this.#activeLanguage = langCode;
        }
    }

    /**
     * Retrieves the translated string for a given key.
     * @param {string} key - The dictionary key to lookup.
     * @returns {string} The translated text.
     */
    static getText(key) {
        return this.#dictionary[this.#activeLanguage]?.[key] || this.#dictionary['es'][key] || key;
    }

}