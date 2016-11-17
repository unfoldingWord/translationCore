const React = require('react');
const fs = require(window.__base + 'node_modules/fs-extra');
const path = require('path');
const {dialog} = require('electron').remote;
const usfm = require('usfm-parser');
const pathex = require('path-extra');
const api = window.ModuleApi;

const ManifestGenerator = require('../create_project/ProjectManifest.js');
const books = require('../BooksOfBible.js');
const Recent = require('../RecentProjects.js');

const CoreStore = require('../../../stores/CoreStore.js');
const CheckStore = require('../../../stores/CheckStore');

const FormGroup = require('react-bootstrap/lib/FormGroup.js');
const ControlLabel = require('react-bootstrap/lib/ControlLabel.js');
const FormControl = require('react-bootstrap/lib/FormControl.js');
const Button = require('react-bootstrap/lib/Button.js');

const defaultSave = path.join(pathex.homedir(), 'translationCore');

/**
 * @description This function converts usfm into the target language format.
 * @param {String} savePath - The path of the file containing usfm text.
 * @param {String} direction - The direction of the text.
 ******************************************************************************/
function openUSFMProject(savePath, direction, link) {
  clearPreviousData();
  createTCProject(savePath, (parsedUSFM, saveLocation) => {
    var targetLanguage = saveTargetLangeInAPI(parsedUSFM);
    saveParamsInAPI(parsedUSFM.book, saveLocation, direction);
    loadTranslationCoreManifest(saveLocation, (err, tcManifest) => {
      if (tcManifest) {
        loadProjectThatHasManifest(tcManifest, saveLocation);
      } else if (!tcManifest) {
        var userData = {
          user: [CoreStore.getLoggedInUser()]
        };
        var defaultManifest = {
          target_language:{
            direction: direction,
            id: "",
            name: targetLanguage.title
          },
        }
        saveManifest(saveLocation, defaultManifest, userData, link, (err, tcManifest) => {
          if (tcManifest) {
            loadProjectThatHasManifest(tcManifest, saveLocation);
          }
          else {
            console.error(err);
          }
        });
      }
    });
  });
}

function saveParamsInAPI(bookAbbr, saveLocation, direction) {
  var params = {
    originalLanguagePath: path.join(window.__base, 'static', 'tagged'),
    targetLanguagePath: saveLocation,
    direction: direction,
    bookAbbr: bookAbbr
  };
  if (isOldTestament(params.bookAbbr)) {
    params.originalLanguage = "hebrew";
  } else {
    params.originalLanguage = "greek";
  }
  api.putDataInCommon('params', params);
}

function saveTargetLangeInAPI(parsedUSFM) {
  var targetLanguage = {};
  targetLanguage.title = parsedUSFM.book;
  // targetLanguage.header = parsedUSFM.headers;
  var chapters = parsedUSFM.chapters;
  for (var ch in chapters) {
    targetLanguage[chapters[ch].number] = {};
    var verses = chapters[ch].verses;
    for (var v in verses) {
      var verseText = verses[v].text.trim();
      targetLanguage[chapters[ch].number][verses[v].number] = verseText;
    }
  }
  if (parsedUSFM.headers) {
    var parsedHeaders = parsedUSFM.headers;
    if (parsedHeaders['mt1']) {
      targetLanguage.title = parsedHeaders['mt1'];
    } else if (parsedHeaders['id']) {
      targetLanguage.title = books[parsedHeaders['id'].toLowerCase()];
    }
  }
  api.putDataInCommon('targetLanguage', targetLanguage);
  return targetLanguage;
}

function loadProjectThatHasManifest(tcManifest, saveLocation) {
  //tc-manifest is present initiate load
  const Access = require('../AccessProject');
  api.putDataInCommon('tcManifest', tcManifest);
  Access.loadFromFilePath(saveLocation);
}

