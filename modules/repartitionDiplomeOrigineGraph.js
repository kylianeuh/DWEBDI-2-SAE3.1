import { loadTauxSelectiviteSettings, saveTauxSelectiviteSettings } from "./cacheManagement.js";

// Stocke les instances actives pour gérer le redimensionnement
const charts = [];

/**
 * Définit les paramètre de la jauge de sélectivité
 * @param {number} L3 - Nombre de L3
 * @param {number} LP3 - Nombre de LP3
 * @param {number} Master - Nombre de Master
 * @param {number} Autre - Nombre d'autre
 */

function settingsRepartitionDiplomeOrigine(L3, LP3, Master, Autre) {

    return {
        tooltip: {
            trigger: 'item'
        },
        legend: {
            top: '5%',
            left: 'center'
        },
        series: [
            {
                name: 'Access From',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 40,
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false
                },
                data: [
                    { value : L3, name: 'Licence générale'},
                    { value : LP3, name: 'Licence Pro'},
                    { value: Master, name: 'Master' },
                    { value: Autre, name: 'Autre' },
                ]
            }
        ]
    };
}

// --- Gestionnaire de redimensionnement ---

window.addEventListener('resize', function () {
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
 * @param {number} L3 - Nombre de L3
 * @param {number} LP3 - Nombre de LP3
 * @param {number} Master - Nombre de Master
 * @param {number} Autre - Nombre d'autre
 */

function create(selector, L3, LP3, Master, Autre) {
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
    myChart.setOption(settingsRepartitionDiplomeOrigine(L3, LP3, Master, Autre))

    // Ajoute le graphique au tableau de suivi pour le resize global
    if (!charts.find(c => c.getDom() === dom)) {
        charts.push(myChart);
    }

    return myChart;
}

/**
 * Crée le graph principal
 */
export function updateRepartitionDiplomeOrigine(L3, LP3, Master, Autre) {
    return create(".viz #diplomeOrigine", L3, LP3, Master, Autre);
}

/**
 * Crée le graph dans la modale
 */
export function updateRepartitionDiplomeOrigineModal(L3, LP3, Master, Autre) {
    return create(".viz #diplomeOrigine-modal", L3, LP3, Master, Autre);
}