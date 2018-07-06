jest.unmock('fs-extra');
import fs from 'fs-extra';
import path from 'path-extra';

describe('Tests for locale files', () => {
  test('Verify that no locale files have % in them', () => {
    // given
    const localeDir = path.join(__dirname, '../src/locale');
    // when
    const invalidFiles = fs.readdirSync(localeDir).filter(filename=>filename.includes('%'));
    const expectedLength = 0;
    // then
    expect(invalidFiles.length).toEqual(expectedLength);
  });

  test('Make sure English and Hindi have the same keys', () => {
    // given
    const localeDir = path.join(__dirname, '../src/locale');
    // when
    const englishLocale = fs.readJSONSync(path.join(localeDir, 'English-en_US.json'));
    const hindiLocale = fs.readJSONSync(path.join(localeDir, 'Hindi-hi_IN.json'));
    const flattenedEnglishLocale = flattenObject(englishLocale);
    const flattenedHindiLocale = flattenObject(hindiLocale);
    const englishKeys = Object.keys(flattenedEnglishLocale).sort();
    const hindiKeys = Object.keys(flattenedHindiLocale).sort();
    // then
    expect(englishKeys).toEqual(hindiKeys);
  });
});

// heleprs

const flattenObject = function(ob) {
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