function createTCProject(savePath, callback) {
  var parsedPath = path.parse(savePath);
  var saveLocation = path.join(defaultSave, parsedPath.name);
  var saveFile = path.join(saveLocation, parsedPath.base);
  api.putDataInCommon('saveLocation', saveLocation);
  try {
    var data = fs.readFileSync(savePath);
    fs.ensureDirSync(saveLocation);
    fs.writeFileSync(saveFile, data.toString());
    var usfmData = data.toString();
    var parsedUSFM = usfm.toJSON(usfmData);
    parsedUSFM.book = parsedUSFM.headers['id'].split(" ")[0].toLowerCase();
  } catch (e) {
    console.error(e);
  }
  callback(parsedUSFM, saveLocation);
}

/**
 * @desription - This returns true if the book is an OldTestament one
 * @param {string} projectBook - the book in abr form
 * manifest
 */
function isOldTestament(projectBook) {
  var passedBook = false;
  for (var book in books) {
    if (book == projectBook) passedBook = true;
    if (books[book] == "Malachi" && passedBook) {
      return true;
    }
  }
  return false;
}

/**
 * @description This function saves a translationCore manifest.
 * @param {String} saveLocation - The directory to save the manifest.
 * @param {Object} data - An object accepted by ManifestGenerator
 ******************************************************************************/
function saveManifest(saveLocation, defaultManifest, data, link, callback) {
  try {
    var manifestLocation = path.join(saveLocation, 'tc-manifest.json');
    var manifest = ManifestGenerator(data, defaultManifest);
    api.putDataInCommon('tcManifest', manifest);
    fs.outputJson(manifestLocation, manifest, function (err) {
      if (err) {
        //this.manifestError('Error Saving tC Manifest');
      }
      //overwrites old manifest if present, or else creates new one
      callback(null, manifest);
    });
  }
  catch (err) {
    callback(err, null);
  }
}
/**
 * @description - This checks to see if a valid translationCore manifest file is present.
 * @param {string} path - absolute path to a translationStudio project folder
 */
function loadTranslationCoreManifest(savePath, callback) {
  try {
    var hasManifest = fs.readJsonSync(path.join(savePath, 'tc-manifest.json'));
    if (hasManifest) {
      callback(null, hasManifest);
    }
  }
  catch (e) {
    callback(e, null);
  }
}
/**
 * @description This function gets the translationCore manifest.
 * @param {String} folderPath - The directory of the project
 * @param {function} callback - Passes back any errors or data.
 ******************************************************************************/
function getManifest(folderPath, callback) {
  fs.readJson(path.join(folderPath, 'tc-manifest.json'), function (err, data) {
    callback(err, data);
  });
}

function clearPreviousData() {
  CheckStore.WIPE_ALL_DATA();
  api.modules = {};
}

var ImportComponent = React.createClass({
  getInitialState: function () {
    return {
      direction: null,
      filePath: 'No file selected'
    };
  },

  showDialog: function () {
    var options = {
      filters: [
        { name: 'USFM', extensions: ['usfm', 'sfm', 'txt'] }
      ]
    };
    var _this = this;
    var direction = this.state.direction;
    if (direction && !this.open) {
      this.open = true;
      dialog.showOpenDialog(options, function (savePath) {
        CheckStore.WIPE_ALL_DATA();
        api.modules = {};
        _this.setState({
          filePath: savePath[0]
        });
        _this.open = false;
        openUSFMProject(savePath[0], direction, undefined);
      });
    } else {
      _this.setState({
        filePath: 'Choose a text direction first'
      });
    }
  },

  handleTextChange: function (e) {
    this.setState({
      direction: e.target.value
    });
  },

  render: function () {
    return (
      <div>
        {this.props.isWelcome ? <div> </div> : <br />}
        <FormGroup>
          <FormControl componentClass="select" onChange={this.handleTextChange}>
            <option value={'ltr'}>Select text direction</option>
            <option value={'ltr'}>Left to right</option>
            <option value={'rtl'}>Right to left</option>
          </FormControl>
          {this.props.isWelcome ? <div> </div> : <br />}
          <Button bsSize={'small'} onClick={this.showDialog}>Choose USFM File</Button>
          <span style={{ color: '#333' }}> &nbsp; {this.state.filePath}</span>
        </FormGroup>
        {this.props.isWelcome ? <div> </div> : <br />}
        <br />
      </div>
    );
  }
});
exports.component = ImportComponent;
exports.open = openUSFMProject;
