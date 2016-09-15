const React = require('react');
const fs = require(window.__base + 'node_modules/fs-extra');
const path = require('path');
const {dialog} = require('electron').remote;
const usfm = require('usfm-parser');
const pathex = require('path-extra');
const api = window.ModuleApi;

const Access = require('../AccessProject');
const ManifestGenerator = require('../create_project/ProjectManifest.js');
const books = require('../BooksOfBible.js');

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
 * @param {String} abbr - The abbeviation of the book.
 * @param {String} direction - The direction of the text.
 ******************************************************************************/
function openTargetLanguage(savePath, abbr, direction) {
  CheckStore.WIPE_ALL_DATA();
  api.modules = {};
  var parsedPath = path.parse(savePath);
  var saveLocation = path.join(defaultSave, parsedPath.name);
  var saveFile = path.join(saveLocation, parsedPath.base);
  api.putDataInCommon('saveLocation', saveLocation);
  fs.readFile(savePath, function(err, data) {
    if (err) {
      console.error(err);
    } else {
      fs.ensureDir(saveLocation, function (err) {
        if (err) console.log(err); // => null
        fs.writeFileSync(saveFile, data.toString());
      });
      var usfmData = data.toString();
      var parsedUSFM = usfm.toJSON(usfmData);
      var targetLanguage = {};
      targetLanguage.title = parsedUSFM.book;
      var chapters = parsedUSFM.chapters;
      for (var ch in chapters) {
        targetLanguage[chapters[ch].number] = {};
        var verses = chapters[ch].verses;
        for (var v in verses) {
          var verseText = verses[v].text.trim();
          targetLanguage[chapters[ch].number][verses[v].number] = verseText;
        }
      }
      if (translationCoreManifestPresent(saveLocation)) {
        loadProject(saveLocation);
      } else {
        var userData = {
          user: [CoreStore.getLoggedInUser()]
        };
        saveManifest(saveLocation, userData);
        var params = {
          originalLanguagePath: path.join(window.__base, 'static', 'tagged'),
          targetLanguagePath: saveLocation,
          bookAbbr: abbr,
          direction: direction
        };
        api.putDataInCommon('params', params);
        api.putDataInCommon('targetLanguage', targetLanguage);
      }
    }
  });
}
/**
 * @description This function saves a translationCore manifest.
 * @param {String} saveLocation - The directory to save the manifest.
 * @param {Object} data - An object accepted by ManifestGenerator
 ******************************************************************************/
function saveManifest(saveLocation, data) {
  try {
    var manifestLocation = path.join(saveLocation, 'tc-manifest.json');
    var manifest = ManifestGenerator(data);
    api.putDataInCommon('tcManifest', manifest);
    fs.outputJson(manifestLocation, manifest, function(err) {
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
 * @description This function searches for a translationCore manifest
 * @param {String} location - The directory to search for the manifest
 * @return {boolean} - Whether or not the translationCore manifest exists.
 ******************************************************************************/
function translationCoreManifestPresent(location) {
  // this currently just uses 'require' and if it throws an error it will return false
  try {
    require(path.join(location, 'tc-manifest.json'));
    return true;
  } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND') {
      console.error(e);
    }
  }
  return false;
}
/**
 * @description This function gets the translationCore manifest.
 * @param {String} folderPath - The directory of the project
 * @param {function} callback - Passes back any errors or data.
 ******************************************************************************/
function getManifest(folderPath, callback) {
  fs.readJson(path.join(folderPath, 'tc-manifest.json'), function(err, data) {
    callback(err, data);
  });
}
/**
 * @description This function loads an existing USFM project.
 * @param {String} folderPath - The directory of the project
 ******************************************************************************/
 function loadProject(saveLocation) {
   getManifest(saveLocation, function(error, tcManifest) {
     if (error) {
       console.error(error);
       const alert = {
         title: 'Error Getting Transaltion Studio Manifest',
         content: error.message,
         leftButtonText: 'Ok'
       };
       api.createAlert(alert);
     } else {
       api.putDataInCommon('tcManifest', tcManifest);
       var Access = require('../AccessProject');
       Access.loadFromFilePath(saveLocation);
     }
   });
 }

var ImportComponent = React.createClass({
  getInitialState: function() {
    return {
      direction: null,
      book: null,
      filePath: 'No file selected'
    };
  },

  showDialog: function() {
    var options = {
      filters: [
        {name: 'USFM', extensions: ['usfm', 'txt']}
      ]
    };
    var _this = this;
    var bookAbbr = this.state.book;
    var direction = this.state.direction;
    if (direction && bookAbbr) {
      dialog.showOpenDialog(options, function(savePath) {
        CheckStore.WIPE_ALL_DATA();
        api.modules = {};
        _this.setState({
          filePath: savePath[0]
        });
        openTargetLanguage(savePath[0], bookAbbr, direction);
      });
    } else {
      _this.setState({
        filePath: 'Choose a book and text direction first'
      });
    }
  },

  handleBookChange: function(e) {
    this.setState({
      book: e.target.value
    });
  },

  handleTextChange: function(e) {
    this.setState({
      direction: e.target.value
    });
  },

  render: function() {
    var selectArray = [<option key={'init'} value={null}> Select book</option>];
    for (var o in books) {
      selectArray.push(<option key={o} value={o}> {books[o]}</option>);
    }
    return (
      <div>
      {this.props.isWelcome ? <div> </div> : <br />}
      <FormGroup>
        <FormControl componentClass="select" placeholder="Select Book" onChange={this.handleBookChange}>
          {selectArray}
        </FormControl>
        {this.props.isWelcome ? <div> </div> : <br />}
        <FormControl componentClass="select" onChange={this.handleTextChange}>
          <option value={'ltr'}>Select text direction</option>
          <option value={'ltr'}>Left to right</option>
          <option value={'rtl'}>Right to left</option>
        </FormControl>
        {this.props.isWelcome ? <div> </div> : <br />}
        <Button bsSize={'small'} onClick={this.showDialog}>Choose USFM File</Button>
        <span style={{color: '#333'}}> &nbsp; {this.state.filePath}</span>
      </FormGroup>
      {this.props.isWelcome ? <div> </div> : <br />}
      <br />
      </div>
    );
  }
});
exports.component = ImportComponent;
exports.loadProject = loadProject;
exports.open = openTargetLanguage;
