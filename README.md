# 🎓 Masterz

**Masterz** est une application web de visualisation de données (Data Visualization) destinée aux étudiants. Elle permet d'obtenir rapidement des indicateurs clés sur les formations de Master en France (sélectivité, répartition par genre, origine des candidats) en agrégeant des données publiques.

Ce projet a été réalisé dans le cadre de la **SAE 301-303**.

## 📑 Table des Matières
- [Fonctionnalités](#-fonctionnalités)
- [Technologies Utilisées](#-technologies-utilisées)
- [Architecture des Données](#-architecture-des-données)
- [Installation et Démarrage](#-installation-et-démarrage)
- [Structure du Projet](#-structure-du-projet)

## ✨ Fonctionnalités

L'application récupère et croise des données pour afficher :

* **Fiche d'identité du Master :** Nom, établissement, ville, mode (alternance/initial).
* **Localisation :** Carte interactive (OpenLayers) affichant l'emplacement de l'établissement.
* **Statistiques de Candidature (ECharts) :**
    * **Niveau de sélectivité :** Jauge indiquant le pourcentage d'admis par rapport aux candidats.
    * **Genre des candidats :** Répartition Hommes/Femmes (Graphique Donut).
    * **Processus de sélection :** Entonnoir (Funnel) montrant le ratio Candidats / Propositions / Acceptations.
    * **Origine des diplômes :** Graphiques montrant la provenance académique des candidats (Licence, Master, etc.) pour les propositions et les acceptations.
* **Suggestions :** Proposition de formations similaires basées sur des tags thématiques.
* **Contact :** Informations de contact directes (mail et site web de la formation).

## 🛠 Technologies Utilisées

* **HTML5 / CSS3 :** Structure sémantique et design responsive (Mobile First, Grid, Flexbox).
* **JavaScript (ES6+) :**
    * Utilisation de **Modules ES** (`import`/`export`) pour une architecture modulaire.
    * **Fetch API** pour les appels asynchrones.
    * **LocalStorage** pour la mise en cache des données statiques (limitant les requêtes réseau).
* **[Apache ECharts](https://echarts.apache.org/) :** Librairie de visualisation de données interactive.
* **[OpenLayers](https://openlayers.org/) :** Librairie de cartographie interactive (remplace Google Maps).

## 📊 Architecture des Données

L'application s'appuie sur une architecture distribuée :

1.  **API REST (Recherche & Stats) :**
    * *Endpoint :* `https://la-lab4ce.univ-lemans.fr/masters-stats/api/rest/`
    * Utilisée pour récupérer les détails d'une formation (via son code IFC), les mentions, et les statistiques de candidature (requêtes POST avec filtres).
2.  **API MonMaster (Logos) :**
    * *Endpoint :* `https://monmaster.gouv.fr/api/logo/{uai}`
    * Récupération dynamique des logos des établissements.
3.  **Fichier JSON (Données statiques & Métadonnées) :**
    * *Fichier :* `src/data.json`
    * Sert de base de données locale pour les descriptions textuelles, les tags de catégorie, et les liens spécifiques (site web, mail) qui ne sont pas fournis par l'API principale.
    * Permet également la fonctionnalité "Formation Aléatoire" au démarrage.

## 🚀 Installation et Démarrage

⚠️ **Important :** Ce projet utilisant des modules ES6 (`type="module"`), il **ne peut pas** être ouvert directement en double-cliquant sur `index.html` (problème de politique CORS des navigateurs).

Vous devez utiliser un **serveur local**.

### Prérequis
* Un navigateur moderne.
* Une extension type **Live Server** (VS Code) ou Python/Node.js installé.

### Méthode recommandée (VS Code)
1.  Clonez le projet :
    ```bash
    git clone [https://github.com/kylianeuh/DWEBDI-2-SAE3.1.git](https://github.com/kylianeuh/DWEBDI-2-SAE3.1.git)
    ```
2.  Ouvrez le dossier dans VS Code.
3.  Installez l'extension **Live Server**.
4.  Faites un clic droit sur `index.html` > **Open with Live Server**.

### Méthode alternative (Python)
Dans un terminal, placez-vous à la racine du projet et lancez :
```bash
# Python 3.x
python -m http.server 8000
Ouvrez http://localhost:8000 dans votre navigateur

## Structure du Projet

/
├── index.html                      # Point d'entrée de l'application
├── assets/
│   ├── css/
│   │   └── style.css               # Feuilles de style principales
│   ├── fonts/                      # Polices (ClashDisplay, ClashGrotesk)
│   └── js/
│       └── script.js               # Gestion UI globale (Menu, Filtres)
├── modules/                        # Logique JavaScript (Modules ES)
│   ├── orchestrator.js             # Contrôleur principal (Coordination API <-> Vues)
│   ├── RESTManagement.js           # Service de gestion des appels API
│   ├── cacheManagement.js          # Gestion du cache LocalStorage
│   ├── mapManagement.js            # Gestion de la carte OpenLayers
│   ├── comparaisonSexe.js          # Graphique : Genre
│   ├── processusSelection.js       # Graphique : Entonnoir de sélection
│   ├── tauxSelectiviteGraph.js     # Graphique : Jauge de sélectivité
│   ├── propositionDiplomeOrigineGraph.js # Graphique : Origine (Propositions)
│   └── repartitionDiplomeOrigineGraph.js # Graphique : Origine (Acceptés)
├── src/
│   └── data.json                   # Données locales (Descriptions, Tags, Contacts)
├── documentation/                  # Ressources documentaires
└── package.json                    # Définition du projet (npm)