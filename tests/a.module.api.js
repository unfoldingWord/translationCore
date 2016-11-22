const chai = require('chai');
const assert = chai.assert;
require("../src/js/pages/index");
const ModuleApi = require('../src/js/ModuleApi.js');

describe('ModuleApi.convertToFullBookName', function() {
  it('convertToFullBookName should return the full book name based on abbreviation.', function() {
    var mrk = "mrk";
    var mrkUpper = "MRK";
    var mrkExpected = "Mark";
    var unexpectedValue = "abc";
    assert.equal(ModuleApi.convertToFullBookName(mrk), mrkExpected);
    assert.equal(ModuleApi.convertToFullBookName(mrkUpper), mrkExpected);
    assert.equal(ModuleApi.convertToFullBookName(unexpectedValue), undefined);
  });
});
