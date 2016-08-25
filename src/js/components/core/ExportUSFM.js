const usfm = require('usfm-parser');
const fs = require(window.__base + 'node_modules/fs-extra');
const path = require('path');

/**
 * @description This function takes JSON and a save location, exporting it as USFM.
 * @param {Object} json - The scripture in json format.
 * @param {String} saveLocation - The save location for the usfm file.
 ******************************************************************************/
function exportUsfm(json, saveLocation, callback) {
  var saveName = json.book + '.usfm';
  var saveFilePath = path.join(saveLocation, saveName);
  var jsonToUsfm = usfm.toUSFM(json);
  fs.writeFile(saveFilePath, jsonToUsfm, callback);
}
exports.exportUsfm = exportUsfm;
