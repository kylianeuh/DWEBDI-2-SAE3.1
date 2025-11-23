import { saveStaticData, loadStaticData } from './cacheManagement.js';

const API_URL_24 = "https://data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/catalog/datasets/fr-esr-mon_master/records";
const API_URL_23 = "https://data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/catalog/datasets/fr-esr-mon_master_2023/records";

/**
 * Récupère une formation unique par son IFC
 * @param {string} ifc - L'identifiant de la formation
 * @returns {Promise<Object|null>} L'objet formation ou null si non trouvé
 */
export async function getFormationByIfc(ifc) {
    try {
        // Utilisation de encodeURIComponent pour sécuriser l'injection de la variable
        const encodedIfc = encodeURIComponent(`"${ifc}"`);
        const url = `${API_URL_24}?where=ifc=${encodedIfc}&limit=1`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.results || data.results.length === 0) {
            return null;
        }

        return data.results[0];

    } catch (error) {
        console.error("Erreur dans getFormationByIfc:", error);
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