const fs = require(window.__base + 'node_modules/fs-extra');
const React = require('react');
const Modal = require('react-bootstrap/lib/Modal.js');
const Button = require('react-bootstrap/lib/Button.js');
const ButtonToolbar = require('react-bootstrap/lib/ButtonToolbar.js');
const CoreStore = require('../../../stores/CoreStore.js');
const CheckStore = require('../../../stores/CheckStore');
const CoreActions = require('../../../actions/CoreActions.js');
const {dialog} = window.electron.remote;
const api = window.ModuleApi;
const booksOfBible = require('../BooksOfBible');
const UploadModal = require('../UploadModal');
const ManifestGenerator = require('../ProjectManifest');
const path = require('path');
const Access = require('../AccessProject.js');

const INVALID_PROJECT = 'This does not appear to be a translation studio project';
const DEFAULT_ERROR = 'Error';

const ProjectModal = React.createClass({
  params: {
    originalLanguagePath: window.__base + "data/ulgb"
  },

  getInitialState: function() {
    return {
      showModal: false,
      modalTitle:"Create Project",
      doneText:"Load",
      loadedChecks:[],
      currentChecks:[],
      modalValue:"Languages",
      backButton:'hidden',
      FetchDataArray:[]     //FetchDataArray of checkmodule
    };
  },

  componentWillMount: function() {
    CoreStore.addChangeListener(this.showCreateProject);      //action to show create project modal
  },

  componentWillUnmount: function() {
    CoreStore.removeChangeListener(this.showCreateProject);
  },

  showCreateProject: function(input) {
    var modal = CoreStore.getShowProjectModal()
    
    if (input) {
      modal = input;
      CoreStore.projectModalVisibility = input;
    }
    
    if (modal === 'Languages') {
      this.setState({
        showModal: true,
        modalValue: modal,
        modalTitle: '',
        doneText: 'Load'
      });
    }
    else if (modal === "") {
      this.setState({
        showModal: false
      });
    }
  },

  hideModal: function() {
    this.getProjectStatus((result) => {
      if(result) {
        this.close();
      }
    });
  },

  close: function() {
    //CheckStore.getNameSpaces();
    CoreStore.projectModalVisibility = "";
    this.setState({
      showModal: false,
      FetchDataArray: []
    });
  },

  getProjectStatus: function(doneCallback) {
    var projectStatus = CoreStore.projectModalVisibility;
    var selectedModules = this.state.FetchDataArray;
    if (projectStatus != "Languages" || 
      (Object.keys(selectedModules) == [] && projectStatus == 'Check')) {
      	var Alert = {
      		title: "You are currently making a project",
      		content: "Are you sure you want to cancel?",
      		leftButtonText: "No",
      		rightButtonText: "Yes"
      	}
      api.createAlert(Alert, function(result){
      	if(result == 'Yes') {
          doneCallback(true);
      	}
      });
    } else {
      doneCallback(true);
    }
  },

  onClick: function () {
    var tempFetchDataArray = [];      //tempFetchDataArray to push checkmodule paths onto
    if (this.state.modalValue === 'Languages') {
      var _this = this;
      try {
        var manifestLocation = path.join(this.params.targetLanguagePath, 'manifest.json');
        fs.readJson(manifestLocation, function(err, parsedManifest){
          if (parsedManifest && parsedManifest.generator && parsedManifest.generator.name === 'ts-desktop') {
              var tcManifestLocation = path.join(_this.params.targetLanguagePath, 'tc-manifest.json');
              fs.readJson(tcManifestLocation, function(err, data) {
                if (err || !_this.isLocal) {
                   
                } 
                else {
                  Access.loadFromFilePath(_this.params.targetLanguagePath);
                  _this.close();
                }
              });
          } else {
              dialog.showErrorBox(DEFAULT_ERROR, INVALID_PROJECT);
          }
        });
      } catch(error) {
        dialog.showErrorBox(DEFAULT_ERROR, INVALID_PROJECT);
      }
    }
  },

  

  /**
   * @description - This will clear all the data from the current check, while still
   * keeping the old manifest file
   */
  clearOldData: function(){
    var manifest = api.getDataFromCommon('tcManifest');
    CoreActions.newProject();
    CheckStore.WIPE_ALL_DATA();
    api.modules = {};
    this.setSaveLocation(this.saveLocation);
    api.putDataInCommon('tcManifest', manifest);
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

  setTargetLanguageFilePath: function(path, link, local) {
    this.isLocal = local;
    this.saveLocation = path;
    this.params.targetLanguagePath = path;
    this.params.repo = link;
    this.onClick();
  },

  setBookName: function(abbr) {
    this.params.bookAbbr = abbr;
  },

  render: function() {
    return (
      <div>
        <Modal show={this.state.showModal} onHide={this.hideModal}>
          <UploadModal ref={"TargetLanguage"}
          <Modal.Footer>
            <ButtonToolbar>
              <Button bsSize="xsmall" style={{visibility: this.state.backButton}}>{'Back'}</Button>
              <Button type="button" onClick={this.onClick} style={{position:'fixed', right: 15, bottom:10}}>{this.state.doneText}</Button>
            </ButtonToolbar>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
});


  module.exports = ProjectModal;
