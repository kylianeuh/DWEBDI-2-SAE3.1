import { loadProportionCadreSettings, saveProportionCadreSettings } from "./cacheManagement.js";

// Stocke les instances actives pour gérer le redimensionnement
const charts = [];

/**
 * Crée la jauge de proportion
 * @param {number} taux - Le taux (ex: 25 pour 25%)
 */

function settingsProportionGraph(taux) {

    return {
        tooltip: {
            formatter: '{a} <br/>{b} : {c}%'
        },
        series: [
            {
                name: 'Taux',
                type: 'gauge',
                radius: '100%',
                center: ['50%', '60%'],
                progress: {
                    show: true
                },
                detail: {
                    valueAnimation: true,
                    formatter: '{value}%'
                },
                data: [
                    {
                        value: taux,
                        name: "Taux d'admission",
                    }
                ]
            }
        ]
    };
}

// --- Gestionnaire de redimensionnement ---

window.addEventListener('resize', function() {
    charts.forEach(chart => {
        try {
            // Vérifie si le conteneur est toujours dans le DOM avant de resize
            if (document.body.contains(chart.getDom())) {
                chart.resize();
            }
        } catch (e) {
            console.warn("Erreur lors du redimensionnement du graphique", e);
        }
    });
});


/**
 * Fonction générique pour initialiser un graphique sur un sélecteur donné
 * @param {string} selector - Le sélecteur CSS 
 * @param {number} taux - La valeur à afficher
 */

function create(selector, taux) {
    const dom = document.querySelector(selector);
    if (!dom) {
        console.error(`Element introuvable pour le sélecteur : ${selector}`);
        return null;
    }

    // Vérifie si une instance existe déjà et la détruit proprement
    let myChart = echarts.getInstanceByDom(dom);
    if (myChart) {
        myChart.dispose();
    }

    myChart = echarts.init(dom);
    myChart.setOption(settingsProportionGraph(taux))

    // Ajoute le graphique au tableau de suivi pour le resize global
    if (!charts.find(c => c.getDom() === dom)) {
        charts.push(myChart);
    }

    return myChart;
}

/**
 * Crée le graph principal
 */
export function updateCadreGraph(taux) {
    return create(".viz #tauxCadre", taux);
}

/**
 * Crée le graph dans la modale
 */
export function updateCadreGraphModal(taux) {
    return create(".viz #tauxCadre-modal", taux);
}