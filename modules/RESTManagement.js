import { saveStaticData, loadStaticData } from './cacheManagement.js';

const API_URL_FORMATION = "https://la-lab4ce.univ-lemans.fr/masters-stats/api/rest/formations";
const API_URL_MENTION = 'https://la-lab4ce.univ-lemans.fr/masters-stats/api/rest/mentions';
const API_URL_STATS_SEARCH = "https://la-lab4ce.univ-lemans.fr/masters-stats/api/rest/stats/search";

/**
 * Récupère une formation unique par son IFC
 * @param {string} ifc - L'identifiant de la formation
 * @returns {Promise<Object|null>} L'objet formation ou null si non trouvé
 */

export async function getFormationByIfc(ifc) {
    try {
        const encodedIfc = encodeURIComponent(`${ifc}`);
        const url = `${API_URL_FORMATION}/${encodedIfc}`;
        console.log(url);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}`);
        }

        const data_formation = await response.json();
        
        if (Object.keys(data_formation).length === 0 || !data_formation.ifc) { 
            console.log("Absence de data pour les formations");
            return null;
        }
        return data_formation;

    } catch (error) {
        console.error("Erreur dans getFormationByIfc:", error);
        throw error;
    }
}

/**
 * Récupère les mentions
 * @returns {Promise<Object|null>} L'objet formation ou null si non trouvé
 */

export async function getMention(idRecherche) {
    try {
        const response = await fetch(API_URL_MENTION);

        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}`);
        }

        const data_mention = await response.json();

        if (!Array.isArray(data_mention) || data_mention.length === 0) { 
            console.log("Absence de data pour les mentions");
            return null;
        }

    const mention = data_mention.find(m => m.secDiscId === idRecherche);
    
    return mention ? mention.nom : null;

    } catch (error) {
        console.error("Erreur dans getMention :", error);
        throw error;
    }
}


let csvDataCache = null;

/**
 * Charge et analyse le fichier CSV
 */
export async function loadAndParseCSV() {
    if (csvDataCache) return csvDataCache;

    console.log("Chargement du CSV en cours...");
    try {
        // Assurez-vous que le chemin vers le CSV est correct par rapport à index.html
        const response = await fetch('./csv/fr-esr-insertion_professionnelle-master_up2025.csv');
        const csvText = await response.text();

        const lines = csvText.split('\n');
        const headers = lines[0].split(';');
        
        // Index des colonnes importantes
        const idxUai = headers.indexOf('numero_de_l_etablissement');
        const idxDomaine = headers.indexOf('domaine');
        const idxCadre = headers.indexOf('emplois_cadre');
        const idxReponses = headers.indexOf('nombre_de_reponses');
        const idxAnnee = headers.indexOf('annee');
        const idxSalaireMedian = headers.indexOf('salaire_net_median_des_emplois_a_temps_plein');

        const dataMap = {};

        // On parcourt les lignes (on saute l'en-tête)
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const columns = line.split(';');

            // On récupère les valeurs brutes
            const uai = columns[idxUai];
            const domaine = columns[idxDomaine];
            // Nettoyage des valeurs numériques (remplace la virgule par un point si nécessaire, gère les "ns")
            const rawCadre = columns[idxCadre];
            const rawReponses = columns[idxReponses];
            const annee = parseInt(columns[idxAnnee], 10);
            const salaireMedian = columns[idxSalaireMedian]

            // On ignore les lignes sans données valides ou confidentielles ("ns", "nd")
            if (!uai || !domaine || isNaN(parseFloat(rawCadre)) || isNaN(parseFloat(rawReponses))) {
                continue;
            }

            const key = `${uai}`;
            const emplois_cadre = parseFloat(rawCadre);
            const nombre_de_reponses = parseFloat(rawReponses);

            // Logique pour ne garder que l'année la plus récente pour chaque couple UAI/Domaine
            if (!dataMap[key] || dataMap[key].annee < annee) {
                dataMap[key] = {
                    uai,
                    emplois_cadre,
                    nombre_de_reponses,
                    annee,
                    salaireMedian
                };
            }
        }

        console.log("CSV chargé et analysé avec succès.");
        csvDataCache = dataMap;
        return dataMap;

    } catch (error) {
        console.error("Erreur lors du chargement du CSV :", error);
        return {};
    }
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
        console.log("Chargement de data.json (réseau)...");
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
    } else {
        console.log("Chargement de data.json (depuis le cache).");
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
    try {
        const payload = {
            filters: filters,
            harvest: harvest
        };

        const response = await fetch(API_URL_STATS_SEARCH, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status} lors de la recherche stats`);
        }

        return await response.json();

    } catch (error) {
        console.error("Erreur dans searchStats :", error);
        return null;
    }
}