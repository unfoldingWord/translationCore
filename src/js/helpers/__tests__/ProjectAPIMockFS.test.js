/* eslint-disable quotes,object-curly-newline */
/* eslint-env jest */
import fs from 'fs-extra';
import path from 'path-extra';
import _ from "lodash";
import ProjectAPI from '../ProjectAPI';
// constants
import { APP_VERSION } from '../../common/constants';


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

      // when
      p.updateCategoryGroupData(srceFile, destFile);

      // then
      const output = fs.readJsonSync(destFile);
      expect(output).toEqual(expected);
    });

    it('new shorter, output same as source', () => {
      // given
      const srce = _.cloneDeep(checkTestData);
      srce.splice(0,1);
      const dest = _.cloneDeep(checkTestData);
      const expected = _.cloneDeep(srce);
      fs.outputJsonSync(srceFile, srce);
      fs.outputJsonSync(destFile, dest);

      // when
      p.updateCategoryGroupData(srceFile, destFile);

      // then
      const output = fs.readJsonSync(destFile);
      expect(output).toEqual(expected);
    });

    it('new longer, output same as source', () => {
      // given
      const srce = _.cloneDeep(checkTestData);
      const dest = _.cloneDeep(checkTestData);
      dest.splice(0,1);
      const expected = _.cloneDeep(srce);
      fs.outputJsonSync(srceFile, srce);
      fs.outputJsonSync(destFile, dest);

      // when
      p.updateCategoryGroupData(srceFile, destFile);

      // then
      const output = fs.readJsonSync(destFile);
      expect(output).toEqual(expected);
    });
  });
});
