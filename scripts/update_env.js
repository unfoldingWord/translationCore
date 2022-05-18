// Writes some updated keys to the .env file.
// Non-conflicting values in .env will be preserved.
const commit = require('child_process')
  .execSync('git rev-parse HEAD')
  .toString().trim();
const fs = require('fs-extra');
const path = require('path-extra');
const ENV_PATH = path.join('./.env');

const dotenv = require('dotenv');

/**
 * Safely loads the .env file
 * @returns {{}}
 */
function loadEnv(envPath) {
  if (fs.existsSync(envPath)) {
    try {
      const env = dotenv.parse(fs.readFileSync(envPath));
      console.log(`read ${envPath}, keys: ${JSON.stringify(Object.keys(env))}`);
      return env;
    } catch (e) {
      console.warn(`Could not parse ${envPath}`, e);
    }
  } else {
    console.log(`File not found ${envPath}`);
  }
  return {};
}

let config = loadEnv(ENV_PATH);

// if the .env file did not exist, then check for presence of .env.tmp (work-around for linux build environment restrictions)
if (Object.keys(config).length === 0) {
  config = loadEnv(ENV_PATH + '.tmp');
}

config['BROWSER'] = 'none';
const BUILD = commit.slice(0, 7);
config['BUILD'] = BUILD;
console.log(`config updated keys: ${JSON.stringify(Object.keys(config))}`);

let data = '';

for (let key of Object.keys(config)) {
  data += `${key}=${config[key]}\n`;
}

const dataTrimmed = data.trim();
fs.writeFileSync(ENV_PATH, dataTrimmed);
fs.outputJsonSync(path.join('.', 'electronite/cfg.json'), { config });
fs.outputJsonSync(path.join('.', 'electronite/build.json'), { BUILD });

// if we reach here, we were able to write/update the .env file
console.log(`environment file exists: ${fs.existsSync(ENV_PATH)}`);
