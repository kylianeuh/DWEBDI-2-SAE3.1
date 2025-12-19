// Stocke les instances actives pour gérer le redimensionnement
const charts = [];

/**
 * Définit les paramètre de la jauge de sélectivité
 * @param {number} L3 - Nombre de L3
 * @param {number} LP3 - Nombre de LP3
 * @param {number} Master - Nombre de Master
 * @param {number} Ninscrit - Nombre de non inscrits
 * @param {number} Autre - Nombre d'autre
 */

function settingsRepartitionDiplomeOrigine(L3, LP3, Master, Ninscrit, Autre, show_name) {

    const rawCategories = ['Licence 3', 'Licence Pro 3', 'Master', 'Non inscrits', 'Autre'];
    const rawData = [L3, LP3, Master, Ninscrit, Autre];

    const processedData = rawCategories
        .map((category, index) => ({
            name: category,
            value: rawData[index]
        }))
        .filter(item => item.value > 0);

    const filteredCategories = processedData.map(item => item.name);
    const filteredValues = processedData.map(item => item.value);

    return {
        title: {
            text: show_name ? 'Origine des candidats acceptés' :  'Origine des candidats\nacceptés'
        },
        xAxis: {
            max: 'dataMax'
        },
        yAxis: {
            type: 'category',
            data: filteredCategories,
            inverse: true,
            animationDuration: 300,
            animationDurationUpdate: 300,
        },
        tooltip: {
            trigger: 'item',
            formatter: '{c} candidats'
        },
        series: [
            {
                realtimeSort: true,
                type: 'bar',
                data: filteredValues,
                label: {
                    show: false,
                    position: 'right',
                    valueAnimation: true
                }
            }
        ],
        legend: {
            show: true
        },
        animationDuration: 0,
        animationDurationUpdate: 3000,
        animationEasing: 'linear',
        animationEasingUpdate: 'linear'
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
 * @param {number} Ninscrit - Nombre de non inscrits
 * @param {number} Autre - Nombre d'autre
 */

function create(selector, L3, LP3, Master, Ninscrit, Autre, show_name = true) {
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
    myChart.setOption(settingsRepartitionDiplomeOrigine(L3, LP3, Master, Ninscrit, Autre, show_name))

    // Ajoute le graphique au tableau de suivi pour le resize global
    if (!charts.find(c => c.getDom() === dom)) {
        charts.push(myChart);
    }

    return myChart;
}

/**
 * Crée le graph principal
 */
export function updateRepartitionDiplomeOrigine(L3, LP3, Master, Ninscrit, Autre) {
    return create(".viz #repartitionDiplomeOrigine", L3, LP3, Master, Ninscrit, Autre, false);
}

/**
 * Crée le graph dans la modale
 */
export function updateRepartitionDiplomeOrigineModal(L3, LP3, Master, Ninscrit, Autre) {
    return create(".viz #repartitionDiplomeOrigine-modal", L3, LP3, Master, Ninscrit, Autre, true);
}