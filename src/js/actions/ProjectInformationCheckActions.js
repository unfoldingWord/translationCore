/* eslint-disable no-console */
import consts from './ActionTypes';
import fs from 'fs-extra';
import path from 'path-extra';
// helpers
import * as bibleHelpers from '../helpers/bibleHelpers';

export function validate() {
  return ((dispatch, getState) => {
    const { projectSaveLocation } = getState().projectDetailsReducer;
    const projectManifestPath = path.join(projectSaveLocation, 'manifest.json');
    const manifest = fs.readJsonSync(projectManifestPath);
    dispatch(setProjectBookIdAndBookName('eph'));
    if (checkBookReference(manifest) || checkLanguageDetails(manifest) || checkTranslators(manifest) || checkCheckers(manifest)) {
      // dispatch({
      //   ACTIONS TO MAKE THIS CHECK FAIL 
      // })
    }
  });
}

function checkBookReference(manifest) {
  return manifest.project.id && manifest.project.name ? false : true;
}

function checkLanguageDetails(manifest) {
  return (manifest.target_language.direction && 
    manifest.target_language.id && 
    manifest.target_language.name ? false : true);
}

function checkTranslators(manifest) {
  return manifest.translators.length === 0;
}

function checkCheckers(manifest) {
  return manifest.checkers.length === 0;
}


// "project": { "id": "tit", "name": "Titus" }
// "target_language": { "direction": "ltr", "id": "bes", "name": "Besme" }
// "translators": ["beso2", "bes01", "Chrispher Ishaya"],
// "checkers": ["royalsix"],

export function setProjectBookIdAndBookName(bookId) {
  const booName = bibleHelpers.convertToFullBookName(bookId);
  console.log(booName)
  return {
    type: consts.SET_BOOK_ID_AND_NAME,
    bookId,
    booName
  }
}