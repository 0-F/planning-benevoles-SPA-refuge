/*
Guide visuel des heures locales France (CET/CEST) pour les triggers Apps Script, avec le niveau de sécurité par plage horaire :

00 h – 01 h	✅ Sûr	Triggers exécutés normalement. Pas de DST.
01 h – 02 h	🟠 Prudent	En pratique sûr, mais le jour du passage à l’été, l’heure 1 h → 2 h. Risque minime.
02 h – 03 h	🔴 Risqué	Jour du passage à l’été : déclencheur peut être manqué (2 h → 3 h).
              Jour du passage à l’hiver : déclencheur peut être exécuté deux fois. ⚠️ Utiliser UTC.
03 h – 05 h	🟠 Prudent	Heure doublée ou début après heure sautée. Déclencheur généralement sûr, mais UTC est plus robuste.
06 h – 23 h	✅ Sûr	Triggers exécutés normalement. Pas de DST.
*/

/**
 * Crée (ou recrée) tous les déclencheurs du projet.
 * À exécuter manuellement une seule fois après l’installation.
 */
function setupTriggers() {
  // Fonctions gérées par ce setup
  const HANDLED_FUNCTIONS = [
    "creerMenuPersonnalise",
    "protegeEtCacheFeuillesProtegees",
    "supprimeFeuillesInutiles",
    "creeFeuillesDesSemaines",
    "supprimeAnciennesFeuilles"
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
  ScriptApp.newTrigger("creerMenuPersonnalise")
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onOpen()
    .create();

  ScriptApp.newTrigger("protegeEtCacheFeuillesProtegees")
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onOpen()
    .create();

  ScriptApp.newTrigger("supprimeFeuillesInutiles")
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onOpen()
    .create();

  // ─────────────────────────────────────────────
  // Déclencheurs basés sur le temps
  // ─────────────────────────────────────────────

  // Tous les jours
  ScriptApp.newTrigger("metEnGrasJourActuel")
    .timeBased()
    .everyDays(1)
    .atHour(0)
    .create();

  // Tous les lundis
  ScriptApp.newTrigger("creeFeuillesDesSemaines")
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(0)
    .create();

  // Tous les lundis
  ScriptApp.newTrigger("supprimeAnciennesFeuilles")
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(0)
    .create();
}

/**
 * Supprime tous les triggers du projet actuel.
 */
function deleteAllTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    ScriptApp.deleteTrigger(trigger);
  });
  Logger.log(`Deleted ${triggers.length} triggers.`);
}
