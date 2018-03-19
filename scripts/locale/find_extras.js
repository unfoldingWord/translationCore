const exec = require('child_process').exec;
const fs = require('fs-extra');
const localePath = process.argv[2];
const searchPath = process.argv[3];

/**
 * Generates a list of keys from the locale file
 */
function index(localePath) {
  const locale = JSON.parse(fs.readFileSync(localePath));
  return flattenKeys(locale);
}

/**
 * Returns an array of key paths within an object
 * @param object
 * @return {string[]}
 */
function flattenKeys(object) {
  const keys = [];
  for(const key in object) {
    if(object.hasOwnProperty(key)) {
      if(typeof object[key] === 'object') {
        const subKeys = flattenKeys(object[key]);
        for(const subKey of subKeys) {
          keys.push(`${key}.${subKey}`);
        }
      } else {
        keys.push(key);
      }
    }
  }
  return keys;
}

/**
 * Searches for usages of each locale key
 * @param keys
 */
function search(keys) {
  console.log('Searching for unused locale keys...');
  for(const key of keys) {
    const command = `grep -o -R "'${key}'" ${searchPath} | wc -l`;
    exec(command, (err, stdout) => {
      if(err) {
        console.log(err);
        return;
      }
      const count = parseInt(stdout.replace(/\s/g, ''));
      if(count === 0) {
        console.log(key);
      }
    });
  }
}

module.exports = {
  flattenKeys: flattenKeys,
  search: search
};

// run as main
if(require.main === module) {
  const keys = index(localePath);
  search(keys);
}

// NUM_MATCHES=$(grep -o -R "'$1'" $2 | wc -l)
// if [ "$NUM_MATCHES" -eq "0" ]; then
//   echo "$1";
// fi
