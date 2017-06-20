import fs from 'fs-extra';
import path from 'path-extra';
// constant declarations
const BIBLE_RESOURCES_PATH = path.join(path.homedir(), 'translationCore/resources/bibles');
const THELPS_RESOURCES_PATH = path.join(path.homedir(), 'translationCore/resources/translationHelps');
const STATIC_RESOURCES_BIBLES_PATH = './static/resources/bibles';
const STATIC_RESOURCES_THELPS_PATH = './static/resources/translationHelps';

/**
 * @description moves all bibles from the static folder to the local user translationCore folder.
 */
export function getBibleFromStaticPackage() {
  let bibleNames = fs.readdirSync(STATIC_RESOURCES_BIBLES_PATH);
  bibleNames.forEach((bibleName) => {
    let bibleSourcePath = path.join(STATIC_RESOURCES_BIBLES_PATH, bibleName);
    let bibleDestinationPath = path.join(BIBLE_RESOURCES_PATH, bibleName);
    if(!fs.existsSync(bibleDestinationPath)) {
      fs.copySync(bibleSourcePath, bibleDestinationPath);
    }
  });
}

/**
 * @description moves all translationHelps from the static folder to the resources folder in the translationCore folder.
 */
export function getTHelpsFromStaticPackage() {
  let tHelpsNames = fs.readdirSync(STATIC_RESOURCES_THELPS_PATH);
  tHelpsNames.forEach((tHelpName) => {
    let tHelpSourcePath = path.join(STATIC_RESOURCES_THELPS_PATH, tHelpName);
    let tHelpDestinationPath = path.join(THELPS_RESOURCES_PATH, tHelpName);
    if(!fs.existsSync(tHelpDestinationPath)) {
      fs.copySync(tHelpSourcePath, tHelpDestinationPath);
    }
  });
}

export function copyGroupsIndexToProjectResources(toolName, projectGroupsIndexPath) {
  let version = 'v0';
  let groupsIndexSourcePath = path.join(THELPS_RESOURCES_PATH, toolName, version, 'index.json');
  let groupsIndexDestinationPath = path.join(projectGroupsIndexPath,'index.json');
  if(fs.existsSync(groupsIndexSourcePath)) {
    fs.copySync(groupsIndexSourcePath, groupsIndexDestinationPath);
  } else {
    console.log("translationHelps resources path was not found, " + groupsIndexSourcePath);
  }
}

export function copyGroupsDataToProjectResources(toolName, groupsDataDirectory, bookAbbreviation) {
  let version = 'v0';
  let groupsDataSourcePath = path.join(THELPS_RESOURCES_PATH, toolName, version, 'groups', bookAbbreviation);
  if(fs.existsSync(groupsDataSourcePath)) {
    fs.copySync(groupsDataSourcePath, groupsDataDirectory);
  } else {
    console.log("translationHelps resources path was not found, " + groupsDataSourcePath);
  }
}
