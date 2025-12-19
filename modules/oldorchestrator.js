import { getFormationByIfc, getMention, loadAndParseCSV, getAllDataJson, searchStats } from './RESTManagement.js';
import { updateTauxGraph, updateTauxGraphModal } from './tauxSelectiviteGraph.js';
import { updateCadreGraph, updateCadreGraphModal } from './proportionCadreGraph.js';
import { updateRepartitionDiplomeOrigine, updateRepartitionDiplomeOrigineModal } from './repartitionDiplomeOrigineGraph.js';
import { updateSalaire, updateSalaireModal } from './comparaisonSalaireGraph.js';
import { updateMap } from './mapManagement.js';


export async function afficherDetailsFormation(ifc) {
    try {


        // =================================================================
        // GESTION INFORMATIONS PRINCIPALES
        // =================================================================

        const data_formation = await getFormationByIfc(ifc);

        if (!data_formation) {
            console.warn("Aucune donnée trouvée pour cet IFC");
            return;
        }

        console.log("Données reçues :", data_formation);

        // Gestion du nom du parcours
        const idMention = data_formation?.secDiscId;

        const mention = await getMention(idMention);

        if (!mention) {
            console.warn("Aucune mentions trouvéees");
            return;
        }

        console.log("Mention reçue :", mention);


        const baliseNomParcours = document.getElementById('nomParcours');
        baliseNomParcours.textContent = `Master - ${mention}`;

        // Stockage de l'IFC du parcour
        baliseNomParcours.dataset.ifc = ifc;

        // Gestion du l'alternance
        const baliseAlternance = document.getElementById('alternance');
        if (baliseAlternance) {
            baliseAlternance.textContent = Number(data_formation.alternance) === 1 ? "Alternance" : "Initial";
        }

        // Gestion localisation

        const localisation = data_formation.lieux || "";
        const baliseLocalisation = document.getElementById('localisation');
        baliseLocalisation.textContent = `${localisation}`;

        // Gestion de la description

        const localData = await getAllDataJson(ifc);
        const baliseDesc = document.getElementById('descriptionParcours');
        if (baliseDesc) {
            if (localData && localData.desc) {
                baliseDesc.textContent = localData.desc;
            } else {
                baliseDesc.textContent = "Description indisponible pour cette formation."
            }
        }

        // Gestion de la map

        const lat = parseFloat(data_formation.latitude);
        const lon = parseFloat(data_formation.longitude);
        const etablissement = localisation.split('-')[0].trim();
        console.log(etablissement);

        if (!isNaN(lat) && !isNaN(lon)) {
            console.log(`Mise à jour care : ${lat}, ${lon}`);
            updateMap(lat, lon, etablissement, localData.site);
        } else {
            console.warn("Coordonnées GPS non valides.");
            const mapDiv = document.getElementById('map');
            if (mapDiv) mapDiv.innerHTML = '<p style="padding:20px; text-align:center;">Carte indisponible.</p>';
        }


        // Gestion de l'adresse

        const BaliseAdresse = document.getElementById('adresseEtab');
        if (BaliseAdresse) {
            if (localData && localData.adresse) {
                BaliseAdresse.textContent = localData.adresse;
            } else {
                BaliseAdresse.textContent = "Adresse indisponible pour cette formation."
            }
        }

        // Gestion du mail

        const BaliseMail = document.getElementById('mailParcours');
        if (BaliseMail) {
            if (localData && localData.mail) {
                BaliseMail.textContent = localData.mail;
            } else {
                BaliseMail.textContent = "Mail indisponible pour cette formation."
            }
        }

        // Gestion du site

        const BaliseSite = document.getElementById('siteEtab');
        if (BaliseSite) {
            if (localData && localData.site) {
                try {
                    const urlObj = new URL(localData.site);
                    BaliseSite.textContent = urlObj.hostname;
                    BaliseSite.href = localData.site;
                } catch (e) {
                    console.warn("URL invalide :", localData.site);
                    BaliseSite.textContent = localData.site;
                    BaliseSite.href = localData.site;
                }
            } else {
                BaliseSite.textContent = "Site indisponible pour cette formation."
                BaliseSite.removeAttribute("href");
            }
        }

        // Gestion des tags

        if (localData && localData.tag) {
            await updateFormationsSimilaires(localData.tag, ifc);
        } else {
            console.warn("Ps de tag trouvé pour charger les formations similaires.")
            document.querySelector('.right-item__formation-container').innerHTML = "<p>Aucune suggestion disponible.</p>";
        }

        // =================================================================
        // GESTION REQUETE SEARCH
        // =================================================================

        const uai = data_formation.etabUai;
        console.log(`Recherche Stats Insertion pour UAI: ${uai} et ifc : ${ifc}`);
 
        if (uai && ifc) {
            const filters = {
                etablissementIds: [uai],
                formationIfcs: [ifc],
            };

            const harvest = {
                typeStats: "all",
                "candidatureDetails": ["general"],
                'insertionProDetails': ["emplois", "general"],

            };

            const statsData = await searchStats(filters, harvest);

            if 
            // --- A. Gestion du taux d'admission ---

            if (statsData && statsData.insertionsPro && statsData.insertionsPro.length > 0) {
                // On prend la donnée la plus récente (la dernière du tableau ou trier par année)
                // L'API renvoie un tableau, prenons le dernier élément qui est souvent le plus récent
                const latestStat = statsData.insertionsPro.sort((a, b) => b.anneeCollecte - a.anneeCollecte)[0];

                console.log("Stats Insertion reçues :", latestStat);

                // --- A. Gestion du taux d'admission ---

                // --- A. SALAIRE ---
                // Le modèle indique : salaire -> netMedianTempsPlein [cite: 556]
                let salaireMedian = 0;
                if (latestStat.salaire && latestStat.salaire.netMedianTempsPlein) {
                    salaireMedian = latestStat.salaire.netMedianTempsPlein;
                }

                // Pour le salaire moyen de la discipline, on pourrait faire une 2ème requête API 
                // sans le filtre "etablissementIds" pour avoir la moyenne nationale du secteur.
                // Pour l'instant, disons qu'on compare à une valeur fixe ou calculée autrement.
                // (Exemple simplifié ici : on garde votre logique précédente ou on met une valeur par défaut)
                const salaireMoyenneDiscipline = 2200; // Valeur arbitraire ou à aller chercher via un 2ème appel API

                updateSalaire(salaireMedian, salaireMoyenneDiscipline);
                updateSalaireModal(salaireMedian, salaireMoyenneDiscipline);


                // --- B. TAUX CADRE ---
                // Le modèle indique : emplois -> cadre (nombre) et general -> nbReponses [cite: 462, 549]
                // Attention : 'cadre' est un nombre absolu, pas un pourcentage.

                let tauxCadre = 0;
                if (latestStat.emplois && latestStat.general && latestStat.general.nbResponses > 0) {
                    const nbCadres = latestStat.emplois.cadre || 0;
                    const nbReponses = latestStat.general.nbResponses || 1; // Eviter division par 0

                    // Calcul du pourcentage
                    tauxCadre = parseFloat(((nbCadres / nbReponses) * 100).toFixed(1));
                }

                updateCadreGraph(tauxCadre);
                updateCadreGraphModal(tauxCadre);

            } else {
                console.warn("Aucune statistique d'insertion trouvée pour ces critères.");
                updateSalaire(0, 0);
                updateCadreGraph(0);
            }

        } else {
            console.warn("Données manquantes (UAI ou SecDiscId) pour la recherche stats.");
        }

        

        // Répartition des diplomes

        const L3 = Number(data.n_prop_lg3_total) || 0;
        const LP3 = Number(data.n_prop_lp3_total) || 0;
        const master = Number(data.n_prop_master_total) || 0;
        let autre = nPropTotal - (L3 + LP3 + master);
        if (autre < 0) autre = 0;

        console.log("Répartition :", { L3, LP3, master, autre });

        // Création des graphiques
        updateRepartitionDiplomeOrigine(L3, LP3, master, autre);
        updateRepartitionDiplomeOrigineModal(L3, LP3, master, autre);

        // Comparaison salaire

        // 1. Chargement des données brutes
        const insertionData = await loadAndParseCSV();
        console.log(insertionData);

        const response = await fetch('../src/data.json');
        const responseJson = await response.json();

        // 2. Récupération des infos de la formation actuelle
        const currentFormationJson = responseJson.find(f => f.ifc === ifc);
        const currentFormationApi = await getFormationByIfc(ifc);

        if (!currentFormationJson || !currentFormationApi) {
            console.warn("Impossible de trouver les informations complètes pour cet IFC.");
            return null;
        }

        const currentTag = currentFormationJson.tag;

        // 3. Récupération du salaire médian spécifique
        let salaireMedian = 0;

        if (insertionData[uai]) {
            salaireMedian = parseFloat(insertionData[uai].salaireMedian.replace(',', '.'));
            if (isNaN(salaireMedian)) salaireMedian = 0;
        }
        // 4. Calcul du Salaire Moyen de la Discipline (Même Tag)
        // On filtre toutes les formations qui ont le même tag
        const formationsMemeTag = responseJson.filter(f => f.tag === currentTag);

        let sommeSalaires = 0;
        let nombreFormationsValides = 0;
        // On parcourt les formations du même domaine pour récupérer leur UAI via l'API puis leur salaire via le CSV
        // Utilisation de Promise.all pour paralléliser les requêtes API (plus rapide)
        await Promise.all(formationsMemeTag.map(async (formation) => {
            try {
                const apiData = await getFormationByIfc(formation.ifc);
                if (apiData) {
                    const uai = apiData.uai || apiData.etablissement_uai;

                    // On regarde si cet UAI existe dans le CSV
                    if (insertionData[uai] && insertionData[uai].salaireMedian) {
                        const salaire = parseFloat(insertionData[uai].salaireMedian.replace(',', '.'));

                        // On ne compte que les vrais chiffres (pas les "ns")
                        if (!isNaN(salaire) && salaire > 0) {
                            sommeSalaires += salaire;
                            nombreFormationsValides++;
                        }
                    }
                }
            } catch (e) {
                console.warn(`Erreur lors de la récupération pour l'IFC ${formation.ifc}`, e);
            }
        }));

        // Calcul de la moyenne (ou somme si c'est strictement demandé)
        const salaireMoyenneDiscipline = nombreFormationsValides > 0 ? Math.round(sommeSalaires / nombreFormationsValides) : 0;
        updateSalaire(salaireMedian, salaireMoyenneDiscipline);
        updateSalaireModal(salaireMedian, salaireMoyenneDiscipline);

        // Taux de cadre (depuis le CSV)

        const key = `${uai}`;
        const stats = insertionData[key];

        if (stats) {
            console.log(`Données CSV trouvées pour ${key} (Année ${stats.annee}`, stats);

            // Affichage des valeurs réelles
            const tauxCadreReel = stats.emplois_cadre;
            const nbReponses = stats.nombre_de_reponses;

            // Formule : (emplois_cadre / nombre_de_reponses) / 100
            const resultatFormule = parseFloat(((tauxCadreReel / nbReponses) * 100).toFixed(1));

            console.log(`Taux emplois cadre (CSV) : ${tauxCadreReel} \nNombre de réponses (CSV) : ${nbReponses}\nRésultat de la formule (taux/rep)/100 : `);

            // Création des graphiques
            updateCadreGraph(resultatFormule);
            updateCadreGraphModal(resultatFormule);


        } else {
            console.warn(`Pas de données dans le CSV pour : ${key}`);
            updateCadreGraph(0);
            updateCadreGraphModal(0);
        }

    } catch (error) {
        console.error("Erreur dans l'orchestrateur :", error);
    }
}

