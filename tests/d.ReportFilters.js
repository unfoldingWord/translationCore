// Last one
// exports.searchText = searchText
const fs = require('fs-extra');
const ReportFilters = require('../src/js/components/core/reports/ReportFilters.js');
const testData = fs.readJsonSync('./tests/static/3john/checkdata/TranslationWordsChecker.tc').groups;
const assert = require('chai').assert;

const searchGroup = ['call.txt', 'earth.txt', 'lord.txt', 'sponge.txt'];
const searchStatus = ['CORRECT', 'FLAGGED']
const searchRetained = ['Retained', '']
const defaultStatus = ['FLAGGED', 'CORRECT', 'UNCHECKED'];
const defaultRetained = ['Replaced', 'Retained', ''];

describe('ReportFilters.filter.byGroup', function() {
  it('byGroup should return undefined if no parameters are passed', function() {
    assert.isUndefined(ReportFilters.filter.byGroup());
  });
  it('byGroup should return the original store if no query or empty query array', function() {
    var noGroup = ReportFilters.filter.byGroup(null, testData);
    assert.deepEqual(noGroup, testData);
    var emptyGroup = ReportFilters.filter.byGroup([], testData);
    assert.deepEqual(emptyGroup, testData);
  });
  it('byGroup should return an empty store if the group cannot be found', function() {
    var filteredByGroup = ReportFilters.filter.byGroup(['sponge.txt'], testData);
    assert.isArray(filteredByGroup);
    assert.equal(filteredByGroup.length, 0);
  });
  it('byGroup should filter a group by the group name', function() {
    var filteredByGroup = ReportFilters.filter.byGroup(searchGroup, testData);
    assert.equal(filteredByGroup.length, 3)
  });
});

describe('ReportFilters.filter.byStatus', function() {
  it('byStatus should return undefined if no parameters are passed', function() {
    assert.isUndefined(ReportFilters.filter.byStatus());
  });
  it('byStatus should return the original store if no query or empty query array', function() {
    var noStatus = ReportFilters.filter.byStatus(null, testData);
    assert.deepEqual(noStatus, testData);
    var emptyStatus = ReportFilters.filter.byStatus([], testData);
    assert.deepEqual(emptyStatus, testData);
  });
  it('byStatus should return an empty store if the status cannot be found', function() {
    var filteredByStatus = ReportFilters.filter.byStatus(['CHECKED'], testData);
    assert.isArray(filteredByStatus);
    assert.equal(filteredByStatus.length, 0);
  });
  it('byStatus should filter a group by the status type', function() {
    var filteredByStatus = ReportFilters.filter.byStatus(searchStatus, testData);
    assert.equal(filteredByStatus.length, 32);
    assert.isFalse(filteredByStatus.length === testData.length);
  });
});

describe('ReportFilters.filter.byRetained', function() {
  it('byRetained should return undefined if no parameters are passed', function() {
    assert.isUndefined(ReportFilters.filter.byRetained());
  });
  it('byRetained should return the original store if no query or empty query array', function() {
    var noRetained = ReportFilters.filter.byRetained(null, testData);
    assert.deepEqual(noRetained, testData);
    var emptyRetained = ReportFilters.filter.byRetained([], testData);
    assert.deepEqual(emptyRetained, testData);
  });
  it('byRetained should return an empty store if the retain status cannot be found', function() {
    var filteredByRetained = ReportFilters.filter.byRetained(['Replained'], testData);
    assert.isArray(filteredByRetained);
    assert.equal(filteredByRetained.length, 0);
  });
  it('byRetained should filter a group by the retain status type', function() {
    var filteredByRetained = ReportFilters.filter.byRetained(searchRetained, testData);
    assert.equal(filteredByRetained.length, 135);
    assert.isFalse(filteredByRetained.length === testData.length);
  });
});

describe('ReportFilters.filter.byComments', function() {
  it('byComments should return undefined if no parameters are passed', function() {
    assert.isUndefined(ReportFilters.filter.byComments());
  });
  it('byComments should return undefined if no store is specified', function() {
    assert.isUndefined(ReportFilters.filter.byComments(true));
  });
  it('byComments should filter a group by whether or not it has comments', function() {
    var hasComments = ReportFilters.filter.byComments(true, testData);
    var noComments = ReportFilters.filter.byComments(false, testData);
    assert.equal(hasComments.length, 5);
    assert.equal(noComments.length, 134);
    assert.isFalse(noComments.length === testData.length);
    assert.isFalse(hasComments.length === testData.length);
  });
});

describe('ReportFilters.filter.byProposed', function() {
  it('byProposed should return undefined if no parameters are passed', function() {
    assert.isUndefined(ReportFilters.filter.byProposed());
  });
  it('byProposed should return undefined if no store is specified', function() {
    assert.isUndefined(ReportFilters.filter.byProposed(true));
  });
  it('byProposed should filter a group by whether or not it has proposed changes', function() {
    var hasProposed = ReportFilters.filter.byProposed(true, testData);
    var noProposed = ReportFilters.filter.byProposed(false, testData);
    assert.equal(hasProposed.length, 5);
    assert.equal(noProposed.length, 136);
    assert.isFalse(noProposed.length === testData.length);
    assert.isFalse(hasProposed.length === testData.length);
  });
});

