const index = require('./common').index;
const exec = require('child_process').exec;
const localePath = process.argv[2];
const searchPath = process.argv[3];

/**
 * Searches locale keys that are missing.
 * @param keys
 */
function search(keys) {
  console.log('Searching for missing locale keys...');
  const command = `grep -o -n -R "translate('[^']*'" ${searchPath}`;
  exec(command, (err, stdout) => {
    if(err) {
      console.log(err);
      return;
    }
    const matches = stdout.split('\n');
    let count = 0;
    for(const match of matches) {
      if(!match) continue;
      const parts = match.split(':');
      const file = parts[0];
      const line = parts[1];
      const rawMatch = parts[2];
      const matchedKey = rawMatch.replace(/^translate\('/, '').replace(/'$/, '');
      // skip static strings
      if(matchedKey.startsWith('_.')) continue;
      if(!keys.includes(matchedKey)) {
        count ++;
        console.log(`"${matchedKey}" in ${file}:${line}`);
      }
    }
    console.log(`\nFound ${count} missing locale keys`);
  });
}

// run as main
if(require.main === module) {
  const keys = index(localePath);
  search(keys);
}