/**
 * Charge et affiche les formations similaires basées sur le tag
 */

async function updateFormationsSimilaires(currentTag, currentIfc) {
    const container = document.querySelector('.right-item__formation-container');
    try {
        // 1. Récupérer toutes les datas locales pour filtrer par tag
        const response = await fetch('../src/data.json');
        const allData = await response.json();

        // 2. Filtrer : Même tag, mais pas la formation actuelle et sélectionner les formations
        const similarCandidates = allData.filter(item => item.tag === currentTag && item.ifc !== currentIfc);

        if (similarCandidates.length === 0) {
            container.innerHTML = '<p>Aucune autre formation similaire trouvée.</p>';
            return;
        }

        container.innerHTML = '';

        // 3. Pour chaque candidat, on doit récupérer le Titre et l'Etablissement via l'API
        const promises = similarCandidates.map(async (item) => {
            const apiData = await getFormationByIfc(item.ifc);
            return {
                local: item,
                api: apiData
            };
        });

        const results = await Promise.all(promises);

        results.forEach(result => {
            if (!result.api) return; // Si l'API a échoué pour l'un d'eux

            const titre = result.api.disci_master || "Master Inconnu";
            const etablissement = result.api.eta_nom || "Établissement";
            const ville = parseVille(result.api.lieux);

            const article = document.createElement('article');
            article.className = 'formation';
            article.innerHTML = `
                <div class="formation__informations">
                   <h3 class="formation__title">Master - ${titre}</h3>
                   <p class="formation__location">${etablissement} <span>·</span> ${ville}</p>
                </div>
                <div class="formation__actions">
                    <a href="#" class="formation__link btn-details">Voir la fiche</a>
                </div>
            `;

            // Ajout de l'événement click
            const btn = article.querySelector('.btn-details');
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log(`Navigation vers la formation similaire : ${result.local.ifc}`);
                // On remonte en haut de page
                window.scrollTo({ top: 0, behavior: 'smooth' });
                // On charge la nouvelle fiche
                afficherDetailsFormation(result.local.ifc);
            });

            container.appendChild(article);
        });

    } catch (error) {
        console.error("Erreur chargement similaires :", error);
        container.innerHTML = '<p>Impossible de charger les suggestions.</p>';
    }
}

