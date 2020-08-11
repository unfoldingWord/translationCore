/* eslint-env jest */
/* eslint-disable no-console */
import fs from 'fs-extra';
import path from 'path-extra';
//helpers
import * as csvHelpers from '../js/helpers/csvHelpers';
import {
  USER_RESOURCES_PATH, WORD_ALIGNMENT, TRANSLATION_WORDS, TRANSLATION_NOTES,
} from '../js/common/constants';

const checksPerformedPath = path.join(__dirname, 'fixtures/project/csv/checks_performed/fr_eph_text_ulb');

// A tW contextId with a simple quote
const tWKTApostleContextId = {
  reference: {
    bookId: 'tit',
    chapter: 1,
    verse: 1,
  },
  tool: TRANSLATION_WORDS,
  groupId: 'apostle',
  quote: 'ἀπόστολος',
  strong: [
    'G06520',
  ],
  occurrence: 1,
};

// A tW contextId with a complex quote
const tWKTJesusContextId = {
  reference: {
    bookId: 'tit',
    chapter: 1,
    verse: 1,
  },
  tool: TRANSLATION_WORDS,
  groupId: 'jesus',
  quote: [
    {
      word: 'Ἰησοῦ',
      occurrence: 1,
    },
    {
      word: 'Χριστοῦ',
      occurrence: 1,
    },
  ],
  strong: [
    'G24240',
    'G55470',
  ],
  occurrence: 1,
};

// A tW contextId with a term of type "other"
const tWOtherCourageContextId = {
  reference: {
    bookId: 'tit',
    chapter: 1,
    verse: 9,
  },
  tool: TRANSLATION_WORDS,
  groupId: 'courage',
  quote: 'παρακαλεῖν',
  occurrence: 1,
};

// A tN contextId with a complex quote
const tNMetaphorRevealContextId = {
  reference: {
    bookId: 'tit',
    chapter: 1,
    verse: 3,
  },
  tool: TRANSLATION_NOTES,
  groupId: 'figs-metaphor',
  quote: [
    {
      word: 'ἐφανέρωσεν',
      occurrence: 1,
    },
    { word: '…' },
    {
      word: 'τὸν',
      occurrence: 1,
    },
    {
      word: 'λόγον',
      occurrence: 1,
    },
    {
      word: 'αὐτοῦ',
      occurrence: 1,
    },
  ],
  glQuote: 'he revealed his word',
  occurrenceNote: 'Paul speaks of God\'s message as if it were an object that could be visibly shown to people. Alternate translation: "He caused me to understand his message" (See: [[rc://en/ta/man/translate/figs-metaphor]])',
  occurrence: 1,
};

// A tN contextId with a simple quote but incorrect glQuote
const tNMetaphorHoldContextId = {
  reference: {
    bookId: 'tit',
    chapter: 1,
    verse: 9,
  },
  tool: TRANSLATION_NOTES,
  groupId: 'figs-metaphor',
  quote: 'ἀντεχόμενον',
  glQuote: 'hold tightly to', // this is the incorrect gl quote from the TSV, should be "He should hold tightly"
  occurrenceNote: 'Paul speaks of devotion to the Christian faith as if it were grasping the faith with one\'s hands. Alternate translation: "be devoted to" or "know well" (See: [[rc://en/ta/man/translate/figs-metaphor]])',
  occurrence: 1,
};

const autographaContextId = {
  reference: {
    bookId: 'tit', chapter: 1, verse: '1',
  },
  tool: 'Autographa',
  groupId: '1',
};

const fixturesDir = path.join(__dirname, 'fixtures');
const resourcesDir = path.join(fixturesDir, 'resources');
const projectDir = path.join(fixturesDir, 'project');

beforeAll(() => {
  fs.__resetMockFS();
  fs.__loadDirIntoMockFs(resourcesDir, USER_RESOURCES_PATH);
  fs.__loadDirIntoMockFs(projectDir, projectDir);
});

