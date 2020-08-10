import path from 'path-extra';
import fs from 'fs-extra';
import {
  getToolCategories, getToolsByKey, getTranslate,
} from '../selectors';
import * as alerts from '../reducers/alerts';
import {
  ALERT_ALIGNMENTS_AND_SELECTIONS_RESET_MSG,
  ALERT_ALIGNMENTS_RESET_ID,
  ALERT_SELECTIONS_INVALIDATED_ID,
  WORD_ALIGNMENT,
} from '../common/constants';

/**
 * Loads all of the tools found in a directory
 * @ {string} dir - the directory containing tools to load
 * @returns {Array}
 */
export const loadToolsInDir = async toolsDir => {
  let tools = [];
  const promises = [];

  // TRICKY: fs.access does not work on asar directories so we cannot use `fs.access`
  if (!fs.existsSync(toolsDir)) {
    console.warn(`No tools found in missing directory ${toolsDir}.`);
    return [];
  }

  const files = await fs.readdir(toolsDir);

  for (const f of files) {
    const toolPath = path.join(toolsDir, f);
    const stat = fs.statSync(toolPath);

    if (stat.isDirectory()) {
      try {
        console.log(`Loading tool "${f}`);
        promises.push(loadTool(toolPath));
      } catch (e) {
        console.error(`Failed to load tool "${f}"`, e);
      }
    }
  }

  try {
    tools = await Promise.all(promises);
  } catch (e) {
    console.error(`Failed to load tools`, e);
  }
  return tools;
};

/**
 * Loads a tool from a directory.
 * This validates and loads the tool.
 * @param {string} toolDir - path to the tool
 * @return the tool object.
 */
export const loadTool = async (toolDir) => {
  const toolName = path.basename(toolDir);
  const packagePath = path.join(toolDir, 'package.json');

  // Validate package files
  const validatePaths = [packagePath];

  for (const p of validatePaths) {
    // eslint-disable-next-line no-await-in-loop
    const exists = await fs.exists(p);

    if (!exists) {
      throw new Error(`Error loading tool "${toolName}". Missing ${p}`);
    }
  }

  // load the actual tool
  const meta = await fs.readJson(packagePath);
  let tool = null;
  let badge = null;

  try {
    console.log('meta=' + JSON.stringify(meta));
    //TODO: correct require path
    // const toolRequirePath = path.join('../../tC_apps', toolName, meta.main);
    // // console.log('toolPath=' + toolRequirePath);
    // const module = require(toolRequirePath);
    let module = null;

    switch (toolName) { // tricky, with webpack the paths to require must be defined at compile time, not generated at runtime
    case 'wordAlignment':
      module = require('../../tC_apps/wordAlignment/index');
      badge = require('../../tC_apps/wordAlignment/badge.png');
      break;

    case 'translationWords':
      module = require('../../tC_apps/translationWords/index');
      badge = require('../../tC_apps/translationWords/badge.png');
      // TRICKY: Temporary fix for translationWords badge image
      badge = badge.default;
      break;

    case 'translationNotes':
      module = require('../../tC_apps/translationNotes/index');
      badge = require('../../tC_apps/translationNotes/badge.png');
      break;

    default:
      throw new Error(`loading unsupported for tool "${toolName}"`);
    }

    tool = module.default;
  } catch (e) {
    const message = `Error loading tool "${toolName}"`;
    console.error(message, e);
    throw new Error(message);
  }

  // patch in some extra props
  tool.badge = badge;
  tool.version = meta.version;
  tool.title = meta.title;
  tool.description = meta.description;
  tool.path = toolDir;
  return tool;
};

/**
 * determines if invalidation alert is already showing
 * @param {String} toolName
 * @param {Object} state
 * @return {Boolean} - true if invalidation is displaying
 */
export const isInvalidationAlertDisplaying = (state, toolName) => {
  let selectionsInvalidAlert = alerts.findAlert(state, ALERT_SELECTIONS_INVALIDATED_ID);
  const alignmentsInvalidAlert = alerts.findAlert(state, ALERT_ALIGNMENTS_RESET_ID);

  if (alignmentsInvalidAlert) { // could also be combined alert, check message
    const alignAndSelectionsInvalidMessage = getTranslate(state)(ALERT_ALIGNMENTS_AND_SELECTIONS_RESET_MSG);

    if (alignmentsInvalidAlert.children === alignAndSelectionsInvalidMessage) {
      selectionsInvalidAlert = alignmentsInvalidAlert;
    }
  }

  const alertAlreadyDisplayed = toolName === WORD_ALIGNMENT ? alignmentsInvalidAlert : selectionsInvalidAlert;
  return !!alertAlreadyDisplayed;
};

/**
 * calls tool API to get invalid count for tool
 * @param {Object} state
 * @param {String} toolName
 * @return {number}
 */
export const getInvalidCountForTool = (state, toolName) => {
  let numInvalidChecks = 0;
  const toolApi = (getToolsByKey(state))[toolName];

  if (toolApi) {
    const selectedCategories = getToolCategories(state, toolName);
    numInvalidChecks = toolApi.api.trigger('getInvalidChecks', selectedCategories);
  }
  return numInvalidChecks;
};
