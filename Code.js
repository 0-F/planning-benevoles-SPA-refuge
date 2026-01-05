CLEANUP_SHEETS = false; // Laisser à `false` en production !

function creeFeuillesDesSemaines() {
  if (CLEANUP_SHEETS === true) {
    cleanupSheets();
  }

  const daysPerWeek = 7;

  // va au lundi de la semaine courante
  const today = new Date();
  const startOfWeek = new Date(today);
  const day = startOfWeek.getDay(); // 0 = dimanche
  const diffToMonday = day === 0 ? -6 : 1 - day;
  startOfWeek.setDate(startOfWeek.getDate() + diffToMonday);

  for (let weekOffset = 0; weekOffset < CFG.weeksToCreate; weekOffset++) {
    // récupère le numéro de semaine et l'année
    const weekStartDate = new Date(startOfWeek);
    weekStartDate.setDate(startOfWeek.getDate() + weekOffset * daysPerWeek);
    const { isoYear, isoWeek } = getISOYearAndWeek(weekStartDate);

    // remplace les textes entre {{}} par leur correspondance
    const placeholdersToReplace = {
      SEMAINE: isoWeek,
      AAAA: isoYear
    };

    const sheetName = interpolate(NOM_FEUILLES, placeholdersToReplace);

    if (sheetExists(sheetName)) {
      Logger.log(`La feuille "${sheetName}" existe déjà. Elle ne sera pas modifiée.`);
      continue;
    }

    // duplique et récupère le modèle
    let sheet = duplicateTemplateSheet();

    replacePlaceholdersInSheet(sheet, placeholdersToReplace);

    // ajoute les dates pour la semaine
    const dates = [];
    for (let i = 0; i < daysPerWeek; i++) {
      const date = new Date(weekStartDate);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    sheet.getRange(CFG.dateRange).setValues([dates]);

    // renomme la feuille
    sheet.setName(sheetName);

    // affiche la feuille (si nécessaire)
    sheet.showSheet();
  }
}

function supprimeFeuillesInutiles() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const unauthorizedRegex = MOTIF_FEUILLES_A_SUPPRIMER;
  const protectedSheets = FEUILLES_PROTEGEES;

  ss.getSheets().forEach(sheet => {
    const name = sheet.getName();

    // ne jamais supprimer les feuilles protégées
    if (protectedSheets.includes(name)) {
      return;
    }

    // ne jamais supprimer les feuilles générées
    if (MOTIF_FEUILLES.test(name)) {
      return;
    }

    const unauthorized = unauthorizedRegex.test(name);

    if (unauthorized) {
      Logger.log(`Supprime la feuille "${name}".`);
      ss.deleteSheet(sheet);
    }
  });
}

function protegeEtCacheFeuillesProtegees() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // tableau contenant les noms des feuilles à protéger
  const sheetsToProtect = FEUILLES_PROTEGEES;

  sheetsToProtect.forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (!sheet) {
      Logger.log(`Feuille non trouvée : ${name}`);
      return;
    }

    const protections = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
    if (protections.length == 0) {
      sheet.protect();
    }

    sheet.hideSheet();

    Logger.log(`Feuille protégée et cachée : "${name}".`);
  });
}

function supprimeAnciennesFeuilles() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();

  const now = new Date();
  const { isoWeek: currentWeek, isoYear: currentYear } = getISOYearAndWeek(now);

  const weekSheetNameRegex = MOTIF_FEUILLES;

  sheets.forEach(sheet => {
    const name = sheet.getName();
    const match = name.match(weekSheetNameRegex);

    if (!match) return;

    const sheetWeek = Number(match[1]);
    const sheetYear = Number(match[2]);

    const isOlder =
      sheetYear < currentYear ||
      (sheetYear === currentYear && sheetWeek < currentWeek);

    if (isOlder) {
      Logger.log(`Suppression de la feuille "${name}".`);
      ss.deleteSheet(sheet);
    }
  });
}

function afficheFeuillesProtegees() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetsToShow = FEUILLES_PROTEGEES;

  ss.getSheets().forEach(sheet => {
    if (sheetsToShow.includes(sheet.getName())) {
      sheet.showSheet();
      Logger.log(`Feuille affichée : "${sheet.getName()}".`);
    }
  });
}

function cacheFeuillesProtegees() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetsToHide = FEUILLES_PROTEGEES;

  ss.getSheets().forEach(sheet => {
    if (sheetsToHide.includes(sheet.getName())) {
      sheet.hideSheet();
      Logger.log(`Feuille cachée : "${sheet.getName()}".`);
    }
  });
}
