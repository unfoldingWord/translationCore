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
      console.log(`read ${ENV_PATH}, length ${env.length}`);
      return env;
    } catch (e) {
      console.warn(`Could not parse ${ENV_PATH}`, e.getMessage());
    }
  } else {
    console.log(`File not found ${ENV_PATH}`);
  }
  return {};
}

const config = loadEnv();
config['BROWSER'] = 'none';
config['BUILD'] = commit.slice(0, 7);
console.log(`config now length ${config.length}`);

let data = '';

for (let key of Object.keys(config)) {
  data += `${key}=${config[key]}\n`;
}

try {
  fs.writeFileSync(ENV_PATH, data.trim());
} catch (e) {
  console.error(`Could not write updated data file`, e.getMessage());
  console.log(`Current directory: ${process.cwd()}`);
  throw e;
}
