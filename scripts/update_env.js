// Writes some updated keys to the .env file.
// Non-conflicting values in .env will be preserved.
const ENV_PATH = './.env';
const fs = require('fs');
const commit = require('child_process')
  .execSync('git rev-parse HEAD')
  .toString().trim();

const dotenv = require('dotenv');

/**
 * Safely loads the .env file
 * @returns {{}}
 */
function loadEnv() {
  if (fs.existsSync(ENV_PATH)) {
    try {
      const env = dotenv.parse(fs.readFileSync(ENV_PATH));
      console.log(`read ${ENV_PATH}, length ${JSON.stringify(Object.keys(env))}`);
      return env;
    } catch (e) {
      console.warn(`Could not parse ${ENV_PATH}`, e);
    }
  } else {
    console.log(`File not found ${ENV_PATH}`);
  }
  return {};
}

const config = loadEnv();
config['BROWSER'] = 'none';
config['BUILD'] = commit.slice(0, 7);
console.log(`config now length ${JSON.stringify(Object.keys(config))}`);

let data = '';

for (let key of Object.keys(config)) {
  data += `${key}=${config[key]}\n`;
}

try {
  console.log(`Current directory: ${process.cwd()}`);
  fs.writeFileSync(ENV_PATH, data.trim());
} catch (e) {
  console.error(`Could not write updated data file`, e);
  const tempFile = ENV_PATH + '.tmp';
  console.log(`try saving to a temp file: ${tempFile}`);
  fs.writeFileSync(tempFile, data.trim());
  console.log(`succeeded: ${tempFile}`);
  console.log(`temp file exists: ${fs.existsSync(tempFile)}`);
}
