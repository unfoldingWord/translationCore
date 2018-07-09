const fs = require('fs-extra');
const path = require('path-extra');

const flattenObject = (ob) => {
  let toReturn = {};

  for (let i in ob) {
    if (!ob.hasOwnProperty(i)) continue;

    if ((typeof ob[i]) == 'object') {
      let flatObject = flattenObject(ob[i]);
      for (let x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) continue;
        toReturn[i + '.' + x] = flatObject[x];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }
  return toReturn;
};

const arr_diff = (a1, a2) => {

  var a = [], diff = [];

  for (var i = 0; i < a1.length; i++) {
      a[a1[i]] = true;
  }

  for (var i = 0; i < a2.length; i++) {
      if (a[a2[i]]) {
          delete a[a2[i]];
      } else {
          a[a2[i]] = true;
      }
  }

  for (var k in a) {
      diff.push(k);
  }

  return diff;
};

const localeDir = path.join(__dirname, '../src/locale');
const englishLocale = fs.readJSONSync(path.join(localeDir, 'English-en_US.json'));
const hindiLocale = fs.readJSONSync(path.join(localeDir, 'Hindi-hi_IN.json'));
const flattenedEnglishLocale = flattenObject(englishLocale);
const flattenedHindiLocale = flattenObject(hindiLocale);
const englishKeys = Object.keys(flattenedEnglishLocale).sort();
const hindiKeys = Object.keys(flattenedHindiLocale).sort();
console.log(arr_diff(englishKeys, hindiKeys));
