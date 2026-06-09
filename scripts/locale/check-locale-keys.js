/**
 * Locale Key Checker
 *
 * This script validates locale (translation) JSON files against a reference locale file.
 * It checks for missing keys, extra keys, and optionally copies missing keys from the reference file.
 *
 * Usage:
 *   node scripts/locale/check-locale-keys.js <referenceFileName> <baseFilePath> [--copy-missing-keys]
 *
 * Arguments:
 *   referenceFileName - Name of the reference locale file (e.g., English-en_US.json)
 *   baseFilePath - Path to the directory containing locale files
 *   --copy-missing-keys - Optional flag to copy missing keys from reference to other locale files
 *
 * Example:
 *   node scripts/locale/check-locale-keys.js English-en_US.json src/locale
 *   node scripts/locale/check-locale-keys.js English-en_US.json src/locale --copy-missing-keys
 *
 * Output:
 *   Creates a locale-check.log file in the current working directory with results
 *   Exit code 1 if there are missing or extra keys, 0 otherwise
 */

/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const referenceFileName = process.argv[2];
console.log(`baseFileName: ${referenceFileName}`);
const baseFilePath = process.argv[3];
const copyMissingKeys = process.argv.includes('--copy-missing-keys');
const checkLogFilePath = path.resolve(process.cwd(), 'locale-check.log');

/**
 * Writes a message to both the log file and console
 * @param {string} message - The message to write (defaults to empty string)
 */
function writeLog(message = '') {
  fs.appendFileSync(checkLogFilePath, `${message}\n`, 'utf8');
  console.log(message);
}

fs.writeFileSync(checkLogFilePath, '', 'utf8');

writeLog(`baseFileName: ${referenceFileName}`);

if (!referenceFileName || !baseFilePath) {
  writeLog('Usage: node scripts/check-locale-keys.js <referenceFileName> <baseFilePath> [--copy-missing-keys]');
  writeLog('Example: node scripts/check-locale-keys.js English-en_US.json src/locale/English-en_US.json');
  writeLog('Example with copying missing keys: node scripts/check-locale-keys.js English-en_US.json src/locale/English-en_US.json --copy-missing-keys');
  process.exit(1);
}

const localeDir = path.resolve(baseFilePath);
const resolvedBaseFilePath = path.resolve(baseFilePath);
writeLog(`Checking base locale file: ${resolvedBaseFilePath}`);
writeLog(`Copy missing keys: ${copyMissingKeys ? 'enabled' : 'disabled'}`);

/**
 * Checks if a value is a plain object (not an array or null)
 * @param {*} value - The value to check
 * @returns {boolean} True if value is a plain object
 */
function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value)
  );
}

/**
 * Reads and parses a JSON file
 * @param {string} filePath - Path to the JSON file
 * @returns {Object|undefined} Parsed JSON object, or undefined if reading/parsing fails
 */
function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    writeLog(`Failed to read JSON file: ${filePath}`);
    writeLog(e && e.stack ? e.stack : String(e));
  }
}

/**
 * Deep clones a value using JSON serialization
 * @param {*} value - The value to clone
 * @returns {*} Deep cloned copy of the value
 */
function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * Sorts the keys of a locale object to match the order of keys in a reference object
 * Keys present in referenceObject are placed first, followed by any extra keys from localeObject
 * @param {Object} referenceObject - The reference object defining the desired key order
 * @param {Object} localeObject - The object to sort
 * @returns {Object} New object with keys sorted to match reference
 */
function sortKeysLikeReference(referenceObject, localeObject) {
  const sortedObject = {};

  // First, add keys that exist in reference in reference order
  Object.keys(referenceObject).forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(localeObject, key)) {
      return;
    }

    if (
      isPlainObject(referenceObject[key]) &&
      isPlainObject(localeObject[key])
    ) {
      sortedObject[key] = sortKeysLikeReference(referenceObject[key], localeObject[key]);
      return;
    }

    sortedObject[key] = localeObject[key];
  });

  // Then add any extra keys not in reference
  Object.keys(localeObject).forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(sortedObject, key)) {
      sortedObject[key] = localeObject[key];
    }
  });

  return sortedObject;
}

/**
 * Recursively copies missing keys from baseObject to localeObject
 * Modifies localeObject in place
 * @param {Object} baseObject - The reference object containing all required keys
 * @param {Object} localeObject - The object to update with missing keys
 * @returns {boolean} True if any keys were added or modified
 */
function copyMissingKeysFromBase(baseObject, localeObject) {
  let changed = false;

  Object.keys(baseObject).forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(localeObject, key)) {
      localeObject[key] = cloneValue(baseObject[key]);
      changed = true;
      return;
    }

    if (isPlainObject(baseObject[key])) {
      if (!isPlainObject(localeObject[key])) {
        localeObject[key] = cloneValue(baseObject[key]);
        changed = true;
        return;
      }

      if (copyMissingKeysFromBase(baseObject[key], localeObject[key])) {
        changed = true;
      }
    }
  });

  return changed;
}

