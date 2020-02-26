/* eslint-disable quotes,object-curly-newline */
/* eslint-env jest */
import fs from 'fs-extra';
import _ from "lodash";
import ProjectAPI from '../ProjectAPI';

describe('ProjectAPI', () => {
  describe('updateCategoryGroupData()', () => {
    const checkTestData = [
      {
        "comments":false,
        "reminders":false,
        "selections":false,
        "verseEdits":false,
        "nothingToSelect":false,
        "contextId": {
          "occurrenceNote":"This means that he has only one wife, that is, he does not have any other wives or concubines. This also means that he does not commit adultery and may also mean that he has not divorced a previous wife. Alternate translation: “a man who has only one woman” or “a man who is faithful to his wife” (See: [[rc://en/ta/man/translate/figs-explicit]])",
          "reference": { "bookId":"tit","chapter":1,"verse":6 },
          "tool":"translationNotes",
          "groupId":"figs-explicit",
          "quote":[
            { "word":"μιᾶς","occurrence":1 },
            { "word":"γυναικὸς","occurrence":1 },
            { "word":"ἀνήρ","occurrence":1 },
          ],
          "quoteString":"μιᾶς γυναικὸς ἀνήρ",
          "glQuote":"the husband of one wife",
          "occurrence":1,
        },
      },
      {
        "comments":false,
        "reminders":false,
        "selections":false,
        "verseEdits":false,
        "nothingToSelect":false,
        "contextId": {
          "occurrenceNote":"Paul implies what is in contrast. Alternate translation: “But you, Titus, in contrast with the false teachers, be sure to say those things that fit” (See: [[rc://en/ta/man/translate/figs-explicit]])",
          "reference": { "bookId":"tit","chapter":2,"verse":1 },
          "tool":"translationNotes",
          "groupId":"figs-explicit",
          "quote":[
            { "word":"σὺ","occurrence":1 },
            { "word":"δὲ","occurrence":1 },
            { "word":"λάλει","occurrence":1 },
            { "word":"ἃ","occurrence":1 },
            { "word":"πρέπει","occurrence":1 },
          ],
          "quoteString":"σὺ δὲ λάλει ἃ πρέπει",
          "glQuote":"But you, speak what fits",
          "occurrence":1,
        },
      },
      {
        "comments":false,
        "reminders":false,
        "selections":false,
        "verseEdits":false,
        "nothingToSelect":false,
        "contextId":{
          "occurrenceNote":"This refers to Jesus dying willingly. Alternate translation: “gave himself to die for us” (See: [[rc://en/ta/man/translate/figs-explicit]])",
          "reference": { "bookId":"tit","chapter":2,"verse":14 },
          "tool":"translationNotes",
          "groupId":"figs-explicit",
          "quote":[
            { "word":"ἔδωκεν","occurrence":1 },
            { "word":"ἑαυτὸν","occurrence":1 },
            { "word":"ὑπὲρ","occurrence":1 },
            { "word":"ἡμῶν","occurrence":1 },
          ],
          "quoteString":"ἔδωκεν ἑαυτὸν ὑπὲρ ἡμῶν",
          "glQuote":"gave himself for us",
          "occurrence":1,
        },
      },
    ];
    const srceFile = "srceFile";
    const destFile = "destFile";
    let p;

    beforeEach(() => {
      // reset mock filesystem data
      fs.__resetMockFS();
      p = new ProjectAPI('./dummyPath)');
    });

    it('data same is unchanged', () => {
      // given
      const srce = _.cloneDeep(checkTestData);
      const dest = _.cloneDeep(checkTestData);
      const expected = _.cloneDeep(checkTestData);
      fs.outputJsonSync(srceFile, srce);
      fs.outputJsonSync(destFile, dest);
      const newSize = srce.length;

      // when
      p.updateCategoryGroupData(srceFile, destFile);

      // then
      const output = fs.readJsonSync(destFile);
      expect(output).toEqual(expected);
      expect(output.length).toEqual(newSize);
    });

    it('data same is unchanged even if different order', () => {
      // given
      const srce = _.cloneDeep(checkTestData);
      const dest = _.cloneDeep(checkTestData);
      swapItems(dest, 0, 2);
      const expected = _.cloneDeep(checkTestData);
      fs.outputJsonSync(srceFile, srce);
      fs.outputJsonSync(destFile, dest);
      const newSize = srce.length;

      // when
      p.updateCategoryGroupData(srceFile, destFile);

      // then
      const output = fs.readJsonSync(destFile);
      expect(output).toEqual(expected);
      expect(output.length).toEqual(newSize);
    });

    it('new shorter, output same as source', () => {
      // given
      const srce = _.cloneDeep(checkTestData);
      srce.splice(0,1);
      const dest = _.cloneDeep(checkTestData);
      const expected = _.cloneDeep(srce);
      fs.outputJsonSync(srceFile, srce);
      fs.outputJsonSync(destFile, dest);
      const newSize = srce.length;

      // when
      p.updateCategoryGroupData(srceFile, destFile);

      // then
      const output = fs.readJsonSync(destFile);
      expect(output).toEqual(expected);
      expect(output.length).toEqual(newSize);
    });

    it('new longer, output same as source', () => {
      // given
      const srce = _.cloneDeep(checkTestData);
      const dest = _.cloneDeep(checkTestData);
      dest.splice(0,1);
      const expected = _.cloneDeep(srce);
      fs.outputJsonSync(srceFile, srce);
      fs.outputJsonSync(destFile, dest);
      const newSize = srce.length;

      // when
      p.updateCategoryGroupData(srceFile, destFile);

      // then
      const output = fs.readJsonSync(destFile);
      expect(output).toEqual(expected);
      expect(output.length).toEqual(newSize);
    });

    it('will keep old selections, etc', () => {
      // given
      const srce = _.cloneDeep(checkTestData);
      const dest = _.cloneDeep(checkTestData);
      setData(dest[1], true); // data to be preserved
      const expected = _.cloneDeep(srce);
      setData(expected[1], true);
      fs.outputJsonSync(srceFile, srce);
      fs.outputJsonSync(destFile, dest);
      const newSize = srce.length;

      // when
      p.updateCategoryGroupData(srceFile, destFile);

      // then
      const output = fs.readJsonSync(destFile);
      expect(output).toEqual(expected);
      expect(output.length).toEqual(newSize);
    });

    it('will keep old selections, etc. even in different order', () => {
      // given
      const srce = _.cloneDeep(checkTestData);
      const dest = _.cloneDeep(checkTestData);
      setData(dest[1], true); // data to be preserved
      swapItems(dest, 0, 1);
      const expected = _.cloneDeep(srce);
      setData(expected[1], true);
      fs.outputJsonSync(srceFile, srce);
      fs.outputJsonSync(destFile, dest);
      const newSize = srce.length;

      // when
      p.updateCategoryGroupData(srceFile, destFile);

      // then
      const output = fs.readJsonSync(destFile);
      expect(output).toEqual(expected);
      expect(output.length).toEqual(newSize);
    });

    it('will keep old selections, etc. even if counts different', () => {
      // given
      const srce = _.cloneDeep(checkTestData);
      const dest = _.cloneDeep(checkTestData);
      setData(dest[1], true); // data to be preserved
      dest.splice(0,1);
      const expected = _.cloneDeep(srce);
      setData(expected[1], true);
      fs.outputJsonSync(srceFile, srce);
      fs.outputJsonSync(destFile, dest);
      const newSize = srce.length;

      // when
      p.updateCategoryGroupData(srceFile, destFile);

      // then
      const output = fs.readJsonSync(destFile);
      expect(output).toEqual(expected);
      expect(output.length).toEqual(newSize);
    });

    it('will not keep old selections if verse different', () => {
      // given
      const srce = _.cloneDeep(checkTestData);
      const dest = _.cloneDeep(checkTestData);
      setData(dest[1], true);
      dest[1].contextId.reference.verse = 52;
      const expected = _.cloneDeep(srce);
      fs.outputJsonSync(srceFile, srce);
      fs.outputJsonSync(destFile, dest);
      const newSize = srce.length;

      // when
      p.updateCategoryGroupData(srceFile, destFile);

      // then
      const output = fs.readJsonSync(destFile);
      expect(output).toEqual(expected);
      expect(output.length).toEqual(newSize);
    });

    it('will not keep old selections if chapter different', () => {
      // given
      const srce = _.cloneDeep(checkTestData);
      const dest = _.cloneDeep(checkTestData);
      setData(dest[1], true);
      dest[1].contextId.reference.chapter = 52;
      const expected = _.cloneDeep(srce);
      fs.outputJsonSync(srceFile, srce);
      fs.outputJsonSync(destFile, dest);
      const newSize = srce.length;

      // when
      p.updateCategoryGroupData(srceFile, destFile);

      // then
      const output = fs.readJsonSync(destFile);
      expect(output).toEqual(expected);
      expect(output.length).toEqual(newSize);
    });

    it('will not keep old selections if occurrence different', () => {
      // given
      const srce = _.cloneDeep(checkTestData);
      const dest = _.cloneDeep(checkTestData);
      setData(dest[1], true);
      dest[1].contextId.occurrence = 52;
      const expected = _.cloneDeep(srce);
      fs.outputJsonSync(srceFile, srce);
      fs.outputJsonSync(destFile, dest);
      const newSize = srce.length;

      // when
      p.updateCategoryGroupData(srceFile, destFile);

      // then
      const output = fs.readJsonSync(destFile);
      expect(output).toEqual(expected);
      expect(output.length).toEqual(newSize);
    });

    it('will not keep old selections if quoteString different', () => {
      // given
      const srce = _.cloneDeep(checkTestData);
      const dest = _.cloneDeep(checkTestData);
      setData(dest[1], true);
      dest[1].contextId.quoteString = dest[1].contextId.quoteString + "!";
      const expected = _.cloneDeep(srce);
      fs.outputJsonSync(srceFile, srce);
      fs.outputJsonSync(destFile, dest);
      const newSize = srce.length;

      // when
      p.updateCategoryGroupData(srceFile, destFile);

      // then
      const output = fs.readJsonSync(destFile);
      expect(output).toEqual(expected);
      expect(output.length).toEqual(newSize);
    });

    it('will keep old selections if no quoteString and quotes same', () => {
      // given
      const srce = _.cloneDeep(checkTestData);
      delete srce[1].contextId.quoteString;
      const dest = _.cloneDeep(checkTestData);
      setData(dest[1], true);
      delete dest[1].contextId.quoteString;
      const expected = _.cloneDeep(srce);
      setData(expected[1], true);
      fs.outputJsonSync(srceFile, srce);
      fs.outputJsonSync(destFile, dest);
      const newSize = srce.length;

      // when
      p.updateCategoryGroupData(srceFile, destFile);

      // then
      const output = fs.readJsonSync(destFile);
      expect(output).toEqual(expected);
      expect(output.length).toEqual(newSize);
    });

    it('will keep old selections if no quoteString in new and quotes same', () => {
      // given
      const srce = _.cloneDeep(checkTestData);
      delete srce[1].contextId.quoteString;
      const dest = _.cloneDeep(checkTestData);
      setData(dest[1], true);
      const expected = _.cloneDeep(srce);
      setData(expected[1], true);
      fs.outputJsonSync(srceFile, srce);
      fs.outputJsonSync(destFile, dest);
      const newSize = srce.length;

      // when
      p.updateCategoryGroupData(srceFile, destFile);

      // then
      const output = fs.readJsonSync(destFile);
      expect(output).toEqual(expected);
      expect(output.length).toEqual(newSize);
    });

    it('will keep old selections if no quoteString in old and quotes same', () => {
      // given
      const srce = _.cloneDeep(checkTestData);
      const dest = _.cloneDeep(checkTestData);
      setData(dest[1], true);
      delete dest[1].contextId.quoteString;
      const expected = _.cloneDeep(srce);
      setData(expected[1], true);
      fs.outputJsonSync(srceFile, srce);
      fs.outputJsonSync(destFile, dest);
      const newSize = srce.length;

      // when
      p.updateCategoryGroupData(srceFile, destFile);

      // then
      const output = fs.readJsonSync(destFile);
      expect(output).toEqual(expected);
      expect(output.length).toEqual(newSize);
    });

    it('will not keep old selections if no quoteString and quotes different', () => {
      // given
      const srce = _.cloneDeep(checkTestData);
      delete srce[1].contextId.quoteString;
      const dest = _.cloneDeep(checkTestData);
      setData(dest[1], true);
      delete dest[1].contextId.quoteString;
      dest[1].contextId.quote[2].word = dest[1].contextId.quote[2].word + '!';
      const expected = _.cloneDeep(srce);
      fs.outputJsonSync(srceFile, srce);
      fs.outputJsonSync(destFile, dest);
      const newSize = srce.length;

      // when
      p.updateCategoryGroupData(srceFile, destFile);

      // then
      const output = fs.readJsonSync(destFile);
      expect(output).toEqual(expected);
      expect(output.length).toEqual(newSize);
    });
  });
});

//
// helpers
//

function setData(item, set) {
  if (set) {
    item.comments = true;
    item.reminders = true;
    item.selections = true;
    item.verseEdits = true;
  } else {
    item.comments = false;
    item.reminders = false;
    item.selections = false;
    item.verseEdits = false;
  }
}

function swapItems(dest, first, second) {
  const dest0 = dest[first];
  const dest2 = dest[second];
  dest[second] = dest0;
  dest[first] = dest2;
}
