/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const referenceFileName = process.argv[2];
console.log(`baseFileName: ${referenceFileName}`);
const baseFilePath = process.argv[3];
const copyMissingKeys = process.argv.includes('--copy-missing-keys');
const checkLogFilePath = path.resolve(process.cwd(), 'locale-check.log');

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

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value)
  );
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    writeLog(`Failed to read JSON file: ${filePath}`);
    writeLog(e && e.stack ? e.stack : String(e));
  }
}

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

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

function main() {
  const baseLocalPath = path.join(localeDir, referenceFileName);
  const baseLocale = readJson(baseLocalPath);

  if (!baseLocale) {
    writeLog(`Failed to read base locale file: ${baseLocalPath}`);
    process.exit(1);
  }

  const localeFiles = fs
    .readdirSync(localeDir)
    .filter((fileName) => (
      fileName.endsWith('.json') &&
      fileName !== referenceFileName
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

    const missingKeys = findMissingKeys(baseLocale, locale);
    const extraKeys = findExtraKeys(baseLocale, locale);

    if (copyMissingKeys && missingKeys.length > 0) {
      const changed = copyMissingKeysFromBase(baseLocale, locale);

      if (changed) {
        fs.writeFileSync(filePath, `${JSON.stringify(locale, null, 2)}\n`, 'utf8');
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
