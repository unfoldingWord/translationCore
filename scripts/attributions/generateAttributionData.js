/**
 * This script generates the third party attribution data as a JSON object written to the specified location
 */
const path = require('path-extra');
const attributionHelpers = require('./attributionHelpers');

// run as main
if(require.main === module) {
  if (process.argv.length < 3) {
    console.error('Syntax: node scripts/attributions/generateAttributionData.js [path to output JSON file]');
    return 1;
  }
  const outputFile = process.argv[2];
  const baseDir = path.join(__dirname, '../..'); // get the root translationCore directory
  attributionHelpers.generateAttributionData(baseDir, outputFile);
}
