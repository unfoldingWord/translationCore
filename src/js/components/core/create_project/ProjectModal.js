const fs = require(window.__base + 'node_modules/fs-extra');
const React = require('react');
const Modal = require('react-bootstrap/lib/Modal.js');
const FormGroup = require('react-bootstrap/lib/FormGroup.js');
const ControlLabel = require('react-bootstrap/lib/ControlLabel.js');
const FormControl = require('react-bootstrap/lib/FormControl.js');
const GitApi = require('../GitApi.js');
const Button = require('react-bootstrap/lib/Button.js');
const ButtonGroup = require('react-bootstrap/lib/ButtonGroup.js');
const ButtonToolbar = require('react-bootstrap/lib/ButtonToolbar.js');
const Checkbox = require('react-bootstrap/lib/Checkbox.js');
var CoreStore = require('../../../stores/CoreStore.js');
var CheckStore = require('../../../stores/CheckStore');
const CoreActions = require('../../../actions/CoreActions.js');
const {dialog} = window.electron.remote;
const FileModule= require('../FileModule');
const ENTER = 13;
var api = window.ModuleApi;
const booksOfBible = require('../booksOfBible');
const TargetLanguage = require('../UploadModal');
const SelectChecks = require('./SelectChecks');
const path = require('path');
const CheckDataGrabber = require('./CheckDataGrabber');
const utils = require('../../../utils');
const AccessProjectModal = require('../AccessProjectModal');

const ProjectModal = React.createClass({
  params: {
    originalLanguagePath: window.__base + "data/ulgb"
  },

  getInitialState: function() {
    return {
      projectName:"",
      showModal: false,
      modalTitle:"Create Project",
      controlLabelTitle:"Name",
      placeHolderText:"Enter name of project",
      doneText:"Create",
      loadedChecks:[],
      currentChecks:[],
      modalValue:"Languages",
      backButton:'hidden',
      FetchDataArray:[]     //FetchDataArray of checkmodule
    };
  },

  componentWillMount: function() {
    AccessProjectModal.startListener();
    CoreStore.addChangeListener(this.showCreateProject);      //action to show create project modal
  },
  showCreateProject: function() {
    var modal = CoreStore.getShowProjectModal()
    if(modal === "Check") {
      this.setState({
        showModal: true,
        modalValue: modal
      });
    } else if (modal === 'Languages') {
      this.setState({
        showModal: true,
        modalValue: modal,
        modalTitle: '',
        doneText: 'Check'
      });
    }
  },
  close: function() {
    //CheckStore.getNameSpaces();
    CoreActions.showCreateProject("");
    this.setState({
      showModal: false
    });
  },

  makePathForChecks: function(check) {
    if (!check || check == '') {
      return;
    }
    var path = window.__base + 'modules/' + check;
    return path;
  },

  onClick: function () {
    var tempFetchDataArray = [];      //tempFetchDataArray to push checkmodule paths onto
    if (this.state.modalValue == "Check") {
      for (var element in this.state.FetchDataArray) {
        var pathOfCheck = this.makePathForChecks(this.state.FetchDataArray[element]);
        if (pathOfCheck) {
          tempFetchDataArray.push([this.state.FetchDataArray[element], pathOfCheck]);
        }
      }
      var _this = this;
      var manifestLocation = path.join(this.params.targetLanguagePath, 'manifest.json');
      FileModule.readFile(manifestLocation, function(data){
        var parsedManifest = JSON.parse(data);
        var bookTitle = parsedManifest.project.name.split(' ');
        var bookName = _this.getBookAbbr(parsedManifest.project.name);
        _this.setBookName(bookName);
        let bookFileName = bookTitle.join('') + '.json';
        var saveLocation = _this.params.targetLanguagePath;
        var user = CoreStore.getLoggedInUser();
        var projectData = {
          local: true,
          target_language: _this.params.targetLanguagePath,
          original_language: ('data/ulgb/'),
          gateway_language: '',
          user: [{username: '', email: ''}],
          checkLocations: [],
          saveLocation: saveLocation,
          repo: _this.params.repo
        }
        var checkArray = api.getDataFromCommon('arrayOfChecks');
        projectData.checkLocations = checkArray;
        api.putDataInCommon('saveLocation', saveLocation);
        CheckDataGrabber.saveManifest(saveLocation, projectData, parsedManifest);
      });
      if (tempFetchDataArray.length > 0) {
        this.clearOldData();
        CheckDataGrabber.getFetchData(tempFetchDataArray, this.params);
      this.close();
    }
  }
    else if (this.state.modalValue === 'Languages') {
      try {
        var manifestLocation = path.join(this.params.targetLanguagePath, 'manifest.json');
        FileModule.readFile(manifestLocation, function(data){
          var parsedManifest = JSON.parse(data);
          if (parsedManifest.generator.name !== 'ts-desktop') {
            dialog.showErrorBox('Error', 'This does not appear to be a translation studio project');
          } else {
            CoreActions.showCreateProject("Check");
          }
        });
      } catch(error) {
        dialog.showErrorBox('Error', 'This does not appear to be a translation studio project');
      }
    }
  },

  clearOldData: function(){
    var manifest = api.getDataFromCommon('tcManifest');
    CoreActions.newProject();
    CheckStore.WIPE_ALL_DATA();
    api.modules = {};
    this.setSaveLocation(this.saveLocation);
    api.putDataInCommon('tcManifest', manifest);
  },

  getBookAbbr: function(book) {
    for (var bookAbbr in booksOfBible) {
      if (book.toLowerCase() == booksOfBible[bookAbbr].toLowerCase() || book.toLowerCase() == bookAbbr) {
        return bookAbbr;
      }
    }
    return null;
  },

  setSaveLocation: function(data) {
    this.saveLocation = data;
    if (CheckStore.storeData.common != undefined){
      api.putDataInCommon('saveLocation', data);
    } else {
      CheckStore.storeData['common'] = {};
      api.putDataInCommon('saveLocation', data);
    }
  },

  setTargetLanguageFilePath: function(path, link) {
    this.saveLocation = path;
    this.params.targetLanguagePath = path;
    this.params.repo = link;
    this.onClick();
  },

  setBookName: function(abbr) {
    this.params.bookAbbr = abbr;
  },
  changeModalBody: function(modalBody) {
    if (modalBody == "Check") {
      return (<SelectChecks currentChecks={this.state.currentChecks} ref={"SelectChecks"} loadedChecks={this.state.loadedChecks} FetchDataArray={this.state.FetchDataArray}/>);
    } else if (modalBody === 'Languages') {
      return (<TargetLanguage ref={"TargetLanguage"} setTargetLanguageFilePath={this.setTargetLanguageFilePath} />);
    }
  },

  render: function() {
    return (
      <div>
      <Modal show={this.state.showModal} onHide={this.close}>
      {this.changeModalBody(this.state.modalValue)}
      <Modal.Footer>
      <ButtonToolbar>
      <Button bsSize="xsmall" style={{visibility: this.state.backButton}}>Back</Button>
      <Button type="button" onClick={this.onClick} style={{position:'fixed', right: 15, bottom:10}}>{this.state.doneText}</Button>
      </ButtonToolbar>
      </Modal.Footer>
      </Modal>
      </div>
    )}
  });

  module.exports = ProjectModal;
