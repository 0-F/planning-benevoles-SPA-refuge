function logObject(label, obj) {
  Logger.log(`${label}:\n${JSON.stringify(obj, null, 2)}`);
}

function interpolate(template, variables) {
  return template.replace(/{{(\w+)}}/g, (_, key) =>
    variables[key] ?? ""
  );
}

function getISOYearAndWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  // Thursday determines the ISO year
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);

  const isoYear = d.getFullYear();
  const week1 = new Date(isoYear, 0, 4);
  const isoWeek = 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);

  return { isoYear, isoWeek };
}

function getConfiguration() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const configSheet = ss.getSheetByName(FEUILLE_CONFIGURATION);

  if (!configSheet) {
    throw new Error(`La feuille "${FEUILLE_CONFIGURATION}" n'a pas été trouvée !`);
  }

  // retrieve configuration values
  const dateFormat = getValueFromID(ID.FORMAT_DATE);
  const templateName = getValueFromID(ID.NOM_MODELE);
  const dateRange = getValueFromID(ID.PLAGE_DATES);
  const weeksToCreate = getValueFromID(ID.NB_SEMAINES);

  weeksToCreate.value = parseInt(weeksToCreate.value);
  if (isNaN(weeksToCreate.value)) {
    throw new Error(`Erreur : dans la feuille "${FEUILLE_CONFIGURATION}", la valeur qui correspond à d'identifiant "${weeksToCreate.id}" doit être un nombre.`);
  }

  // return an object with all configurations
  return {
    dateFormat: dateFormat.value,
    templateSheetName: templateName.value,
    dateRange: dateRange.value,
    weeksToCreate: weeksToCreate.value
  };
}

function getValueFromID(id) {
  const COLUMN_C = 3;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(FEUILLE_CONFIGURATION);

  // recherche limitée à la colonne A
  const finder = sheet
    .getRange("A:A")
    .createTextFinder(id)
    .matchCase(true)
    .findNext();

  if (!finder) {
    throw new Error(`"${id}" not found in column A`);
  }

  return {
    id: finder.getValue(),
    value: sheet.getRange(finder.getRow(), COLUMN_C).getValue()
  };
}

function cleanupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();

  sheets.forEach(sheet => {
    const name = sheet.getName();
    if (MOTIF_FEUILLES.test(name)) {
      ss.deleteSheet(sheet);
    }
  });
}

function replacePlaceholdersInSheet(sheet, valuesMap) {
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found`);
  }

  Object.entries(valuesMap).forEach(([key, value]) => {
    sheet
      .createTextFinder(`{{${key}}}`)
      .replaceAllWith(String(value));
  });
}

/**
 * Duplique la feuille modèle.
 */
function duplicateTemplateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CFG.templateSheetName);

  return sheet.copyTo(ss);
}

/**
 * Renvoie `true` si la feuille existe.
 */
function sheetExists(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(sheetName) !== null;
}

/**
 * Fusionne la première feuille dans la deuxième.
 */
function mergeSheets(srcName, dstName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const src = ss.getSheetByName(srcName);
  const dst = ss.getSheetByName(dstName);

  const range = src.getDataRange();
  const values = range.getValues();
  const formulas = range.getFormulas();

  const startRow = range.getRow();
  const startCol = range.getColumn();

  for (let i = 0; i < values.length; i++) {
    for (let j = 0; j < values[i].length; j++) {

      const value = values[i][j];
      const formula = formulas[i][j];

      // ignorer les cellules vides
      if (value === "" && formula === "") continue;

      const targetCell = dst.getRange(startRow + i, startCol + j);

      // copier formule ou valeur
      if (formula) {
        targetCell.setFormula(formula);
      } else {
        targetCell.setValue(value);
      }

      // copier le format
      range.getCell(i + 1, j + 1)
        .copyTo(targetCell, { contentsOnly: true });
    }
  }

  // copier les largeurs de colonnes
  const nbCols = src.getLastColumn();
  for (let c = 1; c <= nbCols; c++) {
    dst.setColumnWidth(c, src.getColumnWidth(c));
  }
}
