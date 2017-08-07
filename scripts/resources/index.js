/* eslint-disable no-console */
import axios from 'axios';
import fs from 'fs-extra';
import path from 'path-extra';

// helpers
import * as biblesHelpers from './helpers/biblesHelpers';
import * as translationHelpsHelpers from './helpers/translationHelpsHelpers';
import * as zipHelpers from './helpers/zipHelpers';
import * as door43ApiHelper from './helpers/door43ApiHelper';
import * as stringsHelper from './helpers/stringsHelpers';

if (!process.argv[2] || !process.argv[3]) {
  console.error(
    '\x1b[31m%s\x1b[0m',
    'Please specify the resource Id and/or language Id',
  );
  console.error(
    '\x1b[36m%s\x1b[0m',
    "For example: npm run update-resource ulb en,\n where 'ulb' is the resource Id and 'en' the language Id",
  );
  process.exit(1);
}
// node process variables
const LANGUAGE_ID = process.argv[2].toLowerCase(); // ex. en, hi, es
const RESOURCE_ID = process.argv[3].toLowerCase(); // ex. ulb, udb, ugnt, tW, tN, tA
// constants
const RESOURCE_Key = stringsHelper.getResourceId(process.argv[3].toLowerCase()); // ex. ulb, udb, ugnt, translatioWords, translationNotes, translationAcademy
const RESOURCE_TYPE = stringsHelper.getResourceType(RESOURCE_ID);
const TEMP_PATH = path.join(__dirname, 'temp');
const RESOURCE_INPUT_PATH = path.join(TEMP_PATH, 'input');
const RESOURCE_OUTPUT_PATH = path.join(
  __dirname,
  '../../static',
  'resources',
  LANGUAGE_ID,
  RESOURCE_TYPE,
  RESOURCE_Key,
);
const ZIP_FILE_PATH = path.join(RESOURCE_INPUT_PATH, RESOURCE_ID + '.zip');

// create temp directories
fs.mkdirsSync(TEMP_PATH);
fs.mkdirsSync(RESOURCE_INPUT_PATH);
fs.mkdirsSync(RESOURCE_OUTPUT_PATH);

console.log(
  '\x1b[36m%s\x1b[0m',
  'The following bible resource will be updated',
);
console.log('\x1b[35m%s\x1b[0m', RESOURCE_ID);

door43ApiHelper
  .getUrl(LANGUAGE_ID, RESOURCE_ID)
  .then(url => {
    axios({
      method: 'get',
      url: url,
      responseType: 'stream'
    }).then(response => {
      console.log('\x1b[33m%s\x1b[0m', 'Downloading zip file ...');
      response.data.pipe(fs.createWriteStream(ZIP_FILE_PATH));
      response.data.on('end', () => {
        // extract zip file
        zipHelpers.extractZipFile(ZIP_FILE_PATH, RESOURCE_INPUT_PATH);
        // path to extracted file
        const extractedFileName = fs
          .readdirSync(RESOURCE_INPUT_PATH)
          .filter(file => {
            // filter out .DS_Store
            return file !== '.DS_Store';
          })[0];
        const extractedFilePath = path.join(
          RESOURCE_INPUT_PATH,
          extractedFileName,
        );

        if (RESOURCE_TYPE === 'bibles') {
          // get array of bibles
          const bibles = fs.readdirSync(extractedFilePath).filter(file => {
            // filter the files to only use .json
            return path.extname(file) === '.usfm';
          });
          // generate bible package
          biblesHelpers.generateBibles(
            bibles,
            extractedFilePath,
            RESOURCE_OUTPUT_PATH,
          );
        } else {
          translationHelpsHelpers.getTranslationHelps(
            extractedFilePath,
            RESOURCE_OUTPUT_PATH,
          );
        }
      });
    })
    .then(() => {
      // remove temp folder
      setTimeout(() => {
        fs.removeSync(TEMP_PATH)
      }, 1000)
    });
  })
  .catch(err => {
    console.error(err);
  });
