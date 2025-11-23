// Stocke les instances actives pour gérer le redimensionnement
const charts = [];

/**
 * Définit les paramètre de la jauge de sélectivité
 * @param {number} taux - Le taux (ex: 25 pour 25%)
 */

function settingsTauxSelectivite(taux) {

    return {
        series: [
            {
                type: 'gauge',
                startAngle: 180,
                endAngle: 0,
                min: 0,
                max: 100,
                splitNumber: 5,
                radius: '100%',
                center: ['50%', '60%'],
                
                progress: {
                    show: true,
                    width: 18,
                    itemStyle: { color: '#5470C6' }
                },
                axisLine: {
                    lineStyle: { width: 18 }
                },
                axisTick: { show: false },
                axisLabel: {
                    distance: 25,
                    color: '#999',
                    fontSize: 14
                },
                pointer: { show: false },
                anchor: { show: false },
                detail: {
                    valueAnimation: true,
                    fontSize: 40,
                    fontWeight: 'bold',
                    formatter: '{value}%',
                    color: 'inherit',
                    offsetCenter: [0, '-20%']
                },
                title: {
                    offsetCenter: [0, '20%'],
                    fontSize: 20,
                    color: '#666'
                },
                data: [{ value: taux, name: 'Taux d\'accès' }]
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
    myChart.setOption(settingsTauxSelectivite(taux))

    // Ajoute le graphique au tableau de suivi pour le resize global
    if (!charts.find(c => c.getDom() === dom)) {
        charts.push(myChart);
    }

    return myChart;
}

/**
 * Crée le graph principal
 */
export function updateTauxGraph(taux) {
    return create(".viz #tauxSelectivite", taux);
}

/**
 * Crée le graph dans la modale
 */
export function updateTauxGraphModal(taux) {
    return create(".viz #tauxSelectivite-modal", taux);
}