/* eslint-env jest */
/* eslint-disable no-console */

//helpers
import * as csvHelpers from '../src/js/helpers/csvHelpers';
import fs from 'fs-extra';

const checksPerformedPath = '__tests__/fixtures/project/csv/checks_performed/fr_eph_text_ulb';

const tWContextId = {
  "reference": {
    "bookId": "tit",
    "chapter": 1,
    "verse": 1
  },
  "tool": "translationWords",
  "groupId": "apostle",
  "quote": "apostle, apostles, apostleship",
  "occurrence": 1
};
const tWotherContextId = {
  "reference": {
    "bookId": "tit",
    "chapter": 1,
    "verse": 1
  },
  "tool": "translationWords",
  "groupId": "confidence",
  "quote": "confidence, confident",
  "occurrence": 1
};
const tNContextId = {
  "information": undefined,
  "reference": { "bookId": "tit", "chapter": 1, "verse": 3 },
  "tool": "translationNotes",
  "groupId": "figs_metaphor",
  "quote": "he revealed his word",
  "occurrence": 1
};
const autographaContextId = {
  "reference": { "bookId": "tit", "chapter": 1, "verse": "1" },
  "tool": "Autographa",
  "groupId": "1"
};

describe('csvHelpers.flattenContextId', () => {
  test('should return a groupName for tW', () => {
    const _flatContextId = {
      "bookId": "tit",
      "chapter": 1,
      "verse": 1,
      "tool": "translationWords",
      "groupId": "apostle",
      "groupName": "apostle, apostles, apostleship",
      "quote": "apostle, apostles, apostleship",
      "occurrence": 1
    };
    const flatContextId = csvHelpers.flattenContextId(tWContextId);
    expect(flatContextId).toEqual(_flatContextId);
  });
});

describe('csvHelpers.groupName', () => {
  test('should return a groupName for tW', () => {
    const groupName = csvHelpers.groupName(tWContextId);
    expect(groupName).toEqual('apostle, apostles, apostleship')
  });
  
  test('should return an `other` groupName for tW', () => {
    const groupName = csvHelpers.groupName(tWotherContextId);
    expect(groupName).toEqual('confidence, confident');
  });
  
  test('should return a groupName for tN', () => {
    const groupName = csvHelpers.groupName(tNContextId);
    expect(groupName).toEqual('Metaphor');
  });
  
  test('should return a groupId as groupName for Autographa', () => {
    const groupName = csvHelpers.groupName(autographaContextId);
    expect(groupName).toEqual('1');
  });
});

describe('csvHelpers.combineData', () => {
  test('should return the right response for combinedData', () => {
    const _combinedData = {
      enabled: true,
      bookId: "tit",
      chapter: 1,
      verse: 1,
      tool: "translationWords",
      groupId: "apostle",
      groupName: "apostle, apostles, apostleship",
      quote: "apostle, apostles, apostleship",
      occurrence: 1,
      username: 'klappy'
      // date: '08/22/2017',
      // time: '22:33:45'
    };
    const data = {enabled: true};
    const combinedData = csvHelpers.combineData(data, tWContextId, 'klappy', '2017-08-23T02:33:45.377Z');
    // Due to timezone issues this is a pain to test.
    _combinedData.date = combinedData.date;
    _combinedData.time = combinedData.time;
    expect(combinedData).toEqual(_combinedData);
  });
});

describe('csvHelpers.getToolFolderNames', () => {
  test('should return tool folders', () => {
    const toolNames = csvHelpers.getToolFolderNames(checksPerformedPath);
    const _toolNames = [ 'translationNotes', 'translationWords' ];
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

const data = [{a: 'a,a', b: 'b,b'}, {a: 1, b: 2}];
const expected = "a,b\n\"a,a\",\"b,b\"\n1,2\n";
const filePath = '__tests__/output/test.csv';

test('generate csv string from array of objects with the same keys', () => {
    return csvHelpers.generateCSVString(data, (err, csvString) => {
        expect(csvString).toEqual(expected);
    });
});

test('generate csv file from array of objects with the same keys', () => {
    return csvHelpers.generateCSVFile(data, filePath).then(() => {
        const csvString = fs.readFileSync(filePath, 'utf8');
        expect(csvString).toEqual(expected);
        fs.removeSync(filePath);
    });
});
