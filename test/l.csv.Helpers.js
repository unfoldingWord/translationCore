import {describe, it} from 'mocha';
import { expect } from 'chai';
import isEqual from 'lodash/isEqual'

//helpers
import * as csvHelpers from '../src/js/helpers/csvHelpers';

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
const tNContextId = {
  "information": undefined,
  "reference": { "bookId": "tit", "chapter": 1, "verse": 3 },
  "tool": "translationNotes",
  "groupId": "figs_metaphor",
  "quote": "he revealed his word",
  "occurrence": 1
}

describe('csvHelpers.flattenContextId', () => {
  it('should return a groupName for tW', function (done) {
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
    expect(isEqual(flatContextId, _flatContextId)).to.equal(true);
    done();
  });
});
describe('csvHelpers.groupName', () => {
  it('should return a groupName for tW', function (done) {
    const groupName = csvHelpers.groupName(tWContextId);
    expect(groupName).to.equal('apostle, apostles, apostleship')
    done();
  });
  it('should return a groupName for tN', function (done) {
    const groupName = csvHelpers.groupName(tNContextId);
    expect(groupName).to.equal('Metaphor')
    done();
  });
});

describe('csvHelpers.combineData', () => {
  it('should return the right response for combinedData', function (done) {
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
      username: 'klappy',
      date: '08/22/2017',
      time: '22:33:45'
    };
    const data = {enabled: true};
    const combinedData = csvHelpers.combineData(data, tWContextId, 'klappy', '2017-08-23T02:33:45.377Z');
    expect(isEqual(combinedData, _combinedData)).to.equal(true);
    done();
  });
});
