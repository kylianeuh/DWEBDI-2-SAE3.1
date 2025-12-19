import { getFormationByIfc, getMention, loadAndParseCSV, getAllDataJson, searchStats, getFullDataJson } from './RESTManagement.js';
import { updateTauxGraph, updateTauxGraphModal } from './tauxSelectiviteGraph.js';
import { updateComparaisonSexe, updateComparaisonSexeModal } from './comparaisonSexe.js';
import { updateProcessusSelection, updateProcessusSelectionModal } from './processusSelection.js';
import { updatePropositionDiplomeOrigine } from './propositionDiplomeOrigineGraph.js';
import { updateRepartitionDiplomeOrigine, updateRepartitionDiplomeOrigineModal } from './repartitionDiplomeOrigineGraph.js';
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
        const idSecDiscipline = data_formation?.secDiscId;

        const mention = await getMention(idSecDiscipline);

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

        if (!isNaN(lat) && !isNaN(lon)) {
            console.log(`Mise à jour coordonnées : ${lat}, ${lon}`);
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
            setActiveTag(localData.tag);
        } else {
            console.warn("Ps de tag trouvé pour charger les formations similaires.")
            document.querySelector('.right-item__formation-container').innerHTML = "<p>Aucune suggestion disponible.</p>";
        }

        // =================================================================
        // GESTION REQUETE SEARCH [candidatures]
        // =================================================================

        const uai = data_formation.etabUai;
        console.log(`Recherche Stats Candidatures pour UAI: ${uai} et ifc : ${ifc}`);

        if (uai && ifc) {
            const filters = {
                etablissementIds: [uai],
                formationIfcs: [ifc],
            };

            const harvest = {
                typeStats: "candidatures",
                candidatureDetails: ["general", "experience", "origine"]
            };

            const statsData = await searchStats(filters, harvest);
            console.log("Stats Candidatures reçues :", statsData);

            // --- A. Gestion du taux de sélectivité ---

            if (statsData.candidatures[0]["general"]) {

                const nPropTotal = statsData.candidatures[0]["general"]["prop"];
                console.log(`Nombre de propositions : ${nPropTotal}`);
                const nCan = statsData.candidatures[0]["general"]["nb"];
                console.log(`Nombre de candidatures : ${nCan}`);

                let tauxCalcule = 0;

                if (nCan > 0) {
                    tauxCalcule = parseFloat(((nPropTotal / nCan) * 100).toFixed(1));
                }

                console.log(`Calcul Taux : (${nPropTotal} / ${nCan}) * 100 = ${tauxCalcule}%`);

                // Création des graphiques
                updateTauxGraph(tauxCalcule);
                updateTauxGraphModal(tauxCalcule);
            } else {
                console.warn("Aucune statistique pour candidatures[général]");
                updateTauxGraph(0);
                updateTauxGraphModal(0);
            }

            // --- B. Répartition homme/femme ---

            if (statsData.candidatures[0]["general"]) {

                const nFemmes = statsData.candidatures[0]["general"]["nbFemmes"];
                console.log(`Nombre de femmes : ${nFemmes}`);
                const nHommes = (statsData.candidatures[0]["general"]["nb"] - nFemmes);
                console.log(`Nombre d'hommes : ${nHommes}`);

                // Création des graphiques
                updateComparaisonSexe(nHommes, nFemmes);
            } else {
                console.warn("Aucune statistique pour candidatures[général]");
                updateComparaisonSexe(0, 0);
            }

            // --- C. Répartition des diplomes en propositions ---

            if (statsData.candidatures[0]["general"] && statsData.candidatures[0]["experience"]) {

                const L3 = statsData.candidatures[0]["experience"]["lg3"]['prop'];
                console.log(`Candidats issus de LG3 : ${L3}`);
                const LP3 = statsData.candidatures[0]["experience"]["lp3"]['prop'];
                console.log(`Candidats issus de LP3 : ${LP3}`);
                const master = statsData.candidatures[0]["experience"]["master"]['prop'];
                console.log(`Candidats issus de Master : ${master}`);
                const ninscrit = statsData.candidatures[0]["experience"]["noninscrit"]['prop'];
                console.log(`Candidats non inscrit : ${ninscrit}`);
                const autre = statsData.candidatures[0]["experience"]["autre"]['prop'];
                console.log(`Candidats issus d'une autre formation : ${autre}`);

                console.log("Répartition :", { L3, LP3, master, ninscrit, autre });

                // Création des graphiques
                updatePropositionDiplomeOrigine(L3, LP3, master, ninscrit, autre);
            } else {
                console.warn("Aucune statistique pour candidatures[général] ou candidatures[experience]");
                updatePropositionDiplomeOrigine(0, 0, 0, 0, 0);
            }

            // --- E. Processus de sélection ---
            if (statsData.candidatures[0]["general"]) {

                const nCan = statsData.candidatures[0]["general"]["nb"];
                console.log(`Nombre de candidatures : ${nCan}`);
                const nPropTotal = statsData.candidatures[0]["general"]["prop"];
                console.log(`Nombre de propositions : ${nPropTotal}`);
                const nPropAccept = statsData.candidatures[0]["general"]["accept"];
                console.log(`Nombre d'élèves ayant acceptés une proposition  : ${nPropAccept}`);

                // Création des graphiques
                updateProcessusSelection(nCan, nPropTotal, nPropAccept);
                updateProcessusSelectionModal(nCan, nPropTotal, nPropAccept);
            } else {
                console.warn("Aucune statistique pour candidatures[général]");
                updateProcessusSelection(0, 0, 0);
                updateProcessusSelectionModal(0, 0, 0);
            }

            // --- F. Répartition des diplomes ---

            if (statsData.candidatures[0]["general"] && statsData.candidatures[0]["origine"]) {

                const L3 = statsData.candidatures[0]["experience"]["lg3"]['accept'];
                console.log(`Candidats issus de LG3 : ${L3}`);
                const LP3 = statsData.candidatures[0]["experience"]["lp3"]['accept'];
                console.log(`Candidats issus de LP3 : ${LP3}`);
                const master = statsData.candidatures[0]["experience"]["master"]['accept'];
                console.log(`Candidats issus de Master : ${master}`);
                const ninscrit = statsData.candidatures[0]["experience"]["noninscrit"]['accept'];
                console.log(`Candidats non inscrit : ${ninscrit}`);
                const autre = statsData.candidatures[0]["experience"]["autre"]['accept'];
                console.log(`Candidats issus d'une autre formation : ${autre}`);

                // Création des graphiques
                updateRepartitionDiplomeOrigine(L3, LP3, master, ninscrit, autre);
            } else {
                console.warn("Aucune statistique pour candidatures[général] ou candidatures[origine]");
                updateRepartitionDiplomeOrigine(0, 0);
            }
        } else {
            console.warn("Données manquantes (UAI ou IFC) pour la recherche stats.");
        }

    } catch (error) {
        console.error("Erreur dans l'orchestrateur :", error);
    }
}

