import { getOrFetch, generateKey, loadStaticData, saveStaticData, TTL } from './cacheManagement.js';

const API_URL_FORMATION = "https://la-lab4ce.univ-lemans.fr/masters-stats/api/rest/formations";
const API_URL_MENTION = 'https://la-lab4ce.univ-lemans.fr/masters-stats/api/rest/mentions';
const API_URL_STATS_SEARCH = "https://la-lab4ce.univ-lemans.fr/masters-stats/api/rest/stats/search";

/**
 * Récupère une formation unique par son IFC
 * @param {string} ifc - L'identifiant de la formation
 * @returns {Promise<Object|null>} L'objet formation ou null si non trouvé
 */
export async function getFormationByIfc(ifc) {
    const cacheKey = `FORMATION_${ifc}`;
    
    return await getOrFetch(cacheKey, async () => {
        const encodedIfc = encodeURIComponent(`${ifc}`);
        const url = `${API_URL_FORMATION}/${encodedIfc}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
        
        const data = await response.json();
        // Vérification si l'objet est vide ou invalide
        if (Object.keys(data).length === 0 || !data.ifc) return null;
        
        return data;
    }, TTL.API_ENTITY);
}
/**
 * Récupère les mentions
 * @returns {Promise<Object|null>} L'objet formation ou null si non trouvé
 */

export async function getMention(idRecherche) {
    return await getOrFetch('ALL_MENTIONS', async () => {
        const response = await fetch(API_URL_MENTION);
        if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
        const data = await response.json();
        return (Array.isArray(data) && data.length > 0) ? data : null;
    }, TTL.REF_DATA)
        .then(data_mention => {
            if (!data_mention) return null;
            const mention = data_mention.find(m => m.secDiscId === idRecherche);
            return mention ? mention.nom : null;
        });
}

/**
 * Récupère infos complémentaires depuis data.json
 * Utilise le cache pour éviter de recharger le fichier.
 * @param {string} ifc - L'identifiant de la formation
 */
export async function getAllDataJson(ifc) {
    let dataList = loadStaticData();

    // Si pas de données en cache, on charge le fichier
    if (!dataList) {
        try {
            const response = await fetch('../src/data.json');
            if (!response.ok) throw new Error("Erreur chargement data.json");

            dataList = await response.json();

            // On sauvegarde dans le cache pour la prochaine fois
            saveStaticData(dataList);
        } catch (error) {
            console.error("Erreur getLocalDescription :", error);
            return null;
        }
    }

    const found = dataList.find(item => item.ifc === ifc);
    return found || null;
}

/**
 * Recherche des statistiques (Candidatures ou Insertion Pro) via critères
 * @param {Object} filters - Objet contenant les filtres (etablissementIds, anneeMin, etc.)
 * @param {Object} harvest - Objet définissant les champs à récupérer (insertionProDetails, etc.)
 */

export async function searchStats(filters, harvest) {
    const cacheKey = generateKey('STATS_SEARCH', filters, harvest);

    return await getOrFetch(cacheKey, async () => {
        const payload = { filters, harvest };
        const response = await fetch(API_URL_STATS_SEARCH, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
        return await response.json();
    }, TTL.API_SEARCH);
}

/**
 * Récupère la liste complète des données du fichier data.json
 * (Utilise le cache pour ne pas recharger le fichier à chaque clic)
 */
export async function getFullDataJson() {
    let dataList = loadStaticData(); // On tente de charger depuis le cache

    if (!dataList) {
        try {
            const response = await fetch('../src/data.json');
            if (!response.ok) throw new Error("Erreur chargement data.json");
            dataList = await response.json();
            saveStaticData(dataList); // On sauvegarde en cache
        } catch (error) {
            console.error("Erreur dans getFullDataJson :", error);
            return [];
        }
    }
    return dataList;
}