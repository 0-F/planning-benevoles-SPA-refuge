// Nom de la feuille qui sert de configuration.
const FEUILLE_CONFIGURATION = "Configuration";

/*
  Les termes écrits au format {{VARIABLE}} sont remplacés automatiquement
  par leurs valeurs correspondantes lors de la génération du document.

  Liste des termes disponibles :
    {{SEMAINE}} → numéro de la semaine
    {{AAAA}} → année sur quatre chiffres
*/
// Nom des feuilles générées.
const NOM_FEUILLES = "Semaine{{SEMAINE}}-{{AAAA}}";

// Motif des feuilles qui seront générées.
const MOTIF_FEUILLES = /^Semaine(\d+)-(\d+)$/;

// Motif (expression rationnelle/régulière) des feuilles potentiellement créées par les utilisateurs qui seront automatiquement supprimées.
const MOTIF_FEUILLES_A_SUPPRIMER = /^Feuille \d+$/;

// Nom des identifiants dans la feuille de configuration.
const ID = {
  FORMAT_DATE: "FORMAT_DATE",
  NOM_MODELE: "NOM_MODELE",
  PLAGE_JOURS: "PLAGE_JOURS",
  PLAGE_DATES: "PLAGE_DATES",
  NB_SEMAINES: "NB_SEMAINES"
};

const CFG = getConfiguration();
logObject("Configuration", CFG);

// Nom des feuilles qui ne doivent pas être supprimées. 
const FEUILLES_PROTEGEES = [CFG.templateSheetName, FEUILLE_CONFIGURATION];

// Fonction pour créer un nouveau menu personnalisé.
function creerMenuPersonnalise() {
  SpreadsheetApp.getUi().createMenu("Actions") // nom du menu
    .addItem("Créer les feuilles des semaines", "creeFeuillesDesSemaines")
    .addItem("Supprimer les anciennes feuilles", "supprimeAnciennesFeuilles")
    .addItem("Supprimer les feuilles inutiles", "supprimeFeuillesInutiles")
    .addItem("Afficher les feuilles protégées", "afficheFeuillesProtegees")
    .addItem("Cacher les feuilles protégées", "cacheFeuillesProtegees")
    .addToUi();
}