describe('csvHelpers.flattenContextId', () => {
  test('should get a flattened contextId with a type, groupName & gatewayLanguageQuote for tW kt apostle term', () => {
    const contextId = tWKTApostleContextId;
    const gatewayLanguageCode = 'en';
    const _flatContextId = {
      bookId: contextId.reference.bookId,
      chapter: contextId.reference.chapter,
      verse: contextId.reference.verse,
      tool: contextId.tool,
      type: 'kt',
      groupId: contextId.groupId,
      groupName: 'apostle, apostleship',
      quote: contextId.quote,
      gatewayLanguageCode: gatewayLanguageCode,
      gatewayLanguageQuote: 'an apostle',
      occurrenceNote: 'N/A',
      occurrence: contextId.occurrence,
    };
    const translate = key => key.split('.')[1];
    const flatContextId = csvHelpers.flattenContextId(contextId, gatewayLanguageCode, '', translate);
    expect(flatContextId).toEqual(_flatContextId);
  });

  test('should get a flattened contextId with a type, groupName & gatewayLanguageQuote for tW kt jesus term', () => {
    const contextId = tWKTJesusContextId;
    const gatewayLanguageCode = 'en';
    const _flatContextId = {
      bookId: contextId.reference.bookId,
      chapter: contextId.reference.chapter,
      verse: contextId.reference.verse,
      tool: contextId.tool,
      type: 'kt',
      groupId: contextId.groupId,
      groupName: 'Jesus, Jesus Christ, Christ Jesus',
      quote: 'Ἰησοῦ Χριστοῦ',
      gatewayLanguageCode: gatewayLanguageCode,
      gatewayLanguageQuote: 'of Jesus Christ',
      occurrenceNote: 'N/A',
      occurrence: contextId.occurrence,
    };
    const translate = key => key.split('.')[1];
    const flatContextId = csvHelpers.flattenContextId(contextId, gatewayLanguageCode, '', translate);
    expect(flatContextId).toEqual(_flatContextId);
  });

  test('should get a flattened contextId with a type, groupName & gatewayLanguageQuote for tW other courange term', () => {
    const contextId = tWOtherCourageContextId;
    const gatewayLanguageCode = 'en';
    const _flatContextId = {
      bookId: contextId.reference.bookId,
      chapter: contextId.reference.chapter,
      verse: contextId.reference.verse,
      tool: contextId.tool,
      type: 'other',
      groupId: contextId.groupId,
      groupName: 'courage, courageous, encourage, encouragement, discourage, discouragement, bravest',
      quote: contextId.quote,
      gatewayLanguageCode: gatewayLanguageCode,
      gatewayLanguageQuote: 'to encourage',
      occurrenceNote: 'N/A',
      occurrence: contextId.occurrence,
    };
    const translate = key => key.split('.')[1];
    const flatContextId = csvHelpers.flattenContextId(contextId, gatewayLanguageCode, '', translate);
    expect(flatContextId).toEqual(_flatContextId);
  });

  test('should get a flattened contextId with a type, groupName & gatewayLanguageQuote for tN reveal metaphor', () => {
    const contextId = tNMetaphorRevealContextId;
    const gatewayLanguageCode = 'en';
    const _flatContextId = {
      bookId: contextId.reference.bookId,
      chapter: contextId.reference.chapter,
      verse: contextId.reference.verse,
      tool: contextId.tool,
      type: 'figures',
      groupId: contextId.groupId,
      groupName: 'Metaphor',
      quote: 'ἐφανέρωσεν … τὸν λόγον αὐτοῦ',
      gatewayLanguageCode: gatewayLanguageCode,
      gatewayLanguageQuote: 'he revealed his word',
      occurrenceNote: contextId.occurrenceNote,
      occurrence: contextId.occurrence,
    };
    const translate = key => key.split('.')[1];
    const flatContextId = csvHelpers.flattenContextId(contextId, gatewayLanguageCode, '', translate);
    expect(flatContextId).toEqual(_flatContextId);
  });

  test('should get a flattened contextId with a type, groupName & gatewayLanguageQuote for tN hold metaphor', () => {
    const contextId = tNMetaphorHoldContextId;
    const gatewayLanguageCode = 'en';
    const _flatContextId = {
      bookId: contextId.reference.bookId,
      chapter: contextId.reference.chapter,
      verse: contextId.reference.verse,
      tool: contextId.tool,
      type: 'figures',
      groupId: contextId.groupId,
      groupName: 'Metaphor',
      quote: contextId.quote,
      gatewayLanguageCode: gatewayLanguageCode,
      gatewayLanguageQuote: 'He should hold tightly', // corrected GL quote
      occurrenceNote: contextId.occurrenceNote,
      occurrence: contextId.occurrence,
    };
    const translate = key => key.split('.')[1];
    const flatContextId = csvHelpers.flattenContextId(contextId, gatewayLanguageCode, '', translate);
    expect(flatContextId).toEqual(_flatContextId);
    expect(flatContextId.gatewayLanguageQuote).not.toEqual(contextId.glQuote);
  });
});

