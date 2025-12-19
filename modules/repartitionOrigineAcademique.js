// Stocke les instances actives pour gérer le redimensionnement
const charts = [];

/**
 * Définit les paramètres
 * @param {number} mAcademie - Nombre d'élèves issus de la même académie
 * @param {number} autreAcademie - Nombre d'élèves issus d'une autre académie
 */

function settingsRepartitionOrigineAcademique(mAcademie, autreAcademie) {

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
                    { value: mAcademie, name: "Issus de l'académie de l'établissement" },
                    { value: autreAcademie, name: "Issus d'une autre académie'" }
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
 * @param {number} mAcademie - Nombre d'élèves issus de la même académie
 * @param {number} autreAcademie - Nombre d'élèves issus d'une autre académie
 */

function create(selector, mAcademie, autreAcademie) {
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
    myChart.setOption(settingsRepartitionOrigineAcademique(mAcademie, autreAcademie))

    // Ajoute le graphique au tableau de suivi pour le resize global
    if (!charts.find(c => c.getDom() === dom)) {
        charts.push(myChart);
    }

    return myChart;
}

/**
 * Crée le graph principal
 */
export function updateRepartitionOrigineAcademique(mAcademie, autreAcademie) {
    return create(".viz #repartitionOrigineAcademique", mAcademie, autreAcademie);
}

/**
 * Crée le graph dans la modale
 */
export function updateRepartitionOrigineAcademiqueModal(mAcademie, autreAcademie) {
    return create(".viz #repartitionOrigineAcademique-modal", mAcademie, autreAcademie);
}
