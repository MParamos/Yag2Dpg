/**
 * @file i18n.js
 * @description Internationalization module for the Yagce landing page.
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
        hero_subtitle: "Este proyecto comenzó en Mayo de 2026 como un ejercicio para enseñar a programar a alumnos de TICO en primero de bachillerato. Siendo como soy, el proyecto ha escalado y se ha convertido en la base de un motor de creación de juegos. En su versión 0.0.2 adoptó el nombre YAGCE y migró a Phaser 4. Actualmente solo está disponible el Editor de Niveles Web y un probador de niveles básico.",
        btn_play: "Testeador del Juego",
        btn_editor: "Editor de Niveles",
        news_title: "Novedades del Proyecto",
        credits_title: "Miguel Páramos - YAGCE (Yet Another Game Creation Engine)",
        credits_license1: "Distribuido bajo licencia",
        credits_license2: "Por favor, dar atribución con enlace a",
        credits_license3: "Creado con",
        credits_and: " y ",
        credits_source: "Descarga el código fuente aquí",
        credits_privacy: "Este sitio solo usa cookies esenciales, toda tu información se almacena de forma local, y no se almacena en mi servidor ni se transmite a terceros, ni se usa para fines comerciales en modo alguno.",
        credits_bug: "¿Has encontrado algún error? Por favor escríbeme a ",
        credits_bug2: " para que pueda arreglarlo.",
        bug_subject: "Bug encontrado en Yagce",
    },
    en: {
        hero_title: "Game Under Construction!",
        hero_subtitle: "This project started in May 2026 as a practical exercise to teach programming to first-year high school IT students. Being who I am, the project escalated and became the foundation of a game creation engine. In version 0.0.2, it adopted the name YAGCE and migrated to Phaser 4. Currently, only the Web Level Editor and a basic level tester are available.",
        btn_play: "Game Tester",
        btn_editor: "Level Editor",
        news_title: "Project Updates",
        credits_title: "Miguel Páramos - YAGCE (Yet Another Game Creation Engine)",
        credits_license1: "Distributed under",
        credits_license2: "Please provide attribution with a link to",
        credits_license3: "Created with",
        credits_and: " and ",
        credits_source: "Download the source code here",
        credits_privacy: "This site only uses essential cookies, all your information is stored locally, and is not stored on my server, transmitted to third parties, or used for commercial purposes in any way.",
        credits_bug: "Found a bug? Please write to me at ",
        credits_bug2: " so I can fix it.",
        bug_subject: "Bug found in Yagce"
    },
    fr: {
        hero_title: "Jeu en Construction !",
        hero_subtitle: "Ce projet a débuté en mai 2026 comme un exercice pratique pour enseigner la programmation aux élèves de première en informatique. Étant ce que je suis, le projet a pris de l'ampleur et est devenu la base d'un moteur de création de jeux. Dans sa version 0.0.2, il a adopté le nom YAGCE et a migré vers Phaser 4. Actuellement, seuls l'Éditeur de Niveaux Web et un testeur de niveaux de base sont disponibles.",
        btn_play: "Testeur de Jeu",
        btn_editor: "Éditeur de niveaux",
        news_title: "Mises à jour du Projet",
        credits_title: "Miguel Páramos - YAGCE (Yet Another Game Creation Engine)",
        credits_license1: "Distribué sous licence",
        credits_license2: "Veuillez attribuer avec un lien vers",
        credits_license3: "Créé avec",
        credits_and: " et ",
        credits_source: "Téléchargez le code source ici",
        credits_privacy: "Ce site n'utilise que des cookies essentiels, toutes vos informations sont stockées localement, et ne sont ni stockées sur mon serveur, ni transmises à des tiers, ni utilisées à des fins commerciales de quelque manière que ce soit.",
        credits_bug: "Vous avez trouvé un bug ? Veuillez m'écrire à ",
        credits_bug2: " pour que je puisse le corriger.",
        bug_subject: "Bug trouvé dans Yagce"
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