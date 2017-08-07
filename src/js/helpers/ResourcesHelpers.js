/* eslint-disable no-console */
import fs from 'fs-extra';
import path from 'path-extra';
// constant declarations
const USER_RESOURCES_PATH = path.join(path.homedir(), 'translationCore/resources');
const STATIC_RESOURCES_PATH = path.join(window.__base,'./static/resources');

/**
 * @description moves all bibles from the static folder to the local user translationCore folder.
 */
export function getBibleFromStaticPackage(force = false) {
  let languagesIds = ['en', 'grc', 'he']; // english, greek, hebrew.
  languagesIds.forEach((languagesId) => {
    const STATIC_RESOURCES_BIBLES_PATH = path.join(window.__base, './static/resources', languagesId, 'bibles');
    const BIBLE_RESOURCES_PATH = path.join(path.homedir(), 'translationCore/resources', languagesId, 'bibles');
    let bibleNames = fs.readdirSync(STATIC_RESOURCES_BIBLES_PATH);
    bibleNames.forEach((bibleName) => {
      let bibleSourcePath = path.join(STATIC_RESOURCES_BIBLES_PATH, bibleName);
      let bibleDestinationPath = path.join(BIBLE_RESOURCES_PATH, bibleName);
      if(!fs.existsSync(bibleDestinationPath) || force) {
        fs.copySync(bibleSourcePath, bibleDestinationPath);
      }
    });
  });
}

/**
 * @description moves all translationHelps from the static folder to the resources folder in the translationCore folder.
 */
export function getTHelpsFromStaticPackage(force = false) {
  const languageId = 'en';
  const staticTranslationHelpsPath = path.join(STATIC_RESOURCES_PATH, languageId, 'translationHelps');
  const userTranslationHelpsPath = path.join(USER_RESOURCES_PATH, languageId, 'translationHelps');
  let tHelpsNames = fs.readdirSync(staticTranslationHelpsPath);
  tHelpsNames.forEach((tHelpName) => {
    let tHelpSourcePath = path.join(staticTranslationHelpsPath, tHelpName);
    let tHelpDestinationPath = path.join(userTranslationHelpsPath, tHelpName);
    if(!fs.existsSync(tHelpDestinationPath) || force) {
      fs.copySync(tHelpSourcePath, tHelpDestinationPath);
    }
  });
}

export function copyGroupsIndexToProjectResources(currentToolName, projectGroupsIndexPath) {
  const languageId = 'en';
  const version = currentToolName === 'translationWords' ? 'v6' : 'V0';
  const groupsIndexPath = currentToolName === 'translationWords' ? path.join('kt', 'index.json') : 'index.json';
  const groupsIndexSourcePath = path.join(USER_RESOURCES_PATH, languageId, 'translationHelps', currentToolName, version, groupsIndexPath);
  const groupsIndexDestinationPath = path.join(projectGroupsIndexPath,'index.json');

  if(fs.existsSync(groupsIndexSourcePath)) {
    fs.copySync(groupsIndexSourcePath, groupsIndexDestinationPath);
  } else {
    console.log("translationHelps resources path was not found, " + groupsIndexSourcePath);
  }
}

export function copyGroupsDataToProjectResources(currentToolName, groupsDataDirectory, bookAbbreviation) {
  const languageId = 'en';
  const version = currentToolName === 'translationWords' ? 'v6' : 'V0';
  const groupsFolderPath = currentToolName === 'translationWords' ? path.join('kt', 'groups', bookAbbreviation) : path.join('groups', bookAbbreviation);
  const groupsDataSourcePath = path.join(USER_RESOURCES_PATH, languageId, 'translationHelps', currentToolName, version, groupsFolderPath);

  if(fs.existsSync(groupsDataSourcePath)) {
    fs.copySync(groupsDataSourcePath, groupsDataDirectory);
  } else {
    console.log("translationHelps resources path was not found, " + groupsDataSourcePath);
  }
}

/**
 * @description Helper function to get a bibles manifest file from the bible resources folder.
 * @param {string} bibleVersionPath - path to a bibles version folder.
 * @param {string} bibleID - bible name. ex. ugnt, uhb, udb, ulb.
 */
export function getBibleManifest(bibleVersionPath, bibleID) {
  let fileName = 'manifest.json';
  let bibleManifestPath = path.join(bibleVersionPath, fileName);
  let manifest;

  if(fs.existsSync(bibleManifestPath)) {
    manifest = fs.readJsonSync(bibleManifestPath);
  } else {
    console.error("Could not find manifest for " + bibleID)
  }
  return manifest;
}

/**
 * @description Helper function to get a bibles index from the bible resources folder.
 * @param {string} bibleId - bible name. ex. ugnt, uhb, udb, ulb.
 * @param {string} bibleVersion - release version.
 */
export function getBibleIndex(languageId, bibleId, bibleVersion) {
  const STATIC_RESOURCES_BIBLES_PATH = path.join(window.__base, './static/resources', languageId, 'bibles');
  const fileName = 'index.json';
  const bibleIndexPath = path.join(STATIC_RESOURCES_BIBLES_PATH, bibleId, bibleVersion, fileName);
  let index;

  if(fs.existsSync(bibleIndexPath)) {
    index = fs.readJsonSync(bibleIndexPath);
  } else {
    console.error("Could not find manifest for " + bibleId + ' ' + bibleVersion)
  }
  return index;
}
