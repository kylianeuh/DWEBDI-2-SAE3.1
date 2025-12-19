let myStorage = null;

const TAUXSELECTIVITE_SETTINGS_KEY = "tauxSelectiviteSettings";

export function saveTauxSelectiviteSettings(settings) {
    if (!myStorage) {
        return;
    }

  myStorage.setItem(TAUXSELECTIVITE_SETTINGS_KEY, JSON.stringify(settings));
}

export function loadTauxSelectiviteSettings() {
    if (!myStorage) {
        return;
    }

  try {
    return JSON.parse(myStorage.getItem(TAUXSELECTIVITE_SETTINGS_KEY));
  } catch (error) {
    console.warn("Erreur de donnees de storage");
    return null;
  }
}

const TAUXCADRE_SETTINGS_KEY = "tauxCadreSettings";

export function saveProportionCadreSettings(settings) {
    if (!myStorage) {
        return;
    }

  myStorage.setItem(TAUXCADRE_SETTINGS_KEY, JSON.stringify(settings));
}

export function loadProportionCadreSettings() {
    if (!myStorage) {
        return;
    }

  try {
    return JSON.parse(myStorage.getItem(TAUXCADRE_SETTINGS_KEY));
  } catch (error) {
    console.warn("Erreur de donnees de storage");
    return null;
  }
}

const SEXECOMPARAISON_SETTINGS_KEY = "tauxCadreSettings";

export function saveComparaisonSexe(settings) {
    if (!myStorage) {
        return;
    }

  myStorage.setItem(SEXECOMPARAISON_SETTINGS_KEY, JSON.stringify(settings));
}

export function loadComparaisonSexe() {
    if (!myStorage) {
        return;
    }

  try {
    return JSON.parse(myStorage.getItem(SEXECOMPARAISON_SETTINGS_KEY));
  } catch (error) {
    console.warn("Erreur de donnees de storage");
    return null;
  }
}

const DATA_JSON_KEY = "staticDataJson";

/**
 * Sauvegarde les données brutes de data.json dans le cache
 */
export function saveStaticData(data) {
    if (!myStorage) return;
    try {
        myStorage.setItem(DATA_JSON_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn("Impossible de sauvegarder data.json dans le cache", e);
    }
}

/**
 * Récupère les données de data.json depuis le cache
 */
export function loadStaticData() {
    if (!myStorage) return null;
    try {
        const data = myStorage.getItem(DATA_JSON_KEY);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.warn("Erreur lecture cache data.json", e);
        return null;
    }
}


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