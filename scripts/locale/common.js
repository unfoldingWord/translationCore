const fs = require('fs-extra');


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

module.exports = {
  flattenKeys: flattenKeys,
  index: index
};
