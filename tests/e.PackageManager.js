const assert = require('chai').assert;
const PackageManager = require('../src/js/components/core/Package_Manager/PackageManager.js');

describe('PackageManager.list', function() {
  it('PackageManager.getPackageList should retrieve a list of available packages', function(done) {
    this.timeout(50000);
    PackageManager.list(function(obj) {
      assert.isObject(obj);
      assert.isObject(obj['translationWords']);
      assert.isString(obj['translationWords'].name);
      done();
    });
  });
});

describe('PackageManager.search', function() {
  it('PackageManager.search should return a list of matching packages', function(done) {
    this.timeout(50000);
    PackageManager.search('translation', function(results) {
      assert.isArray(results);
      assert.isTrue(results.length > 0);
      done();
    });
  });
});

describe('PackageManager.download', function() {
  it('PackageManager.download should fail for non existant package', function(done) {
    this.timeout(50000);
    PackageManager.download('translationRhymes', function(err, results) {
      assert.isNull(results);
      assert.isNotNull(err);
      assert.equal(err, 'Package does not exist');
      done();
    });
  });
  it('PackageManager.download should download an existing package', function(done) {
    this.timeout(500000);
    PackageManager.download('translationWords', function(err, results) {
      assert.isNull(err);
      assert.isNotNull(results);
      assert.equal('Installation Successful', results);
      done();
    });
  });
});

describe('PackageManager.getLocalList', function() {
  it('PackageManager.getLocalList should return an array containing all the packages', function() {
    var localInstall = PackageManager.getLocalList();
    assert.isArray(localInstall);
    assert.isTrue(localInstall.length > 0);
    assert.isString(localInstall[0]);
    assert.isTrue(localInstall.includes('translationWords'));
    assert.isFalse(localInstall.includes('translationRhymes'));
  });
});
