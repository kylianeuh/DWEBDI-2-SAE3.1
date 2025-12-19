// Stocke les instances actives pour gérer le redimensionnement
const charts = [];

/**
 * Définit les paramètres
 * @param {number} can - Nombre d'élèves candidats
 * @param {number} prop - Nombre d'élèves ayant reçus une proposition 
 * @param {number} prop_accept - Nombre d'élèves ayant acceptés une proposition 
 */

function settingsProcessusSelection(can, prop, prop_accept, show_name) {

    return {
        color: ["#6200FF", "#9654FF", "#E4D4FF"],
        title: {
            text: 'Processus de selection'
        },
        tooltip: {
            trigger: 'item',
            formatter: '{d} %'
        },
        legend: {
            data: ['Candidat', 'Candidat ayant reçus une proposition', 'Candidats ayant acceptés une proposition']
        },
        series: [
            {
                name: 'Funnel',
                type: 'funnel',
                left: '10%',
                top: show_name ? 80 : 70,
                width: '80%',
                min: 0,
                max: 100,
                minSize: '0%',
                maxSize: '100%',
                sort: 'descending',
                gap: 2,
                label: {
                    show: true,
                    position: 'inside',
                    formatter: function (params) {
                        return params.data.realValue;
                    }
                },
                labelLine: {
                    length: 10,
                    lineStyle: {
                        width: 1,
                        type: 'solid'
                    }
                },
                itemStyle: {
                    borderColor: '#fff',
                    borderWidth: 1
                },
                emphasis: {
                    label: {
                        fontSize: 20
                    }
                },
                data: [
                    { value: 100, realValue: can, name: show_name ? 'Candidat' : ' ' },
                    { value: 66, realValue: prop, name: show_name ? 'Candidat ayant reçus une proposition' : ' ' },
                    { value: 33, realValue: prop_accept, name: show_name ? 'Candidats ayant acceptés une proposition' : ' ' }
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
 * @param {number} can - Nombre d'élèves candidats
 * @param {number} prop - Nombre d'élèves ayant reçus une proposition 
 * @param {number} prop_accept - Nombre d'élèves ayant acceptés une proposition 
 */

function create(selector, can, prop, prop_accept, show_name = true) {
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
    myChart.setOption(settingsProcessusSelection(can, prop, prop_accept, show_name))

    // Ajoute le graphique au tableau de suivi pour le resize global
    if (!charts.find(c => c.getDom() === dom)) {
        charts.push(myChart);
    }

    return myChart;
}

/**
 * Crée le graph principal
 */
export function updateProcessusSelection(can, prop, prop_accept) {
    return create(".viz #processusSelection", can, prop, prop_accept, false);
}

/**
 * Crée le graph dans la modale
 */
export function updateProcessusSelectionModal(can, prop, prop_accept) {
    return create(".viz #processusSelection-modal", can, prop, prop_accept, true);
}
