import path from "path-extra";
import ospath from "ospath";
import packagefile from '../../../package.json';

export const APP_VERSION = packagefile.version;
export const MIN_COMPATIBLE_VERSION = packagefile.minCompatibleVersion;

export const TRANSLATION_WORDS = 'translationWords';
export const TRANSLATION_NOTES = 'translationNotes';
export const TRANSLATION_ACADEMY = 'translationAcademy';
export const TRANSLATION_HELPS = 'translationHelps';
export const WORD_ALIGNMENT = 'wordAlignment';

export const PROJECTS_PATH = path.join(ospath.home(), 'translationCore', 'projects');
export const USER_RESOURCES_PATH = path.join(ospath.home(), "translationCore", "resources");
export const THELPS_EN_RESOURCES_PATH = path.join(USER_RESOURCES_PATH, 'en', TRANSLATION_HELPS);
export const IMPORTS_PATH = path.join(ospath.home(), 'translationCore', 'imports');
export const PROJECT_INDEX_FOLDER_PATH = path.join('.apps', 'translationCore', 'index');
export const TEMP_IMPORT_PATH = path.join(ospath.home(), 'translationCore', 'imports', 'temp');

export const PROJECT_DOT_APPS_PATH = path.join('.apps', 'translationCore');
export const PROJECT_CHECKDATA_DIRECTORY = path.join(PROJECT_DOT_APPS_PATH, 'checkData');
export const STATIC_RESOURCES_PATH = path.join(__dirname, "../../../tcResources");

export const TC_VERSION = "tc_version";
export const SOURCE_CONTENT_UPDATER_MANIFEST = "source-content-updater-manifest.json";

export const tc_EDIT_VERSION_KEY = "tc_edit_version"; // do not change this string as it will break compatibility with other versions
export const tc_MIN_COMPATIBLE_VERSION_KEY = "tc_min_compatible_version"; // do not change this string as it will break compatibility with other versions
export const tc_MIN_VERSION_ERROR = "TC_MIN_VERSION_ERROR";

export const ORIGINAL_LANGUAGE = "originalLanguage";
export const TARGET_LANGUAGE = "targetLanguage";
export const TARGET_BIBLE = "targetBible";

export const toolCardCategories = {
  'kt': 'Key Terms',
  'names': 'Names',
  'other_terms': 'Other Terms',

  'culture': 'Culture',
  'figures': 'Figures of Speech',
  'numbers': 'Numbers',
  'discourse': 'Discourse',
  'grammar': 'Grammar',
  'other': 'Other'
};
