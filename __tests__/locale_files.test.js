jest.unmock('fs-extra');
import fs from 'fs-extra';
import path from 'path-extra';

describe('Tests for locale files', () => {
  test('Verify that only English and Hindi files exist', () => {
    // given
    const localeDir = path.join(__dirname, '../src/locale');
    // when
    const localeFiles = fs.readdirSync(localeDir).filter((filename)=>path.extname(filename)=='.json');
    const expectedFiles = ['English-en_US.json', 'Hindi-hi_IN.json'];
    // then
    expect(localeFiles).toEqual(expectedFiles);
  });
});
