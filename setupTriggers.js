/**
 * Crée (ou recrée) tous les déclencheurs du projet.
 * À exécuter manuellement une seule fois après l’installation.
 */
function setupTriggers() {
  // Fonctions gérées par ce setup
  const HANDLED_FUNCTIONS = [
    'creerMenuPersonnalise',
    'protegeEtCacheFeuillesProtegees',
    'supprimeFeuillesInutiles',
    'creeFeuillesDesSemaines',
    'supprimeAnciennesFeuilles'
  ];

  // Suppression des déclencheurs existants correspondants
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (HANDLED_FUNCTIONS.includes(trigger.getHandlerFunction())) {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // ─────────────────────────────────────────────
  // Déclencheurs "À l'ouverture" du tableur
  // ─────────────────────────────────────────────
  ScriptApp.newTrigger('creerMenuPersonnalise')
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onOpen()
    .create();

  ScriptApp.newTrigger('protegeEtCacheFeuillesProtegees')
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onOpen()
    .create();

  ScriptApp.newTrigger('supprimeFeuillesInutiles')
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onOpen()
    .create();

  // ─────────────────────────────────────────────
  // Déclencheurs basés sur le temps
  // ─────────────────────────────────────────────

  // Tous les lundis entre 2h et 3h
  ScriptApp.newTrigger('creeFeuillesDesSemaines')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(2)
    .create();

  // Tous les lundis entre 3h et 4h
  ScriptApp.newTrigger('supprimeAnciennesFeuilles')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(3)
    .create();
}
