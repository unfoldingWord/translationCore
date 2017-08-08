/* eslint-disable no-console */
import fs from 'fs-extra';
import AdmZip from 'adm-zip';

export function extractZipFile(ZIP_FILE_PATH, RESOURCE_INPUT_PATH) {
  console.log('\x1b[33m%s\x1b[0m', 'Extracting zip file ...');
  const zip = new AdmZip(ZIP_FILE_PATH);
  zip.extractAllTo(RESOURCE_INPUT_PATH, true);
  fs.removeSync(ZIP_FILE_PATH);
}