/**
 * Recursively finds keys that exist in baseObject but are missing in compareObject
 * @param {Object} baseObject - The reference object containing expected keys
 * @param {Object} compareObject - The object to compare against
 * @param {string} currentPath - Current path prefix for nested keys (used in recursion)
 * @returns {string[]} Array of missing key paths in dot notation (e.g., "parent.child.key")
 */
function findMissingKeys(baseObject, compareObject, currentPath = '') {
  const missingKeys = [];

  Object.keys(baseObject).forEach((key) => {
    const keyPath = currentPath ? `${currentPath}.${key}` : key;

    if (
      !compareObject ||
      !Object.prototype.hasOwnProperty.call(compareObject, key)
    ) {
      missingKeys.push(keyPath);
      return;
    }

    if (isPlainObject(baseObject[key])) {
      if (!isPlainObject(compareObject[key])) {
        missingKeys.push(keyPath);
        return;
      }

      missingKeys.push(
        ...findMissingKeys(baseObject[key], compareObject[key], keyPath)
      );
    }
  });

  return missingKeys;
}

/**
 * Recursively finds keys that exist in compareObject but not in baseObject
 * @param {Object} baseObject - The reference object containing expected keys
 * @param {Object} compareObject - The object to check for extra keys
 * @param {string} currentPath - Current path prefix for nested keys (used in recursion)
 * @returns {string[]} Array of extra key paths in dot notation (e.g., "parent.child.key")
 */
function findExtraKeys(baseObject, compareObject, currentPath = '') {
  const extraKeys = [];

  Object.keys(compareObject).forEach((key) => {
    const keyPath = currentPath ? `${currentPath}.${key}` : key;

    if (
      !baseObject ||
      !Object.prototype.hasOwnProperty.call(baseObject, key)
    ) {
      extraKeys.push(keyPath);
      return;
    }

    if (isPlainObject(compareObject[key])) {
      if (!isPlainObject(baseObject[key])) {
        extraKeys.push(keyPath);
        return;
      }

      extraKeys.push(
        ...findExtraKeys(baseObject[key], compareObject[key], keyPath)
      );
    }
  });

  return extraKeys;
}

/**
 * Main execution function
 * Validates all locale files in the directory against the reference locale file
 * Optionally copies missing keys if --copy-missing-keys flag is provided
 * Writes results to log file and sets appropriate exit code
 */
function main() {
  const referenceLocalPath = path.join(localeDir, referenceFileName);
  const referenceLocale = readJson(referenceLocalPath);
  const ignoreFiles = [referenceFileName, '.DS_Store', 'nonTranslatable.json'];

  if (!referenceLocale) {
    writeLog(`Failed to read base locale file: ${referenceLocalPath}`);
    process.exit(1);
  }

  const localeFiles = fs
    .readdirSync(localeDir)
    .filter((fileName) => (
      fileName.endsWith('.json') &&
      !ignoreFiles.includes(fileName)
    ))
    .sort();

  let totalMissingKeys = 0;
  let totalExtraKeys = 0;

  localeFiles.forEach((fileName) => {
    const filePath = path.join(localeDir, fileName);
    writeLog(`Checking locale file: ${filePath}`);
    const locale = readJson(filePath);

    if (!locale) {
      writeLog(`\nFailed to read locale file: '${filePath}' - skipping...`);
      return;
    }

    const missingKeys = findMissingKeys(referenceLocale, locale);
    const extraKeys = findExtraKeys(referenceLocale, locale);

    if (copyMissingKeys && missingKeys.length > 0) {
      const changed = copyMissingKeysFromBase(referenceLocale, locale);

      if (changed) {
        const sortedLocale = sortKeysLikeReference(referenceLocale, locale);
        fs.writeFileSync(filePath, `${JSON.stringify(sortedLocale, null, 2)}\n`, 'utf8');
        writeLog(`${fileName}: copied missing key(s) from base locale`);
      }
    }

    if (missingKeys.length === 0 && extraKeys.length === 0) {
      writeLog(`${fileName}: OK`);
      return;
    }

    totalMissingKeys += missingKeys.length;
    totalExtraKeys += extraKeys.length;

    if (missingKeys.length > 0) {
      writeLog(`\n${fileName}: ${missingKeys.length} missing key(s)`);
      missingKeys.forEach((key) => {
        writeLog(`  - ${key}`);
      });
    }

    if (extraKeys.length > 0) {
      writeLog(`\n${fileName}: ${extraKeys.length} extra key(s)`);
      extraKeys.forEach((key) => {
        writeLog(`  - ${key}`);
      });
    }
  });

  if (totalMissingKeys > 0 || totalExtraKeys > 0) {
    writeLog(`\nTotal missing keys: ${totalMissingKeys}`);
    writeLog(`Total extra keys: ${totalExtraKeys}`);
    process.exitCode = 1;
  } else {
    writeLog('\nAll locale files match the base locale keys.');
  }

  writeLog(`Check log written to: ${checkLogFilePath}`);
}

main();
