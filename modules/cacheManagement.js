/**
 * cacheManagement.js
 * Gestion optimisée du LocalStorage avec expiration (TTL) et nettoyage automatique.
 */

const STORAGE_KEY_PREFIX = "DWEBDI_CACHE_";
const CACHE_VERSION = "v1";

// Durées de vie par défaut (en minutes)
export const TTL = {
    SETTINGS: 0, // 0 = Pas d'expiration (pour les réglages utilisateur)
    STATIC_FILES: 1440, // 24 heures (pour data.json ou CSV)
    REF_DATA: 10080, // 7 jours (pour Mentions, Académies, etc. qui changent peu)
    API_SEARCH: 60, // 1 heure (pour les résultats de recherche stats)
    API_ENTITY: 1440 // 24 heures (pour une formation spécifique)
};

let myStorage = null;

/**
 * Initialise le storage
 */
function initCache() {
    try {
        const KeyTest = '_TEST_KEY_';
        window.localStorage.setItem(KeyTest, KeyTest);
        window.localStorage.removeItem(KeyTest);
        myStorage = window.localStorage;
    } catch (error) {
        console.warn('LocalStorage indisponible', error);
    }
}

initCache();

/**
 * Génère une clé de cache unique basée sur un préfixe et des arguments (ou un objet)
 * Utile pour les requêtes POST ou les URLs avec paramètres.
 */
export function generateKey(prefix, ...args) {
    const safeArgs = args.map(arg => {
        if (typeof arg === 'object') return JSON.stringify(arg);
        return String(arg);
    }).join('_');
    return `${prefix}_${safeArgs}`.replace(/[^a-zA-Z0-9_]/g, '');
}

/**
 * Sauvegarde générique dans le cache avec gestion de l'expiration
 * @param {string} key - Clé unique
 * @param {any} value - Donnée à stocker
 * @param {number} ttlInMinutes - Durée de vie en minutes (0 = infini)
 */
function setCache(key, value, ttlInMinutes = 60) {
    if (!myStorage) return;

    const fullKey = STORAGE_KEY_PREFIX + key;
    const now = new Date();
    
    const item = {
        value: value,
        version: CACHE_VERSION,
        expiry: ttlInMinutes === 0 ? null : now.getTime() + (ttlInMinutes * 60 * 1000),
        timestamp: now.getTime()
    };

    try {
        myStorage.setItem(fullKey, JSON.stringify(item));
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            console.warn("Cache plein. Tentative de nettoyage...");
            pruneCache();
            try {
                myStorage.setItem(fullKey, JSON.stringify(item));
            } catch (e2) {
                console.error("Impossible de sauvegarder même après nettoyage.", e2);
            }
        } else {
            console.warn("Erreur écriture cache", e);
        }
    }
}

/**
 * Récupération générique depuis le cache
 * @param {string} key - Clé unique
 * @returns {any|null} - La donnée ou null si absente/expirée
 */
function getCache(key) {
    if (!myStorage) return null;

    const fullKey = STORAGE_KEY_PREFIX + key;
    const itemStr = myStorage.getItem(fullKey);

    if (!itemStr) return null;

    try {
        const item = JSON.parse(itemStr);

        if (item.version !== CACHE_VERSION) {
            myStorage.removeItem(fullKey);
            return null;
        }

        if (item.expiry && Date.now() > item.expiry) {
            myStorage.removeItem(fullKey);
            return null;
        }

        return item.value;
    } catch (e) {
        return null;
    }
}

/**
 * Nettoie les entrées expirées ou les plus anciennes si besoin d'espace
 */
function pruneCache() {
    if (!myStorage) return;

    const keysToRemove = [];
    const entries = [];

    // 1. Identifier les entrées gérées par notre script
    for (let i = 0; i < myStorage.length; i++) {
        const key = myStorage.key(i);
        if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
            try {
                const item = JSON.parse(myStorage.getItem(key));
                if (item.expiry && Date.now() > item.expiry) {
                    keysToRemove.push(key);
                } else {
                    entries.push({ key, timestamp: item.timestamp || 0 });
                }
            } catch (e) {
                keysToRemove.push(key);
            }
        }
    }

    // Supprimer les expirés
    keysToRemove.forEach(k => myStorage.removeItem(k));

    // Si on a encore besoin d'espace, on supprime les 20% les plus vieux
    if (keysToRemove.length === 0 && entries.length > 0) {
        entries.sort((a, b) => a.timestamp - b.timestamp);
        const toDeleteCount = Math.ceil(entries.length * 0.2);
        for (let i = 0; i < toDeleteCount; i++) {
            myStorage.removeItem(entries[i].key);
        }
    }
}

/**
 * FONCTION MAGIQUE : Récupère du cache, ou fetch si inexistant
 * @param {string} key - Clé de cache
 * @param {Function} fetchPromise - La fonction async qui récupère les données si cache vide
 * @param {number} ttl - Durée de vie en minutes
 */
export async function getOrFetch(key, fetchPromise, ttl = 60) {
    const cachedData = getCache(key);
    if (cachedData !== null) {
        console.log(`[CACHE] Hit pour : ${key}`);
        return cachedData;
    }

    console.log(`[RESEAU] Fetch pour : ${key}`);
    try {
        const data = await fetchPromise();
        if (data) {
            setCache(key, data, ttl);
        }
        return data;
    } catch (error) {
        console.error(`Erreur fetch pour ${key}`, error);
        throw error;
    }
}

/* -------------------------------------------------------------------------- */
/* MÉTHODES SPÉCIFIQUES (Rétro-compatibilité)               */
/* -------------------------------------------------------------------------- */

// --- Settings Utilisateurs (TTL = 0, infini) ---

const KEYS = {
    SELECTIVITE: "settings_tauxSelectivite",
    CADRE: "settings_tauxCadre",
    SEXE: "settings_comparaisonSexe",
    DATA_JSON: "static_data_json",
    CSV_DATA: "static_csv_data"
};

export function saveTauxSelectiviteSettings(settings) {
    setCache(KEYS.SELECTIVITE, settings, TTL.SETTINGS);
}

export function loadTauxSelectiviteSettings() {
    return getCache(KEYS.SELECTIVITE);
}

export function saveProportionCadreSettings(settings) {
    setCache(KEYS.CADRE, settings, TTL.SETTINGS);
}

export function loadProportionCadreSettings() {
    return getCache(KEYS.CADRE);
}

export function saveComparaisonSexe(settings) {
    setCache(KEYS.SEXE, settings, TTL.SETTINGS);
}

export function loadComparaisonSexe() {
    return getCache(KEYS.SEXE);
}

// --- Données Statiques (Data.json, CSV) ---

export function saveStaticData(data) {
    setCache(KEYS.DATA_JSON, data, TTL.STATIC_FILES);
}

export function loadStaticData() {
    return getCache(KEYS.DATA_JSON);
}