describe('ReportFilters.filter.byCustom', function() {
  it('byCustom should return undefined if no parameters are passed, or if no store is specified', function() {
    assert.isUndefined(ReportFilters.filter.byCustom());
    assert.isUndefined(ReportFilters.filter.byCustom({}));
  });
  it('byCustom should return the original store if no query or empty query obj', function() {
    var noCustom = ReportFilters.filter.byCustom(null, testData);
    assert.deepEqual(noCustom, testData);
    var emptyCustom = ReportFilters.filter.byCustom({}, testData);
    assert.deepEqual(emptyCustom, testData);
  });
  it('byCustom should return an empty store if the query cannot be found', function() {
    var cantFind = {
      group: ['sponge.txt'],
      status: ['CHECKED'],
      retained: ['Replained']
    }
    var filteredByCustom = ReportFilters.filter.byCustom(cantFind, testData);
    assert.isArray(filteredByCustom);
    assert.equal(filteredByCustom.length, 0);
  });
  it('byCustom should filter a group by the queries name', function() {
    var customSearch = {
      group: searchGroup,
      status: searchStatus,
      retained: searchRetained,
    }
    var filteredByCustom = ReportFilters.filter.byCustom(customSearch, testData);
    assert.equal(filteredByCustom.length, 2)
  });
});

describe('ReportFilters.filter.bySearchTerm', function() {
  it('bySearchTerm should return undefined if no parameters are passed', function() {
    assert.isUndefined(ReportFilters.filter.bySearchTerm());
  });
  it('bySearchTerm should return the original store if no query or empty query string', function() {
    var noSearchTerm = ReportFilters.filter.bySearchTerm(null, testData);
    assert.deepEqual(noSearchTerm, testData);
    var emptySearchTerm = ReportFilters.filter.bySearchTerm('', testData);
    assert.deepEqual(emptySearchTerm, testData);
  });
  it('bySearchTerm should return an empty store if the search term cannot be found', function() {
    var filteredBySearchTerm = ReportFilters.filter.bySearchTerm('asdflkd', testData);
    assert.isArray(filteredBySearchTerm);
    assert.equal(filteredBySearchTerm.length, 0);
  });
  it('bySearchTerm should filter a group by the search term', function() {
    var filteredBySearchTerm = ReportFilters.filter.bySearchTerm('sponge', testData);
    assert.equal(filteredBySearchTerm.length, 2);
    assert.isFalse(filteredBySearchTerm.length === testData.length);
  });
});

describe('ReportFilters.filter.byChapter', function() {
  it('byChapter should return undefined if no parameters are passed', function() {
    assert.isUndefined(ReportFilters.filter.byChapter());
  });
  it('byChapter should return the original store if no query or empty query string', function() {
    var noChapters = ReportFilters.filter.byChapter(null, testData);
    assert.deepEqual(noChapters, testData);
    var emptyChapters = ReportFilters.filter.byChapter([], testData);
    assert.deepEqual(emptyChapters, testData);
  });
  it('byChapter should return an empty store if the chapter number cannot be found', function() {
    var filteredByChapters = ReportFilters.filter.byChapter([123, 134], testData);
    assert.isArray(filteredByChapters);
    assert.equal(filteredByChapters.length, 0);
  });
  it('byChapter should filter a group by the chapter number', function() {
    var filteredByChapters = ReportFilters.filter.byChapter([4, 2], testData);
    assert.equal(filteredByChapters.length, 74);
    assert.isFalse(filteredByChapters.length === testData.length);
  });
});

describe('ReportFilters.filter.byVerse', function() {
  it('byVerse should return undefined if no parameters are passed', function() {
    assert.isUndefined(ReportFilters.filter.byVerse());
  });
  it('byVerse should return the original store if no query or empty query string', function() {
    var noVerse = ReportFilters.filter.byVerse(null, testData);
    assert.deepEqual(noVerse, testData);
    var emptyVerse = ReportFilters.filter.byVerse([], testData);
    assert.deepEqual(emptyVerse, testData);
  });
  it('byVerse should return an empty store if the chapter number cannot be found', function() {
    var filteredByVerse = ReportFilters.filter.byVerse([123, 134], testData);
    assert.isArray(filteredByVerse);
    assert.equal(filteredByVerse.length, 0);
  });
  it('byVerse should filter a group by the chapter number', function() {
    var filteredByVerse = ReportFilters.filter.byVerse([4, 2], testData);
    assert.equal(filteredByVerse.length, 15);
    assert.isFalse(filteredByVerse.length === testData.length);
  });
});

describe('ReportFilters.get.statusList', function() {
  it('statusList should return the default status list', function() {
    var statusList = ReportFilters.get.statusList();
    assert.isArray(statusList);
    assert.equal(statusList.length, 3);
    assert.deepEqual(defaultStatus, statusList)
  });
});

describe('ReportFilters.get.retainedList', function() {
  it('retainedList should return the default retained status list', function() {
    var retainedList = ReportFilters.get.retainedList();
    assert.isArray(retainedList);
    assert.equal(retainedList.length, 3);
    assert.deepEqual(retainedList, defaultRetained)
  });
});

describe('ReportFilters.searchText', function() {
  var testTargetLanguage = window.ModuleApi.getDataFromCommon("targetLanguage");
  it('searchText should return undefined if no parameters are passed', function() {
    assert.isUndefined(ReportFilters.searchText());
  });
  it('searchText should return the original target language if no query or empty query string', function() {
    var noText = ReportFilters.searchText(null, testTargetLanguage);
    assert.deepEqual(noText, testTargetLanguage);
    var emptyText = ReportFilters.searchText("", testTargetLanguage);
    assert.deepEqual(emptyText, testTargetLanguage);
  });
  it('searchText should return an empty target language if the query cannot be found', function() {
    var filteredByText = ReportFilters.searchText('alskldk', testTargetLanguage);
    assert.isObject(filteredByText);
    assert.equal(Object.keys(filteredByText).length, 0);
  });
});
