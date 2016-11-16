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
function openTargetLanguage(savePath, direction, link) {
  const Access = require('../AccessProject');
  CheckStore.WIPE_ALL_DATA();
  api.modules = {};
  var parsedPath = path.parse(savePath);
  var saveLocation = path.join(defaultSave, parsedPath.name);
  var saveFile = path.join(saveLocation, parsedPath.base);
  api.putDataInCommon('saveLocation', saveLocation);
  Recent.add(saveLocation);
  fs.readFile(savePath, function (err, data) {
    if (err) {
      console.error(err);
    } else {
      fs.ensureDir(saveLocation, function (err) {
        if (err) console.error(err); // => null
        fs.writeFileSync(saveFile, data.toString());
      });
      var usfmData = data.toString();
      try {
        var parsedUSFM = usfm.toJSON(usfmData);
      } catch (err) {
        console.error(err);
        return;
      }
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
      var bookAbr = parsedUSFM.headers['id'].split(" ")[0].toLowerCase();
      loadTranslationCoreManifest(saveLocation, (err, tcManifest) => {
        if (tcManifest) {
          debugger;
          //tc-manifest is present initiate load
          api.putDataInCommon('tcManifest', tcManifest);
          var params = getParams(saveLocation, direction, bookAbr);
          api.putDataInCommon('params', params);
          api.putDataInCommon('targetLanguage', targetLanguage);
          Access.loadFromFilePath(saveLocation);
        } else if (!tcManifest) {
          var userData = {
            user: [CoreStore.getLoggedInUser()]
          };
          saveManifest(saveLocation, userData, link);
          var params = getParams(saveLocation, direction, bookAbr);
          if (parsedUSFM.headers) {
            var parsedHeaders = parsedUSFM.headers;
            if (parsedHeaders['mt1']) {
              targetLanguage.title = parsedHeaders['mt1'];
            } else if (parsedHeaders['id']) {
              targetLanguage.title = books[parsedHeaders['id'].toLowerCase()];
            }
          }
          api.putDataInCommon('params', params);
          api.putDataInCommon('targetLanguage', targetLanguage);
          Access.loadFromFilePath(saveLocation, undefined);
        }
      });
    }
  });
}

function getParams(saveLocation, direction, bookAbr) {
  var params = {
    originalLanguagePath: path.join(window.__base, 'static', 'tagged'),
    targetLanguagePath: saveLocation,
    direction: direction,
    bookAbr: bookAbr
  };
  if (isOldTestament(params.bookAbr)) {
    params.originalLanguage = "hebrew";
  } else {
    params.originalLanguage = "greek";
  }
  return params;

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
function saveManifest(saveLocation, data, link) {
  try {
    var manifestLocation = path.join(saveLocation, 'tc-manifest.json');
    var manifest = ManifestGenerator(data, undefined);
    api.putDataInCommon('tcManifest', manifest);
    fs.outputJson(manifestLocation, manifest, function (err) {
      if (err) {
        const alert = {
          title: 'Error Saving Manifest',
          content: err.message,
          leftButtonText: 'Ok'
        };
        api.createAlert(alert);
        console.error(err);
      }
    });
  } catch (err) {
    console.error(err);
    const alert = {
      title: 'Error Saving translationCore Manifest',
      content: err.message,
      leftButtonText: 'Ok'
    };
    api.createAlert(alert);
  }
}
/**
 * @description - This checks to see if a valid translationCore manifest file is present.
 * @param {string} path - absolute path to a translationStudio project folder
 */
function loadTranslationCoreManifest(path, callback) {
  try {
    var hasManifest = fs.readJsonSync(Path.join(path, 'tc-manifest.json'));
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
        openTargetLanguage(savePath[0], direction, undefined);
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
exports.open = openTargetLanguage;
