// Stocke les instances actives pour gérer le redimensionnement
const charts = [];

/**
 * Définit les paramètres
 * @param {number} Homme - Nombre d'hommes
 * @param {number} Femme - Nombre de femmmes
 */

function settingsComparaisonSexe(Homme, Femme) {

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
                    { value: Homme, name: 'Homme' },
                    { value: Femme, name: 'Femme' }
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
 * @param {number} Homme - Nombre d'hommes
 * @param {number} Femme - Nombre de femmmes
 */

function create(selector, Homme, Femme) {
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
    myChart.setOption(settingsComparaisonSexe(Homme, Femme))

    // Ajoute le graphique au tableau de suivi pour le resize global
    if (!charts.find(c => c.getDom() === dom)) {
        charts.push(myChart);
    }

    return myChart;
}

/**
 * Crée le graph principal
 */
export function updateComparaisonSexe(Homme, Femme) {
    return create(".viz #comparaisonSexe", Homme, Femme);
}

/**
 * Crée le graph dans la modale
 */
export function updateComparaisonSexeModal(Homme, Femme) {
    return create(".viz #comparaisonSexe-modal", Homme, Femme);
}
