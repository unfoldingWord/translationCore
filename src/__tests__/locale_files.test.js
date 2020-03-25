import fs from 'fs-extra';
import path from 'path-extra';
jest.unmock('fs-extra');

describe('Tests for locale files', () => {
  test('Verify that no locale files have % in them', () => {
    // given
    const localeDir = path.join(__dirname, '../locale');
    // when
    const invalidFiles = fs.readdirSync(localeDir).filter(filename=>filename.includes('%'));
    const expectedLength = 0;
    // then
    expect(invalidFiles.length).toEqual(expectedLength);
  });
});
