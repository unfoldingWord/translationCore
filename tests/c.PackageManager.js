const assert = require('chai').assert;
const React = require('react');
const {mount, shallow} = require('enzyme');
const PackageManager = require('../src/js/components/core/Package_Manager/PackageManager.js');
const PackageManagerView = require('../src/js/components/core/Package_Manager/PackageManagerView.js');
const PackageCard = require('../src/js/components/core/Package_Manager/PackageCard.js');

describe('<PackageCard />', function() {
  const wrapper = shallow(<PackageCard />);
  const populatedWrapper = shallow(<PackageCard packName={'translationRhymes'} packVersion={'1.0.0'} numOfDownloads={""} description={"No description found."} buttonDisplay={'downloadPack'}/>);
  it('renders four <div /> component if no data is given', function() {
    assert.equal(wrapper.find('div').length, 4);
  });
  it('renders two elements with the class .pull-right if no data is given', function() {
    assert.equal(wrapper.find('.pull-right').length, 2);
  });
  it('renders three <div /> components normally', function() {
    assert.equal(wrapper.find('div').length, 4);
  });
  it('renders two elements with the class .pull-right normally', function() {
    assert.equal(wrapper.find('.pull-right').length, 2);
  });
});

describe('<PackageManagerView />', function() {
  const wrapper = shallow(<PackageManagerView />);
  it('renders five <PackageCard /> components', function(done) {
    this.timeout(50000)
    setTimeout(function () {
      assert.equal(wrapper.find('PackageCard').length, 5)
      done();
    }, 2000);
  });
  it ('renders one <PackManagerSideBar> component', function() {
    assert.equal(wrapper.find('PackManagerSideBar').length, 1);
  })
});

describe('PackageManager.list', function() {
  it('getPackageList should retrieve a list of available packages', function(done) {
    this.timeout(50000);
    PackageManager.list(function(obj) {
      assert.isObject(obj);
      assert.isObject(obj['translationWords']);
      assert.isString(obj['translationWords'].name);
      done();
    });
  });
  it('getPackageList should return an error if no callback is specified', function() {
    var pm = PackageManager.list();
    assert.equal(pm, 'No callback specified');
    assert.isString(pm);
  });
});

describe('PackageManager.search', function() {
  it('search should return a list of matching packages', function(done) {
    this.timeout(50000);
    PackageManager.search('translation', function(results) {
      assert.isArray(results);
      assert.isTrue(results.length > 0);
      done();
    });
  });
  it('search should return an empty array if search term is undefined', function(done) {
    this.timeout(50000);
    PackageManager.search(null, function(results) {
      assert.isArray(results);
      assert.isTrue(results.length === 0);
      done();
    });
  });
  it('search should return an error if no callback is specified', function() {
    var sres = PackageManager.search('translation');
    assert.isString(sres)
    assert.equal(sres, 'No callback specified');
  });
});

describe('PackageManager.download', function() {
  it('download should fail for non existant package', function(done) {
    this.timeout(50000);
    PackageManager.download('translationRhymes', function(err, results) {
      assert.isNull(results);
      assert.isNotNull(err);
      assert.equal(err, 'Package does not exist');
      done();
    });
  });
  it('download should fail for an undefined package', function(done) {
    this.timeout(50000);
    PackageManager.download(null, function(err, results) {
      assert.isNull(results);
      assert.isNotNull(err);
      assert.equal(err, 'Package does not exist');
      done();
    });
  });
  it('download should return an error for an undefined callback', function() {
    var pmd = PackageManager.download('translationRhymes');
    assert.isString(pmd);
    assert.equal(pmd, 'No callback specified');
  });
  it('download should download an existing package', function() {
    this.timeout(500000);
    PackageManager.download('ExampleChecker', function(err, results) {
      assert.isNull(err);
      assert.isNotNull(results);
      assert.equal('Installation Successful', results);
      done();
    });
  });
});

describe('PackageManager.getLocalList', function() {
  it('getLocalList should return an array containing all the packages', function() {
    var localInstall = PackageManager.getLocalList();
    assert.isArray(localInstall);
    assert.isTrue(localInstall.length > 0);
    assert.isString(localInstall[0]);
    assert.isTrue(localInstall.includes('ExampleChecker'));
    assert.isFalse(localInstall.includes('translationRhymes'));
  });
});

describe('PackageManager.isInstalled', function() {
  it('isInstalled should return false for an undefined package.', function() {
    assert.isFalse(PackageManager.isInstalled());
  });
  it('isInstalled should return false for a package that is not installed.', function() {
    assert.isFalse(PackageManager.isInstalled('translationRhymes'));
  });
});
