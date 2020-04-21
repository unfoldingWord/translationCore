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
      return dotenv.parse(fs.readFileSync(ENV_PATH));
    } catch (e) {
      console.warn(`Could not parse ${ENV_PATH}`, e.getMessage());
    }
  }
  return {};
}

const config = loadEnv();
config['BROWSER'] = 'none';
config['BUILD'] = commit.slice(0, 7);

let data = '';

for (let key of Object.keys(config)) {
  data += `${key}=${config[key]}\n`;
}

fs.writeFileSync(ENV_PATH, data.trim());
