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
const ButtonGroup = require('react-bootstrap/lib/ButtonGroup.js');
const ControlLabel = require('react-bootstrap/lib/ControlLabel.js');
const FormControl = require('react-bootstrap/lib/FormControl.js');
const Button = require('react-bootstrap/lib/Button.js');
var Upload = require('../Upload.js');

const defaultSave = path.join(pathex.homedir(), 'translationCore');

/**
 * @description This function converts usfm into the target language format.
 * @param {String} savePath - The path of the file containing usfm text.
 * @param {String} direction - The direction of the text.
 ******************************************************************************/
function openUSFMProject(savePath, direction, link) {
  Upload = require('../Upload.js');
  Upload.clearPreviousData();
  createTCProject(savePath, (parsedUSFM, saveLocation) => {
    var targetLanguage = saveTargetLangeInAPI(parsedUSFM);
    console.log(targetLanguage);
    saveParamsInAPI(parsedUSFM.book, saveLocation, direction);
    Upload.loadFile(saveLocation, 'tc-manifest.json', (err, tcManifest) => {
      if (tcManifest) {
        Upload.loadProjectThatHasManifest(saveLocation, function(){}, tcManifest);
        ModuleApi.putDataInCommon('targetLanguage', targetLanguage);
      } else if (!tcManifest) {
        var defaultManifest = {
          "source_translations": [
            {
              "language_id": "en",
              "resource_id": "ulb",
              "checking_level": "",
              "date_modified": new Date(),
              "version": ""
            }
          ],
          target_language: {
            direction: direction,
            id: "",
            name: targetLanguage.title
          },
          project_id: parsedUSFM.book
        }
        Upload.saveManifest(saveLocation, link, defaultManifest, (err, tcManifest) => {
          if (tcManifest) {
            Upload.loadProjectThatHasManifest(saveLocation, function(){}, tcManifest);
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
  Upload = require('../Upload.js');
  if (!bookAbbr || !saveLocation || !direction) return 'Missing params';
  var params = {
    originalLanguagePath: path.join(window.__base, 'static', 'tagged'),
    targetLanguagePath: saveLocation,
    direction: direction,
    bookAbbr: bookAbbr
  };
  if (Upload.isOldTestament(params.bookAbbr)) {
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

var ImportComponent = React.createClass({
  getInitialState: function () {
    return {
      direction: "ltr",
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
        if (savePath) {
          _this.setState({
            filePath: savePath[0]
          });
          _this.open = false;
          openUSFMProject(savePath[0], direction, undefined);
        } else {
          _this.open = false;
        }
      });
    } else {
      _this.setState({
        filePath: 'No file selected'
      });
    }
  },

  handleTextChange: function (key, e) {
    if (key == "rtl") {
      e.target.parentNode.children[0].className = "btn btn-sm btn-default";
      e.target.parentNode.children[1].className = "btn btn-sm btn-active";
    } else {
      e.target.parentNode.children[0].className = "btn btn-sm btn-active";
      e.target.parentNode.children[1].className = "btn btn-sm btn-default";
    }
    this.setState({
      direction: key
    });
  },

  render: function () {
    return (
      <div>
        {this.props.isWelcome ? <div> </div> : <br />}
        Select Text Direction:
        <FormGroup>
          <ButtonGroup style={{ paddingBottom: 10, paddingTop: 10 }}>
            <Button bsSize={'small'} eventKey={"ltr"} onClick={this.handleTextChange.bind(this, "ltr")}>Left To Right</Button>
            <Button bsSize={'small'} eventKey={"rtl"} onClick={this.handleTextChange.bind(this, "rtl")}>Right To Left</Button>
          </ButtonGroup>
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
exports.saveParamsInAPI = saveParamsInAPI;
exports.saveTargetLangeInAPI = saveTargetLangeInAPI;
exports.createTCProject = createTCProject;
