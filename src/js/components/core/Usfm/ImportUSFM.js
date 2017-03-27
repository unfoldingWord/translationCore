import React from 'react';
import fs from 'fs-extra';
import usfm from 'usfm-parser';
import path from 'path-extra';
import {FormGroup, ButtonGroup, ControlLabel, FormControl, Button} from 'react-bootstrap';
import { addNewBible } from '../../../actions/ResourcesActions.js';
import { loadProjectThatHasManifest } from '../../../actions/CoreActionsRedux';
import { dispatch } from "../../../pages/root";
import pathex from 'path-extra';
//const declaration
const api = window.ModuleApi;
const defaultSave = path.join(pathex.homedir(), 'translationCore');
import Helpers from '../../../utils/helpers';


/**
 * @description This function converts usfm into the target language format.
 * @param {String} savePath - The path of the file containing usfm text.
 * @param {String} direction - The direction of the text.
 ******************************************************************************/
function openUSFMProject(savePath, direction, link, callback = () => { }) {
  if (!savePath || !direction)
    return 'No file or text direction specified';
  createTCProject(savePath, (parsedUSFM, projectSaveLocation) => {
    var targetLanguage = saveTargetLangeInAPI(parsedUSFM);
    saveParamsInAPI(parsedUSFM.book, projectSaveLocation, direction, api.getDataFromCommon('language'));
    Helpers.loadFile(projectSaveLocation, 'tc-manifest.json', (err, tcManifest) => {
      if (tcManifest) {
        dispatch(loadProjectThatHasManifest(projectSaveLocation, callback, tcManifest));
        dispatch(addNewBible('targetLanguage', targetLanguage));
        //TODO: remove api call once implementation is ready
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
            name: api.getDataFromCommon('language')
          },
          project_id: parsedUSFM.book,
          ts_project: {
            id: parsedUSFM.book,
            name: parsedUSFM.bookName
          }
        }
        Helpers.saveManifest(projectSaveLocation, link, defaultManifest, (err, tcManifest) => {
          if (tcManifest) {
            dispatch(loadProjectThatHasManifest(projectSaveLocation, callback, tcManifest));
          }
          else {
            console.error(err);
          }
        });
      }
    });
  });
}
function saveParamsInAPI(bookAbbr, projectSaveLocation, direction, language) {
  if (!bookAbbr || !projectSaveLocation || !direction) return 'Missing params';
  var params = {
    originalLanguagePath: path.join(window.__base, 'static', 'taggedULB'),
    targetLanguagePath: projectSaveLocation,
    direction: direction,
    bookAbbr: bookAbbr,
    language: language
  };
  if (Helpers.isOldTestament(params.bookAbbr)) {
    params.originalLanguage = "hebrew";
  } else {
    params.originalLanguage = "greek";
  }
  api.putDataInCommon('params', params);
}

function saveTargetLangeInAPI(parsedUSFM) {
  if (!parsedUSFM) {
    return undefined;
  }
  var targetLanguage = {};
  targetLanguage.title = parsedUSFM.book;
  parsedUSFM.bookName = api.convertToFullBookName(parsedUSFM.book);
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
      targetLanguage.title = api.convertToFullBookName(parsedHeaders['mt1']) || parsedHeaders['mt1'];
    } else if (parsedHeaders['mt']) {
      targetLanguage.title = api.convertToFullBookName(parsedHeaders['mt']) || parsedHeaders['mt'];
    } else if (parsedHeaders['id']) {
      let id = parsedHeaders['id'].split(' ');
      targetLanguage.title = api.convertToFullBookName(id[0]) || id[0];
    }
    if (parsedHeaders['rem']) {
      let id = parsedHeaders['rem'].split(' ');
      id.pop()
      let language = id.pop();
      api.putDataInCommon('language', language);
    } else if (parsedHeaders['id']) {
      let id = parsedHeaders['id'].split(' ');
      let language = id[3];
      if (language) {
        api.putDataInCommon('language', language);
      }
    }
  }
  dispatch(addNewBible('targetLanguage', targetLanguage));
  //TODO: remove api call once implementation is ready
  api.putDataInCommon('targetLanguage', targetLanguage);
  return targetLanguage;
}

function createTCProject(savePath, callback) {
  if (!savePath || !callback) {
    return 'No save path or callback specified'
  }
  var parsedPath = path.parse(savePath);
  var projectSaveLocation = path.join(defaultSave, parsedPath.name);
  var saveFile = path.join(projectSaveLocation, parsedPath.base);
  api.putDataInCommon('projectSaveLocation', projectSaveLocation);
  try {
    var data = fs.readFileSync(savePath);
    fs.ensureDirSync(projectSaveLocation);
    fs.writeFileSync(saveFile, data.toString());
    var usfmData = data.toString();
    var parsedUSFM = usfm.toJSON(usfmData);
    parsedUSFM.book = parsedUSFM.headers['id'].split(" ")[0].toLowerCase();
  } catch (e) {
    console.error(e);
  }
  callback(parsedUSFM, projectSaveLocation);
}

class ImportComponent extends React.Component {
  constructor() {
    super();
    this.direction = 'ltr';
  }

  showDialog() {
    var options = {
      filters: [
        { name: 'USFM', extensions: ['usfm', 'sfm', 'txt'] }
      ]
    };
    var _this = this;
    var direction = this.direction;
    if (direction && !this.open) {
      this.open = true;
      dialog.showOpenDialog(options, function (savePath) {
        if (savePath) {
          _this.props.checkIfValid(savePath[0]);
          _this.open = false;
          _this.props.openUSFM(savePath[0], direction, undefined);
        } else {
          _this.open = false;
        }
      });
    } else {
      this.props.checkIfValid('No file selected');
    }
  }

  handleTextChange(key, e) {
    if (key == "rtl") {
      e.target.parentNode.children[0].className = "btn btn-sm btn-default";
      e.target.parentNode.children[1].className = "btn btn-sm btn-active";
    } else {
      e.target.parentNode.children[0].className = "btn btn-sm btn-active";
      e.target.parentNode.children[1].className = "btn btn-sm btn-default";
    }
    this.direction = key
  }

  render() {
    return (
      <div>
        <br />
        Select Text Direction:
        <FormGroup>
          <ButtonGroup style={{ paddingBottom: 10, paddingTop: 10 }}>
            <Button bsSize={'small'} eventKey={"ltr"} onClick={this.handleTextChange.bind(this, "ltr")}>Left To Right</Button>
            <Button bsSize={'small'} eventKey={"rtl"} onClick={this.handleTextChange.bind(this, "rtl")}>Right To Left</Button>
          </ButtonGroup>
          <br />
          <Button bsSize={'small'} onClick={this.showDialog.bind(this)}>Choose USFM File</Button>
          <span style={{ color: '#FFFFFF' }}> &nbsp; {this.props.filePath}</span>
        </FormGroup>
        <br />
      </div>
    );
  }
}
exports.component = ImportComponent;
exports.open = openUSFMProject;
exports.saveParamsInAPI = saveParamsInAPI;
exports.saveTargetLangeInAPI = saveTargetLangeInAPI;
exports.createTCProject = createTCProject;
