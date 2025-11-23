# 🎓 Masterz - Dashboard d'Orientation Master

![Statut](https://img.shields.io/badge/Status-Prototype-orange)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

**Masterz** est une application web de visualisation de données (Data Visualization) destinée aux étudiants. Elle permet d'obtenir rapidement des indicateurs clés sur les formations de Master en France (sélectivité, insertion professionnelle, salaires) en agrégeant des données publiques.

Ce projet a été réalisé dans le cadre de la **SAE 303** (Conception de services et produits multimédias).

## 📑 Table des Matières
- [Fonctionnalités](#-fonctionnalités)
- [Technologies Utilisées](#-technologies-utilisées)
- [Architecture des Données](#-architecture-des-données)
- [Installation et Démarrage](#-installation-et-démarrage)
- [Structure du Projet](#-structure-du-projet)
- [Auteurs](#-auteurs)

## ✨ Fonctionnalités

L'application récupère et croise des données pour afficher :

* **Fiche d'identité du Master :** Nom, établissement, ville, mode (alternance/initial).
* **Jauges de Performance (ECharts) :**
    * 📉 **Taux d'accès :** Pourcentage d'admis par rapport aux candidats.
    * 👔 **Taux d'emploi cadre :** Proportion de diplômés occupant un poste de cadre.
* **Répartition des Origines :** Graphique "Donut" montrant la provenance des étudiants (Licence Générale, Pro, Master, Autre).
* **Données Financières :** Comparaison du salaire médian en sortie de formation vs la moyenne du domaine (via CSV).
* **Localisation :** Carte interactive (OpenStreetMap/Google) et informations de contact.
* **Comparateur :** Suggestions de formations similaires (Interface UI).

## 🛠 Technologies Utilisées

* **HTML5 / CSS3 :** Structure sémantique et design responsive (Mobile First).
* **JavaScript (ES6+) :**
    * Utilisation de **Modules ES** (`import`/`export`) pour structurer le code.
    * **Fetch API** pour les appels asynchrones (API OpenData & fichiers locaux).
    * **LocalStorage** pour la mise en cache des configurations.
* **[Apache ECharts](https://echarts.apache.org/) :** Librairie de visualisation de données interactive.

## 📊 Architecture des Données

L'application s'appuie sur une architecture hybride :

1.  **API OpenData (Temps réel) :**
    * *Source :* `data.enseignementsup-recherche.gouv.fr` (Jeu de données "Mon Master").
    * Utilisé pour les informations générales et les taux de candidature.
2.  **Fichier CSV (Statistique lourde) :**
    * *Fichier :* `fr-esr-insertion_professionnelle-master_up2025.csv`
    * Utilisé pour les données d'insertion professionnelle et de salaires (parsing JS côté client).
3.  **Fichier JSON (Données statiques) :**
    * *Fichier :* `data.json`
    * Sert de base de données locale pour les descriptions détaillées et les métadonnées spécifiques non fournies par l'API.

## 🚀 Installation et Démarrage

⚠️ **Important :** Ce projet utilisant des modules ES6 (`type="module"`) et la méthode `fetch` sur des fichiers locaux, il **ne peut pas** être ouvert directement en double-cliquant sur `index.html` (erreur CORS).

Vous devez utiliser un **serveur local**.

### Prérequis
* Un navigateur moderne.
* Une extension type **Live Server** (VS Code) ou Python/Node.js.

### Méthode recommandée (VS Code)
1.  Clonez le projet :
    ```bash
    git clone [https://github.com/votre-user/masterz-sae303.git](https://github.com/votre-user/masterz-sae303.git)
    ```
2.  Ouvrez le dossier dans VS Code.
3.  Faites un clic droit sur `index.html` > **Open with Live Server**.

### Méthode alternative (Python)
```bash
cd chemin/vers/le/projet
python -m http.server 8000
# Ouvrez http://localhost:8000 dans votre navigateur

### Structure du projet

/
├── index.html              # Point d'entrée de l'application
├── assets/
│   └── css/
│       └── style.css       # Feuilles de style (Variables, Flexbox, Grid)
├── csv/
│   └── fr-esr...2025.csv   # Données brutes insertion pro
├── modules/                # Logique JavaScript
│   ├── orchestrator.js     # Contrôleur principal (Appels API -> Graphs)
│   ├── RESTManagement.js   # Gestion des appels réseaux et parsing CSV
│   ├── cacheManagement.js  # Gestion du LocalStorage
│   ├── [graph]Graph.js     # Modules de génération des graphiques ECharts
│   └── script.js           # Gestion UI (Menu, Modales)
└── src/
  └── data.json           # Données locales complémentaires