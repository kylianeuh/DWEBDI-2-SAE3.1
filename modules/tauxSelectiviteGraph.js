// Stocke les instances actives pour gérer le redimensionnement
const charts = [];

/**
 * Définit les paramètre de la jauge de sélectivité
 * @param {number} taux - Le taux (ex: 25 pour 25%)
 */

function settingsTauxSelectivite(taux, showName = true) {
  return {
    title: {
      text: "Niveau de sélectivité",
    },
    series: [
      {
        type: "gauge",
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        splitNumber: 5,
        radius: "100%",
        center: ["50%", "70%"],

        // Masquer la roue, ticks, labels, pointeur et progress si showName = false
        progress: {
          show: showName,
          width: 18,
          itemStyle: { color: "#7C2BFF" },
        },
        axisLine: { show: showName, lineStyle: { width: 18 } },
        axisTick: { show: showName },
        splitLine: { show: showName },
        axisLabel: {
          show: showName,
          distance: 25,
          color: "#999",
          fontSize: 14,
        },
        pointer: { show: false },
        anchor: { show: false },

        // Toujours afficher le pourcentage
        detail: {
          valueAnimation: true,
          fontSize: 40,
          fontWeight: "bold",
          formatter: "{value}%",
          color: "#7C2BFF",
          offsetCenter: showName ? [0, "-10%"] : [0, "-30%"],
        },
        data: [{ value: taux }],
      },
    ],
  };
}

// --- Gestionnaire de redimensionnement ---

window.addEventListener("resize", function () {
  charts.forEach((chart) => {
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

function create(selector, taux, showName = false) {
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
  myChart.setOption(settingsTauxSelectivite(taux, showName));

  // Ajoute le graphique au tableau de suivi pour le resize global
  if (!charts.find((c) => c.getDom() === dom)) {
    charts.push(myChart);
  }

  return myChart;
}

/**
 * Crée le graph principal
 */
export function updateTauxGraph(taux) {
  return create(".viz #tauxSelectivite", taux, false);
}

/**
 * Crée le graph dans la modale
 */
export function updateTauxGraphModal(taux) {
  return create(".viz #tauxSelectivite-modal", taux, true);
}
