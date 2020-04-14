/* eslint-disable eqeqeq */
import fs from 'fs-extra';
import CryptoJS from 'crypto-js';
import { SETTINGS_PATH } from '../common/constants';
//  consts declaration

export const loadSettings = () => {
  // defining as undefined so that we dont forget that we must
  // return undefined, never null
  let settings = undefined;

  try {
    if (fs.existsSync(SETTINGS_PATH)) {
      settings = fs.readJsonSync(SETTINGS_PATH);

      if (!settings.toolsSettings) {
        settings.toolsSettings = {};
      }
      settings.onlineMode = false;
      //this is a temporary fix until there is a better workflow for persisting online/offline mode.
    } else {
      console.info('No settings file found therefore it will be created when the settings reducer is fully loaded');
    }
  } catch (err) {
    console.warn(err);
  }
  return settings;
};

export function loadUserdata() {
  let loginReducer = {
    loggedInUser: false,
    userdata: {},
  };

  let localUserdata = JSON.parse(localStorage.getItem('localUser'));

  if (localStorage.getItem('user')) {
    let phrase = 'tc-core';
    let decrypted = CryptoJS.AES.decrypt(localStorage.getItem('user'), phrase);
    let userdata = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
    loginReducer.userdata = userdata;
    loginReducer.loggedInUser = true;
  } else if (localUserdata) {
    loginReducer.userdata = localUserdata;
    loginReducer.loggedInUser = true;
  }

  return loginReducer;
}
/**
 * @description - Returns the corresponding group name i.e. Metaphor
 * given the group id such as figs_metaphor
 * @param {array} indexObject - Array of index.json with {id, name} keys
 * @param {string} groupId - The id of the index object corresponding to tHelps i.e. figs_metaphor
 */
export function getGroupName(indexObject, groupId) {
  try {
    let groupNameIndex = Object.keys(indexObject).find((index) => indexObject[index].id == groupId);
    return indexObject[groupNameIndex].name;
  } catch (e) {
    console.warn('Could not find group name for id: ', groupId);
    return '';
  }
}
