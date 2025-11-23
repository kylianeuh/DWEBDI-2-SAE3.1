import { getFormationByIfc, loadAndParseCSV, getAllDataJson } from './RESTManagement.js';
import { updateTauxGraph, updateTauxGraphModal } from './tauxSelectiviteGraph.js';
import { updateCadreGraph, updateCadreGraphModal } from './proportionCadreGraph.js';
import { updateRepartitionDiplomeOrigine, updateRepartitionDiplomeOrigineModal } from './repartitionDiplomeOrigineGraph.js';


export async function afficherDetailsFormation(ifc) {
    try {
        const url = `https://data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/catalog/datasets/fr-esr-mon_master/records?where=ifc=${ifc}&limit=1`;

        console.log("Appel API :", url);
        if (!ifc) throw new Error("Veuillez entrer un identifiant IFC.");

        const data = await getFormationByIfc(ifc);

        // Absence de data

        if (!data) {
            console.warn("Aucune donnée trouvée pour cet IFC");
            return;
        }

        console.log("Données reçues :", data);

        // Gestion du nom du parcours
        const nomParcours = data?.disci_master || "Nom inconnu";
        const baliseNomParcours = document.getElementById('nomParcours');
        baliseNomParcours.textContent = ` Master - ${nomParcours}`;

        // Gestion du l'alternance
        const baliseAlternance = document.getElementById('alternance');
        if (baliseAlternance) {
            baliseAlternance.textContent = Number(data.alternance) === 1 ? "Alternance" : "Initial";
        }

        // Gestion localisation (établissement, ville, département)
        const lieuBrut = data.lieux || "";
        let villeFormatee = "";
        if (lieuBrut.includes("-")) {
            const parts = lieuBrut.split("-");
            villeFormatee = parts[parts.length - 1].trim();
        } else {
            villeFormatee = lieuBrut;
        };

        const etablissement = data.eta_nom || "";
        const baliseLocalisation = document.getElementById('localisation');
        baliseLocalisation.textContent = `${etablissement} • ${villeFormatee}`;

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

        const BaliseMap = document.getElementById('mapEtab');
        if (BaliseMap) {
            if (localData && localData.adresse) {
                const adresseEncodee = encodeURIComponent(localData.adresse);
                BaliseMap.src = `https://maps.google.com/maps?q=${adresseEncodee}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
            } else {
                console.warn("Adresse manquante pour la carte");
                BaliseMap.style.display = "none";
            }
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

        // Gestion du taux d'admission

        const nPropTotal = Number(data.n_prop_total) || 0;
        const nCan = Number(data.n_can_pp) || 0;

        let tauxCalcule = 0;

        if (nCan > 0) {
            tauxCalcule = parseFloat(((nPropTotal / nCan) * 100).toFixed(1));
        }

        console.log(`Calcul Taux : (${nPropTotal} / ${nCan}) * 100 = ${tauxCalcule}%`);

        // Création des graphiques
        updateTauxGraph(tauxCalcule);
        updateTauxGraphModal(tauxCalcule);

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

        // Taux de cadre (depuis le CSV)

        const insertionData = await loadAndParseCSV();
        console.log(insertionData);

        const uai = data.eta_uai;

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


function main() {
    const ifc = "1800799UZ1SW";
    afficherDetailsFormation(ifc);
}

main();