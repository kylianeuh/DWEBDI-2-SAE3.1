// Stocke les instances actives pour gérer le redimensionnement
const charts = [];

/**
 * Définit les paramètres
 * @param {number} Homme - Nombre d'hommes
 * @param {number} Femme - Nombre de femmmes
 */

function settingsComparaisonSexe(Homme, Femme, showName = false) {

  const isMobile = window.innerWidth < 540;

  if (isMobile && !showName) {
    return {
      title: {
        text: "Genre des\ncandidats",
        left: "center",
        top: "middle",
      }
    };
  }

  return {
    color: ["#7C2BFF", "#CBABFF"],
    title: {
      text: "Genre des candidats",
      left: "center",
      top: "5%"
    },
    tooltip: {
      trigger: "item",
    },
    legend: showName
      ? { bottom: "5%", left: "center" }
      : { show: false },
    series: [
      {
        name: "Access From",
        type: "pie",
        top: showName ? ' ' : '10%',
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 40,
            fontWeight: "bold",
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          { value: Homme, name: showName ? "Homme" : " " },
          { value: Femme, name: showName ? "Femme" : " " },
        ],
      },
    ],
  };
}

  // --- Gestionnaire de redimensionnement ---
  window.addEventListener("resize", function () {
    charts.forEach((chart) => {
      try {
        if (document.body.contains(chart.getDom())) {
          chart.resize();

          // RECUPERATION DES DONNÉES SAUVEGARDÉES
          if (chart._dataStore) {
            const { Homme, Femme, showName } = chart._dataStore;
            // On force la mise à jour complète avec 'true' pour nettoyer l'ancien affichage
            chart.setOption(settingsComparaisonSexe(Homme, Femme, showName), true);
          }
        }
      } catch (e) {
        console.warn("Erreur resize", e);
      }
    });
  });

/**
 * Fonction générique pour initialiser un graphique sur un sélecteur donné
 * @param {string} selector - Le sélecteur CSS
 * @param {number} Homme - Nombre d'hommes
 * @param {number} Femme - Nombre de femmmes
 */

function create(selector, Homme, Femme, showName = false) {
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
  myChart._dataStore = { Homme, Femme, showName };
  myChart.setOption(settingsComparaisonSexe(Homme, Femme, showName));

  // Ajoute le graphique au tableau de suivi pour le resize global
  if (!charts.find((c) => c.getDom() === dom)) {
    charts.push(myChart);
  }

  return myChart;
}

/**
 * Crée le graph principal
 */
export function updateComparaisonSexe(Homme, Femme) {
  return create(".viz #comparaisonSexe", Homme, Femme, false);
}

/**
 * Crée le graph dans la modale
 */
export function updateComparaisonSexeModal(Homme, Femme) {
  return create(".viz #comparaisonSexe-modal", Homme, Femme, true);
}
