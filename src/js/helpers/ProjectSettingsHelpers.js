/* eslint-disable no-console */
import path from 'path-extra';
import fs from 'fs-extra';
//helpers
import { tc_LAST_OPENED_KEY } from '../common/constants';
import * as LoadHelpers from './LoadHelpers';

// constants
const template = { [tc_LAST_OPENED_KEY]: null };

/**
 * Retrieves a project's settings and returns it.
 * @param {string} projectPath - path location in the filesystem for the project.
 */
export function getProjectSettings(projectPath) {
  let settings = LoadHelpers.loadFile(projectPath, 'settings.json');

  if (!settings) {
    settings = setUpSettings(projectPath);
  }
  return settings;
}

/**
 * @description Generates and saves a project settings file
 * @param {String} projectSaveLocation - absolute path where the translationCore manifest file will be saved.
 */
export function setUpSettings(projectSaveLocation) {
  const settings = template;

  try {
    // save settings.json
    const settingsLocation = path.join(projectSaveLocation, 'settings.json');
    fs.outputJsonSync(settingsLocation, settings, { spaces: 2 });
  } catch (err) {
    console.error(err);
  }
  return settings;
}
