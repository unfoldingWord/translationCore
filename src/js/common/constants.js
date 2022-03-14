import path from 'path-extra';
import env from 'tc-electron-env';
import dotenv from 'dotenv';
import _ from 'lodash';
import packagefile from '../../../package.json';

makeSureEnvInit();

const isProduction = process.env.NODE_ENV === 'production';
const STATIC_FOLDER_PATH = path.join(__dirname, 'static');// Path to static folder in webpacked code.
export const APP_VERSION = packagefile.version;
export const MIN_COMPATIBLE_VERSION = packagefile.minCompatibleVersion;
// Paths
export const PROJECTS_PATH = path.join(env.home(), 'translationCore', 'projects');
export const USER_RESOURCES_PATH = path.join(env.home(), 'translationCore', 'resources');
export const IMPORTS_PATH = path.join(env.home(), 'translationCore', 'imports');
export const PROJECT_INDEX_FOLDER_PATH = path.join('.apps', 'translationCore', 'index');
export const TEMP_IMPORT_PATH = path.join(env.home(), 'translationCore', 'imports', 'temp');
export const PROJECT_DOT_APPS_PATH = path.join('.apps', 'translationCore');
export const PROJECT_CHECKDATA_DIRECTORY = path.join(PROJECT_DOT_APPS_PATH, 'checkData');
export const STATIC_RESOURCES_PATH = isProduction ? path.join(STATIC_FOLDER_PATH, 'tcResources') : path.join('./tcResources');
export const LOG_FILES_PATH = path.join(env.home(), 'translationCore', 'logs');
export const OSX_DOCUMENTS_PATH = path.join(env.home(), 'Documents');
export const WIN_DOCUMENTS_PATH = path.join(env.home(), 'My Documents');
export const LOCALE_DIR = isProduction ? path.join(STATIC_FOLDER_PATH, 'locale') : path.join('./src/locale');
export const TOOLS_DIR = isProduction ? path.join(STATIC_FOLDER_PATH, 'tC_apps') : path.join('./src/tC_apps');
export const SETTINGS_FOLDER = path.join(env.data(), 'translationCore');
export const SETTINGS_PATH = path.join(SETTINGS_FOLDER, 'settings.json');
export const PROJECT_LICENSES_PATH = isProduction ? path.join(STATIC_FOLDER_PATH, 'projectLicenses') : path.join('./src/assets/projectLicenses');
// string names
export const TC_VERSION = 'tc_version';
export const SOURCE_CONTENT_UPDATER_MANIFEST = 'source-content-updater-manifest.json';
export const tc_EDIT_VERSION_KEY = 'tc_edit_version'; // do not change this string as it will break compatibility with other versions
export const tc_MIN_COMPATIBLE_VERSION_KEY = 'tc_min_compatible_version'; // do not change this string as it will break compatibility with other versions
export const tc_MIN_VERSION_ERROR = 'TC_MIN_VERSION_ERROR';
export const tc_LAST_OPENED_KEY = 'last_opened';
// bible resources strings
export const DEFAULT_GATEWAY_LANGUAGE = 'en';
export const ORIGINAL_LANGUAGE = 'originalLanguage';
export const TARGET_LANGUAGE = 'targetLanguage';
export const TARGET_BIBLE = 'targetBible';
export const TRANSLATION_WORDS = 'translationWords';
export const TRANSLATION_WORDS_LINKS = 'translationWordsLinks';
export const TRANSLATION_NOTES = 'translationNotes';
export const TRANSLATION_ACADEMY = 'translationAcademy';
export const TRANSLATION_HELPS = 'translationHelps';
export const WORD_ALIGNMENT = 'wordAlignment';
export const LEXICONS = 'lexicons';
export const UGL_LEXICON = 'ugl';
export const UHL_LEXICON = 'uhl';
export const DEFAULT_OWNER = `Door43-Catalog`;
// categories
export const toolCardCategories = {
  'kt': 'Key Terms',
  'names': 'Names',
  'other_terms': 'Other Terms',

  'culture': 'Culture',
  'figures': 'Figures of Speech',
  'numbers': 'Numbers',
  'discourse': 'Discourse',
  'grammar': 'Grammar',
  'other': 'Other',
};
// alerts strings
export const ALERT_ALIGNMENTS_RESET_ID = 'alignments_reset';
export const ALERT_SELECTIONS_INVALIDATED_ID = 'selections_invalidated';
export const ALERT_ALIGNMENTS_AND_SELECTIONS_RESET_MSG = 'tools.invalid_verse_alignments_and_selections';
export const ALERT_SELECTIONS_INVALIDATED_MSG = 'tools.selections_invalidated';
export const ALERT_ALIGNMENTS_RESET_MSG = 'tools.alignments_reset_wa_tool';
// url strings
export const DCS_BASE_URL = 'https://git.door43.org'; //TODO: also defined in public/main.js, need to move definition to common place

/**
 * Make sure environment is initialized if running as client.
 * work-around for electron 14+ to get access to runtime environment variables
 */
function makeSureEnvInit() {
  if (!env.isElectronEnv) { // if initialization failed
    const dotenvConfig = dotenv.config()?.parsed;

    if (!dotenvConfig) {
      console.error(`Main - config variables missing`);
    } else {
      console.log('Initializing environment');
      const { app } = require('@electron/remote');
      const pe = process.env;
      const newEnv = _.cloneDeep({
        ...pe,
        ...dotenvConfig,
      });
      env.setEnv(newEnv);
      env.setApp(app);
      env.setElectronEnv(true);
      const home = env.home();

      if (!home) {
        console.error(`Main - cannot find home folder`);
      }

      const build = env.getEnv()?.BUILD;

      if (!build) {
        console.error(`Main - cannot find build number`);
      }
    }
  }
}
