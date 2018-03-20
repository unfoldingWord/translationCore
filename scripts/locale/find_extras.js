const index = require('./common').index;
const exec = require('child_process').exec;
const localePath = process.argv[2];
const searchPath = process.argv[3];

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
  search: search
};

// run as main
if(require.main === module) {
  const keys = index(localePath);
  search(keys);
}