// ==== Parser la ville (Tags) ====

function parseVille(lieuBrut) {
    if (lieuBrut.includes("-")) {
        const parts = lieuBrut.split("-");
        return parts[parts.length - 1].trim();
    } else {
        return lieuBrut;
    };
}

// ==== Gestion des Filtres (Tags) ====
function initFilters() {
    const tags = document.querySelectorAll('.filter__tag-link');

    tags.forEach((tag) => {
        tag.addEventListener('click', (e) => {
            e.preventDefault();
            const categorieSelectionnee = tag.textContent.trim().toLowerCase();
            console.log(`Filtre activé : ${categorieSelectionnee}`);
            const ifcActuel = getIFC();
            chargerFormationParTag(categorieSelectionnee, ifcActuel)
        });
    });
}

/**
 * Charge une nouvelle formation aléatoire basée sur le même Tag,
 * mais différente de la formation actuelle.
 */
async function chargerFormationParTag(tagCible, ifcActuel) {
    try {
        const response = await fetch('../src/data.json');
        const dataList = await response.json();

        console.table("Contenu JSON", dataList)

        // 1. Filtrer : Même tag ET IFC différent de l'actuel
        const candidats = dataList.filter(item =>
            item.tag === tagCible && item.ifc !== ifcActuel
        );

        console.log(candidats)

        if (candidats.length > 0) {
            // 2. Tirage aléatoire
            const randomIndex = Math.floor(Math.random() * candidats.length);
            const nextFormation = candidats[randomIndex];

            console.log(`Changement de formation (Tag: ${tagCible}) -> ${nextFormation.ifc}`);

            // 3. Rechargement de la page/vue avec le nouvel IFC
            await afficherDetailsFormation(nextFormation.ifc);
        } else {
            alert("Il n'y a pas d'autre formation disponible pour cette catégorie.");
        }

    } catch (error) {
        console.error("Erreur lors du chargement par tag :", error);
    }
}

// Récupérer l'ifc du Master affiché
function getIFC() {
    const titreMaster = document.getElementById('nomParcours');
    const ifcActuel = titreMaster.dataset.ifc;
    return ifcActuel;
}

// Récupérer un ifc aléatoire

async function getAleaIfc() {

    try {
        const response = await fetch('../src/data.json');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const dataList = await response.json();

        if (dataList && dataList.length > 0) {

            const randomIndex = Math.floor(Math.random() * dataList.length);
            const randomElement = dataList[randomIndex];

            console.log(`Formation sélectionnée aléatoirement : ${randomElement.ifc}`);

            await afficherDetailsFormation(randomElement.ifc);

        } else {
            console.error("Le fichier data.json est vide.");
        }

    } catch (error) {
        console.error("Erreur lors du chargement initial (Aléatoire) :", error);
    }
}

async function main() {
    getAleaIfc();
    initFilters()
}

main();