describe('csvHelpers.groupName', () => {
  test('should return a groupName for tW', () => {
    const groupName = csvHelpers.groupName(tWKTApostleContextId, 'en');
    expect(groupName).toEqual('apostle, apostleship');
  });

  test('should return an `other` groupName for tW', () => {
    const groupName = csvHelpers.groupName(tWOtherCourageContextId, 'en');
    expect(groupName).toEqual('courage, courageous, encourage, encouragement, discourage, discouragement, bravest');
  });

  test('should return a groupName for tN', () => {
    const groupName = csvHelpers.groupName(tNMetaphorRevealContextId, 'en');
    expect(groupName).toEqual('Metaphor');
  });

  test('should return a groupId as groupName for Autographa', () => {
    const groupName = csvHelpers.groupName(autographaContextId, 'en');
    expect(groupName).toEqual('1');
  });
});

describe('csvHelpers.combineData', () => {
  test('should return the right response for combinedData', () => {
    const contextId = tWKTApostleContextId;
    const _combinedData = {
      enabled: true,
      bookId: contextId.reference.bookId,
      chapter: contextId.reference.chapter,
      verse: contextId.reference.verse,
      tool: TRANSLATION_WORDS,
      type: 'kt',
      groupId: contextId.groupId,
      groupName: 'apostle, apostleship',
      quote: contextId.quote,
      gatewayLanguageCode: 'en',
      gatewayLanguageQuote: 'an apostle',
      occurrenceNote: 'N/A',
      occurrence: 1,
      username: 'klappy',
      // date: '08/22/2017',
      // time: '22:33:45'
    };
    const data = { enabled: true };
    const translate = key => key.split('.')[1];
    const combinedData = csvHelpers.combineData(data, contextId, '', '', 'klappy', '2017-08-23T02:33:45.377Z', translate);
    // Due to timezone issues this is a pain to test.
    _combinedData.date = combinedData.date;
    _combinedData.time = combinedData.time;
    expect(combinedData).toEqual(_combinedData);
  });
});

describe('csvHelpers.getToolFolderNames', () => {
  test('should return tool folders', () => {
    const toolNames = csvHelpers.getToolFolderNames(checksPerformedPath);
    const _toolNames = [ TRANSLATION_NOTES, TRANSLATION_WORDS, WORD_ALIGNMENT ];
    expect(toolNames).toEqual(_toolNames);
  });
});

describe('csvHelpers.getProjectId', () => {
  test('should return a projectId', () => {
    const projectId = csvHelpers.getProjectId(checksPerformedPath);
    const _projectId = 'eph';
    expect(projectId).toEqual(_projectId);
  });
});

const data = [{ a: 'a,a', b: 'b,b' }, { a: 1, b: 2 }];
const expected = 'a,b\n"a,a","b,b"\n1,2\n';
const filePath = path.join(__dirname, 'output/test.csv');

test('generate csv string from array of objects with the same keys', () => csvHelpers.generateCSVString(data, (err, csvString) => {
  expect(csvString).toEqual(expected);
}));

test('generate csv file from array of objects with the same keys', () => csvHelpers.generateCSVFile(data, filePath).then(() => {
  const csvString = fs.readFileSync(filePath, 'utf8');
  expect(csvString).toEqual(expected);
  fs.removeSync(filePath);
}));
