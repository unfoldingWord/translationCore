import fs from 'fs-extra';
import path from 'path-extra';
// constant declarations
const BIBLE_RESOURCES_PATH = path.join(path.homedir(), 'translationCore/resources/bibles');
const THELPS_RESOURCES_PATH = path.join(path.homedir(), 'translationCore/resources/translationHelps');
const STATIC_RESOURCES_BIBLES_PATH = path.join(window.__base, './static/resources/bibles');
const STATIC_RESOURCES_THELPS_PATH = path.join(window.__base,'./static/resources/translationHelps');

/**
 * @description moves all bibles from the static folder to the local user translationCore folder.
 */
export function getBibleFromStaticPackage(force = false) {
  let bibleNames = fs.readdirSync(STATIC_RESOURCES_BIBLES_PATH);
  bibleNames.forEach((bibleName) => {
    let bibleSourcePath = path.join(STATIC_RESOURCES_BIBLES_PATH, bibleName);
    let bibleDestinationPath = path.join(BIBLE_RESOURCES_PATH, bibleName);
    if(!fs.existsSync(bibleDestinationPath) || force) {
      fs.copySync(bibleSourcePath, bibleDestinationPath);
    }
  });
}

/**
 * @description moves all translationHelps from the static folder to the resources folder in the translationCore folder.
 */
export function getTHelpsFromStaticPackage(force = false) {
  let tHelpsNames = fs.readdirSync(STATIC_RESOURCES_THELPS_PATH);
  tHelpsNames.forEach((tHelpName) => {
    let tHelpSourcePath = path.join(STATIC_RESOURCES_THELPS_PATH, tHelpName);
    let tHelpDestinationPath = path.join(THELPS_RESOURCES_PATH, tHelpName);
    if(!fs.existsSync(tHelpDestinationPath) || force) {
      fs.copySync(tHelpSourcePath, tHelpDestinationPath);
    }
  });
}

export function copyGroupsIndexToProjectResources(currentToolName, projectGroupsIndexPath) {
  let version = 'v0';
  let groupsIndexSourcePath = path.join(THELPS_RESOURCES_PATH, currentToolName, version, 'index.json');
  let groupsIndexDestinationPath = path.join(projectGroupsIndexPath,'index.json');
  if(fs.existsSync(groupsIndexSourcePath)) {
    fs.copySync(groupsIndexSourcePath, groupsIndexDestinationPath);
  } else {
    console.log("translationHelps resources path was not found, " + groupsIndexSourcePath);
  }
}

export function copyGroupsDataToProjectResources(currentToolName, groupsDataDirectory, bookAbbreviation) {
  let version = 'v0';
  let groupsDataSourcePath = path.join(THELPS_RESOURCES_PATH, currentToolName, version, 'groups', bookAbbreviation);
  if(fs.existsSync(groupsDataSourcePath)) {
    fs.copySync(groupsDataSourcePath, groupsDataDirectory);
  } else {
    console.log("translationHelps resources path was not found, " + groupsDataSourcePath);
  }
}

/**
 * @description Helper function to get a bibles manifest file from the bible resources folder.
 * @param {string} bibleVersionPath - path to a bibles version folder.
 * @param {string} bibleID - bible name. ex. ugnt, uhb, udb-en, ulb-en.
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
 * @param {string} bibleId - bible name. ex. ugnt, uhb, udb-en, ulb-en.
 * @param {string} bibleVersion - release version.
 */
export function getBibleIndex(bibleId, bibleVersion) {
  let fileName = 'index.json';
  let bibleIndexPath = path.join(STATIC_RESOURCES_BIBLES_PATH, bibleId, bibleVersion, fileName);
  let index;
  if(fs.existsSync(bibleIndexPath)) {
    index = fs.readJsonSync(bibleIndexPath);
  } else {
    console.error("Could not find manifest for " + bibleId + ' ' + bibleVersion)
  }
  return index;
}
