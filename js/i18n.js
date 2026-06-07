/**
 * @file i18n.js
 * @description Internationalization module for the Yag2Dpg landing page.
 * Handles the global language state and provides dictionary lookups.
 * @author Miguel Páramos
 */

/**
 * @type {string}
 * @description Tracks the currently active language code ('es', 'en', 'fr').
 * Defaults to Spanish.
 */
export let currentLanguage = 'es';

/**
 * Updates the global language state.
 * * @param {string} lang - The target language code to set.
 */
export function setCurrentLanguage(lang) {
    currentLanguage = lang;
}

/**
 * @constant {Object}
 * @description Dictionary containing all localized strings for the landing page UI.
 */
const landingDictionary = {
    es: {
        hero_title: "¡Juego en Construcción!",
        hero_subtitle: "Este proyecto comenzó en Mayo de 2026 como un ejercicio para enseñar a programar a alumnos de TICO en primero de bachillerato. Siendo como soy, el proyecto ha escalado y se está convirtiendo en un videojuego real. De momento solo está disponible una primera alpha del juego muy básica, y una primera versión del editor de niveles. ¡Puedes empezar a crear tus propios mundos y compartirlos con la comunidad!",
        btn_play: "Jugar a Yag2Dpg",
        btn_editor: "Editor de Niveles",
        news_title: "Novedades del Proyecto",
        credits_title: "Miguel Páramos - Yet another generic 2D platformer game (Yag2Dpg)",
        credits_license1: "Distribuido bajo licencia",
        credits_license2: "Por favor, dar atribución con enlace a",
        credits_license3: "Creado con",
        credits_and: " y ",
        credits_source: "Descarga el código fuente aquí",
        credits_privacy: "Este sitio solo usa cookies esenciales, toda tu información se almacena de forma local, y no se almacena en mi servidor ni se transmite a terceros, ni se usa para fines comerciales en modo alguno.",
        credits_bug: "¿Has encontrado algún error? Por favor escríbeme a ",
        credits_bug2: " para que pueda arreglarlo.",
        bug_subject: "Bug encontrado en Yag2Dpg",
    },
    en: {
        hero_title: "Game Under Construction!",
        hero_subtitle: "This project started in May 2026 as a practical exercise to teach programming to first-year high school IT students. Being who I am, the project escalated and is turning into an actual video game. Currently, only a very basic first alpha of the game and an early version of the level editor are available. You can start creating your own worlds and sharing them with the community!",
        btn_play: "Play Yag2Dpg",
        btn_editor: "Level Editor",
        news_title: "Project Updates",
        credits_title: "Miguel Páramos - Yet another generic 2D platformer game (Yag2Dpg)",
        credits_license1: "Distributed under",
        credits_license2: "Please provide attribution with a link to",
        credits_license3: "Created with",
        credits_and: " and ",
        credits_source: "Download the source code here",
        credits_privacy: "This site only uses essential cookies, all your information is stored locally, and is not stored on my server, transmitted to third parties, or used for commercial purposes in any way.",
        credits_bug: "Found a bug? Please write to me at ",
        credits_bug2: " so I can fix it.",
        bug_subject: "Bug found in Yag2Dpg"
    },
    fr: {
        hero_title: "Jeu en Construction !",
        hero_subtitle: "Ce projet a débuté en mai 2026 comme un exercice pratique pour enseigner la programmation aux élèves de première en informatique. Étant ce que je suis, le projet a pris de l'ampleur et se transforme en un véritable jeu vidéo. Pour le moment, seule une première version alpha très basique du jeu et une première version de l'éditeur de niveaux sont disponibles. Vous pouvez commencer à créer vos propres mondes et à les partager avec la communauté !",
        btn_play: "Jouer à Yag2Dpg",
        btn_editor: "Éditeur de niveaux",
        news_title: "Mises à jour du Projet",
        credits_title: "Miguel Páramos - Yet another generic 2D platformer game (Yag2Dpg)",
        credits_license1: "Distribué sous licence",
        credits_license2: "Veuillez attribuer avec un lien vers",
        credits_license3: "Créé avec",
        credits_and: " et ",
        credits_source: "Téléchargez le code source ici",
        credits_privacy: "Ce site n'utilise que des cookies essentiels, toutes vos informations sont stockées localement, et ne sont ni stockées sur mon serveur, ni transmises à des tiers, ni utilisées à des fins commerciales de quelque manière que ce soit.",
        credits_bug: "Vous avez trouvé un bug ? Veuillez m'écrire à ",
        credits_bug2: " pour que je puisse le corriger.",
        bug_subject: "Bug trouvé dans Yag2Dpg"
    }
};

/**
 * Retrieves the localized string for a given key based on the current language.
 * Falls back to Spanish ('es') if the key is missing in the target language.
 * Returns the key itself if no translation is found in either language.
 * * @param {string} key - The dictionary key for the requested text.
 * @returns {string} The localized string or the fallback key.
 */
export function getTranslation(key) {
    return landingDictionary[currentLanguage]?.[key] || landingDictionary['es'][key] || key;
}