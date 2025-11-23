// Stocke les instances actives pour gérer le redimensionnement
const charts = [];

/**
 * Définit les paramètre de la jauge de sélectivité
 * @param {number} salaireMedian - Salaire median en sortie de formation
 * @param {number} SalaireMoyenneDiscipline - Salaire moyenne des formations dans le même discipline
 */

function settingsSalaire(salaireMedian, SalaireMoyenneDiscipline) {
    return {
            title: {
                text: 'Comparaison salaire moyen 2025',
                left: 'center'
            },

            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: '{b}: {c} €'
            },

            xAxis: {
                type: 'category',
                data: [
                    'Revenu moyen en sortie de ce Master',
                    'Revenu moyen en sortie de Master dans le même domaine'
                ],
                axisLabel: {
                    interval: 0,
                    rotate: 15
                }
            },

            yAxis: {
                type: 'value',
                name: 'Revenu moyen (€)',
                axisLabel: {
                    formatter: '{value} €'
                }
            },

            series: [
                {
                    type: 'bar',
                    data: [salaireMedian, SalaireMoyenneDiscipline],
                    label: {
                        show: true,
                        position: 'top',
                        formatter: '{c} €'
                    },
                    barWidth: '50%'
                }
            ],

            grid: {
                bottom: 100
            }
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
 * @param {number} salaireMedian - Salaire median en sortie de formation
 * @param {number} SalaireMoyenneDiscipline - Salaire moyenne des formations dans le même discipline
 */

function create(selector, salaireMedian, SalaireMoyenneDiscipline) {
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
    myChart.setOption(settingsSalaire(salaireMedian, SalaireMoyenneDiscipline))

    // Ajoute le graphique au tableau de suivi pour le resize global
    if (!charts.find(c => c.getDom() === dom)) {
        charts.push(myChart);
    }

    return myChart;
}

/**
 * Crée le graph principal
 */
export function updateSalaire(salaireMedian, SalaireMoyenneDiscipline) {
    return create(".viz #salaire", salaireMedian, SalaireMoyenneDiscipline);
}

/**
 * Crée le graph dans la modale
 */
export function updateSalaireModal(salaireMedian, SalaireMoyenneDiscipline) {
    return create(".viz #salaire-modal", salaireMedian, SalaireMoyenneDiscipline);
}