/*
  ⚠️ À utiliser uniquement sur un classeur de test

  ▶️ Lancer
  _runAllTests();

  ▶️ Supprimer les feuilles créées
  _cleanupTestSheets();
 */

/*************************************************
 * CONFIGURATION
 *************************************************/

const TEST_CONFIG = {
  TEST_SHEET_PREFIX: "__TEST__",
  WEEK_SHEET_PREFIX: "Semaine",
  COPIED_SHEET_NAME: "Copie de ",
  MAIN_FUNCTION: creeFeuillesDesSemaines,
  REGEX_SHEET_NAME: /^Semaine\d{1,2}-\d{4}$/,
  CLEANUP_AFTER_TESTS: false,
};

/*************************************************
 * TEST RUNNER
 *************************************************/

function _runAllTests() {
  if (PropertiesService.getScriptProperties().getProperty('ENV') !== "test") {
    throw new Error("L'environnement sélectionné n'est pas un environnement de test. Ajoutez une propriétés du script `ENV` avec la valeur `test`.");
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet()

  ss.getSheetByName(CFG.templateSheetName).showSheet();
  ss.getSheetByName(FEUILLE_CONFIGURATION).showSheet();

  const tests = [
    test_getIsoWeekInfo,
    test_sheetExists,
    test_duplicateTemplateSheet,
    test_mainFunction,

    // Regression tests
    test_regression_noDuplicateWeeklySheet,
    test_regression_numberOfWeeklySheets,
    test_regression_weekDatesAreConsistent,
    test_regression_templateSheetNotModified,
    test_regression_sheetNameFormat
  ];

  const results = [];
  let passed = 0;

  tests.forEach(testFn => {
    beforeEach();
    try {
      testFn();
      results.push({ test: testFn.name, status: "PASSED" });
      passed++;
    } catch (e) {
      results.push({
        test: testFn.name,
        status: "FAILED",
        error: e.message
      });
    } finally {
      afterEach();
    }
  });

  logTestReport(results, passed, tests.length);
}

/*************************************************
 * CLEANUP
 *************************************************/

function _cleanupTestSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();

  sheets.forEach(sheet => {
    const name = sheet.getName();
    if (
      name.startsWith(TEST_CONFIG.TEST_SHEET_PREFIX) ||
      name.startsWith(TEST_CONFIG.WEEK_SHEET_PREFIX) ||
      name.startsWith(TEST_CONFIG.COPIED_SHEET_NAME)
    ) {
      ss.deleteSheet(sheet);
    }
  });
}

/*************************************************
 * ASSERTIONS
 *************************************************/

function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(
      `❌ ${message}\nExpected: ${expected}\nActual: ${actual}`
    );
  }
}

function assertTrue(condition, message) {
  if (!condition) {
    throw new Error(`❌ ${message}`);
  }
}

function assertFalse(condition, message) {
  if (condition) {
    throw new Error(`❌ ${message}`);
  }
}

/*************************************************
 * TEST LIFECYCLE
 *************************************************/

function beforeEach() {
  _cleanupTestSheets();
}

function afterEach() {
  if (TEST_CONFIG.CLEANUP_AFTER_TESTS) {
    _cleanupTestSheets();
  }
}

/*************************************************
 * REPORTING
 *************************************************/

function logTestReport(results, passed, total) {
  Logger.log("========== TEST REPORT ==========");
  results.forEach(r => {
    Logger.log(
      `${r.status === "PASSED" ? "✅" : "❌"} ${r.test}`
    );
    if (r.error) {
      Logger.log("   " + r.error);
    }
  });
  Logger.log(`🎯 RESULT: ${passed}/${total} tests passed`);
  Logger.log("=================================");
}

/*************************************************
 * UNIT TESTS
 *************************************************/

function test_getIsoWeekInfo() {
  // 29/12/2025 = ISO week 1 of 2026
  const date = new Date(2025, 11, 29);
  const { isoYear, isoWeek } = getISOYearAndWeek(date);

  assertEquals(isoYear, 2026, "ISO year should be 2026");
  assertEquals(isoWeek, 1, "ISO week should be 1");
}

function test_sheetExists() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const name = `${TEST_CONFIG.TEST_SHEET_PREFIX}_EXISTS`;

  ss.insertSheet(name);

  assertTrue(sheetExists(name), "Sheet should exist");
}

/*************************************************
 * INTEGRATION TESTS
 *************************************************/

function test_duplicateTemplateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let template = ss.getSheetByName(CFG.templateSheetName);
  if (!template) {
    template = ss.insertSheet(CFG.templateSheetName);
    template.getRange("A1").setValue("Template");
  }

  const copy = duplicateTemplateSheet();

  assertTrue(
    copy.getName().startsWith(TEST_CONFIG.COPIED_SHEET_NAME + CFG.templateSheetName),
    "Duplicated sheet name should start with template name"
  );
}

function test_mainFunction() {
  TEST_CONFIG.MAIN_FUNCTION();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const names = ss.getSheets().map(s => s.getName());

  const found = names.some(name =>
    name.startsWith(TEST_CONFIG.WEEK_SHEET_PREFIX)
  );

  assertTrue(found, "Weekly sheets should be created");
}

/*************************************************
 * NON-REGRESSION TESTS
 *************************************************/

function test_regression_noDuplicateWeeklySheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Création manuelle d'une feuille semaine
  const existingSheetName = TEST_CONFIG.WEEK_SHEET_PREFIX + "1-2026";
  ss.insertSheet(existingSheetName);

  // Exécution
  TEST_CONFIG.MAIN_FUNCTION();

  // Vérification
  const sheets = ss.getSheets()
    .filter(s => s.getName() === existingSheetName);

  assertEquals(
    sheets.length,
    1,
    "Weekly sheet should not be duplicated"
  );
}

function test_regression_numberOfWeeklySheets() {
  TEST_CONFIG.MAIN_FUNCTION();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const weeklySheets = ss.getSheets()
    .filter(s => s.getName().startsWith(TEST_CONFIG.WEEK_SHEET_PREFIX));

  assertEquals(
    weeklySheets.length,
    CFG.weeksToCreate,
    "Number of weekly sheets should match CFG.weeksToCreate"
  );
}

function test_regression_weekDatesAreConsistent() {
  TEST_CONFIG.MAIN_FUNCTION();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheets()
    .find(s => s.getName().startsWith(TEST_CONFIG.WEEK_SHEET_PREFIX));

  const dates = sheet.getRange(CFG.dateRange).getValues()[0];

  const monday = dates[0];
  const sunday = dates[dates.length - 1];

  const diffDays =
    (sunday - monday) / (1000 * 60 * 60 * 24);

  assertEquals(
    diffDays,
    6,
    "Week should span exactly 7 days (Monday to Sunday)"
  );
}

function test_regression_templateSheetNotModified() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let template = ss.getSheetByName(CFG.templateSheetName);

  if (!template) {
    template = ss.insertSheet(CFG.templateSheetName);
  }

  const originalValue = template.getRange("A1").getValue();

  TEST_CONFIG.MAIN_FUNCTION();

  const afterValue = template.getRange("A1").getValue();

  assertEquals(
    afterValue,
    originalValue,
    "Template sheet must not be modified"
  );
}

function test_regression_sheetNameFormat() {
  TEST_CONFIG.MAIN_FUNCTION();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheets()
    .find(s => s.getName().startsWith(TEST_CONFIG.WEEK_SHEET_PREFIX));

  const name = sheet.getName();
  const regex = TEST_CONFIG.REGEX_SHEET_NAME;

  assertTrue(
    regex.test(name),
    `Sheet name format invalid: ${name}`
  );
}
