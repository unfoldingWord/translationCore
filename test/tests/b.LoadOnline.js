// LoadOnline.js Test
const loadOnline = require('../../out/js/components/core/LoadOnline.js');
const badSave = path.join(path.homedir(), 'translationCore', 'id_-cfksl');
import ImportOnlineContainer from '../../out/js/containers/ImportOnlineContainer';
import configureStore from '../../out/js/utils/configureStore';
import { loadState} from '../../out/js/utils/localStorage';
const persistedState = loadState();
const mainStore = configureStore(persistedState);

describe('loadOnline.openManifest', function() {
  it('loadOnline.openManifest should return an error if no link is specified', function(done) {
    loadOnline(null, function(err, savePath, url) {
      assert.isString(err.text);
      assert.isNull(savePath);
      assert.isNull(url);
      assert.equal(err.text, 'No link specified');
      done();
    });
  });
  it('loadOnline.openManifest should fail on an invalid link.', function(done){
    fs.removeSync(badSave);
    this.timeout(500000);
    loadOnline('https://git.door43.org/ianhoegen123/id_-cfksl.git', function(err, savePath, url) {
      assert.isNull(savePath);
      assert.isNull(url);
      assert.isString(err.text);
      done();
    });
  });

  it('loadOnline.openManifest should not deny a non .git link.', function(done){
    this.timeout(50000);
    var expectedSavePath = path.join(path.homedir(), 'translationCore', 'id_-co_text_reg');
    var expectedURL = 'https://git.door43.org/royalsix/id_-co_text_reg';
    loadOnline(expectedURL, function(err, savePath, url) {
      assert.equal(savePath, expectedSavePath);
      assert.equal(url, expectedURL+'.git');
      fs.removeSync(savePath);
      done();
    });
  });

  it('loadOnline.openManifest should return the home directory and url', function(done){
    this.timeout(50000);
    var expectedSavePath = path.join(path.homedir(), 'translationCore', 'id_-co_text_reg');
    var expectedURL = 'https://git.door43.org/royalsix/id_-co_text_reg.git';
    loadOnline(expectedURL, function(err, savePath, url) {
      assert.equal(savePath, expectedSavePath);
      assert.equal(url, expectedURL);
      done();
    });
  });
});

describe('<ImportOnlineContainer />', function() {
  const loggedInState = {
    ...persistedState,
    loginReducer: {
      loggedInUser: true,
      userdata: {
        username: 'ihoegen'
      }
    }
  };
  const loggedInWithProjects = {
    ...loggedInState,
    importOnlineReducer: {
      repos: [
        {
          project: "48-GAL",
          repo: 'ihoegen/48-GAL',
          user: 'ihoegen'
        },
        {
          project: "Test-Project",
          repo: 'ihoegen/Test-Project',
          user: 'ihoegen'
        }
      ]
    }
  };
  let projectStore = configureStore(loggedInWithProjects);
  let importOnline = mount(<ImportOnlineContainer store={mainStore}/>);
  let importOnlineLoggedIn = mount(<ImportOnlineContainer store={configureStore(loggedInState)}/>);
  let importOnlineProjects = mount(<ImportOnlineContainer store={projectStore}/>);
  let importOnlineHTML = importOnline.html();
  let importOnlineLoggedInHTML = importOnlineLoggedIn.html();
  let importOnlineProjectsHTML = importOnlineProjects.html();
  it('should render eight <div /> elements', function() {
    assert.equal(importOnline.find('div').length, 8);
  });

  it('should render instructions', function() {
    assert.isTrue(importOnlineHTML.indexOf('Select one of your projects above or enter the URL of a project below') >= 0);
  });

  it('should tell the user they must log in to see Door43 projects', function() {
    assert.equal(importOnline.find('button').length, 2);
    assert.isTrue(importOnlineHTML.indexOf('Unable to connect to the online projects. Please log in to your Door43 account.') >= 0);
    assert.isTrue(importOnlineHTML.indexOf('No Projects Found') < 0);
  });

  it('should tell the user they have no projects when logged in but have no Door43 projects', function() {
    assert.equal(importOnlineLoggedIn.find('button').length, 2);
    assert.isTrue(importOnlineLoggedInHTML.indexOf('Unable to connect to the online projects. Please log in to your Door43 account.') < 0);
    assert.isTrue(importOnlineLoggedInHTML.indexOf('No Projects Found') >= 0);
  });
  it('should display Door43 Projects when a user is logged in and they have projects', function() {
    assert.equal(importOnlineProjects.find('button').length, 4);
    assert.isTrue(importOnlineProjectsHTML.indexOf('Unable to connect to the online projects. Please log in to your Door43 account.') < 0);
    assert.isTrue(importOnlineProjectsHTML.indexOf('No Projects Found') < 0);
    assert.isTrue(importOnlineProjectsHTML.indexOf('Test-Project') >= 0);
  });
});