/**
 * Charge une formation aléatoire correspondant au tag
 * @param {string} tagCible - Le tag normalisé (ex: "informatique")
 */

async function chargerFormationAleatoireParTag(tagCible) {
    try {
        const allFormations = await getFullDataJson();

        const titreMaster = document.getElementById('nomParcours');
        const currentIfc = titreMaster ? titreMaster.dataset.ifc : null;
        const candidats = allFormations.filter(item => {
            const itemTag = item.tag.toLowerCase();
            return itemTag === tagCible;
        });
        if (candidats.length === 0) {
            alert("Aucune formation trouvée pour cette catégorie.");
            return;
        }
        let choixPossibles = candidats.filter(f => f.ifc !== currentIfc);
        if (choixPossibles.length === 0) {
            choixPossibles = candidats;
        }

        const randomIndex = Math.floor(Math.random() * choixPossibles.length);
        const formationElue = choixPossibles[randomIndex];
        window.scrollTo({ top: 0, behavior: 'smooth' });

        await afficherDetailsFormation(formationElue.ifc);
    } catch {
        console.error("Erreur lors du filtre par tag :", error);
    }
}


// ==== Gestion des Filtres (Tags) ====
function initFilters() {
    const tags = document.querySelectorAll('.filter__tag');

    tags.forEach((tag) => {
        tag.addEventListener('click', (e) => {
            e.preventDefault();
            let tagLabel = tag.textContent.trim().toLowerCase();
            console.log(`🔍 Filtre cliqué : "${tagLabel}"`);
            chargerFormationAleatoireParTag(tagLabel);
        });
    });
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

        for (const result of results) {
            if (!result.api) continue;

            console.log("Formation Similaire :", result.api)

            const idSecDiscipline = result.api.secDiscId;
            const mention = await getMention(idSecDiscipline);
            const etablissement = result.api.lieux;
            console.log('idSecDiscipline : ', idSecDiscipline, 'Mention :', mention, 'Etablissement:', etablissement)

            const article = document.createElement('article');
            article.className = 'formation';
            article.innerHTML = `
                <div class="formation__informations">
                   <h3 class="formation__title">Master - ${mention}</h3>
                   <p class="formation__location">${etablissement}</p>
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
        };

    } catch (error) {
        console.error("Erreur chargement similaires :", error);
        container.innerHTML = '<p>Impossible de charger les suggestions.</p>';
    }
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


// Visibilité du tag actif

function setActiveTag(tagValue) {
    const tags = document.querySelectorAll(".filter__tag");

    tags.forEach((tag) => {
        tag.classList.remove("active");

        const link = tag.querySelector(".filter__tag-link");
        if (!link) return;

        if (link.textContent.trim().toLowerCase() === tagValue.toLowerCase()) {
            tag.classList.add("active");
        }
    });
    updateFilterLabel(tagValue);
}

//Mise à jour des filtre
function updateFilterLabel(tagValue) {
    const filterDiv = document.querySelector(".filter__div");
    if (!filterDiv) return;

    const title = filterDiv.querySelector("h3");
    if (!title) return;

    // Majuscule à la première lettre
    const formattedTag = tagValue.charAt(0).toUpperCase() + tagValue.slice(1);

    title.textContent = formattedTag;
}

async function main() {
    await getAleaIfc();
    initFilters()
}

main();