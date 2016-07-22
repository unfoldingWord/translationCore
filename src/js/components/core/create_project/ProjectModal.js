const fs = require(window.__base + 'node_modules/fs-extra');
const React = require('react');
const Modal = require('react-bootstrap/lib/Modal.js');
const FormGroup = require('react-bootstrap/lib/FormGroup.js');
const ControlLabel = require('react-bootstrap/lib/ControlLabel.js');
const FormControl = require('react-bootstrap/lib/FormControl.js');
const Button = require('react-bootstrap/lib/Button.js');
const ButtonGroup = require('react-bootstrap/lib/ButtonGroup.js');
const ButtonToolbar = require('react-bootstrap/lib/ButtonToolbar.js');
const Checkbox = require('react-bootstrap/lib/Checkbox.js');
const CoreStore = require('../../../stores/CoreStore.js');
const CheckStore = require('../../../stores/CheckStore');
const CoreActions = require('../../../actions/CoreActions.js');
const {dialog} = window.electron.remote;
const FileModule= require('../FileModule');
const ENTER = 13;
const api = window.ModuleApi;
const booksOfBible = require('../booksOfBible');
const TargetLanguage = require('../UploadModal');
const SelectChecks = require('./SelectChecks');
const ProjectName = require('./ProjectName');
const path = require('path');
const CheckDataGrabber = require('./CheckDataGrabber');

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
      FetchDataArray:[]     //FetchDataArray of checkmodule
    };
  },

  componentWillMount: function() {
    CoreStore.addChangeListener(this.showCreateProject);      //action to show create project modal
  },
  showCreateProject: function() {
    var modal = CoreStore.getShowProjectModal()
    if (modal === "Create") {
      this.setState({
        showModal: true,
        modalValue: modal
      });
    } else if(modal === "Check") {
      this.setState({
        showModal: true,
        modalValue: modal
      });
    } else if (modal === 'Languages') {
      this.setState({
        showModal: true,
        modalValue: modal,
        modalTitle: '',
        doneText: 'Create'
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
      if (tempFetchDataArray.length > 0) {
        // CoreActions.getFetchData(tempFetchDataArray);
        CheckDataGrabber.getFetchData(tempFetchDataArray, this.params);
      }
      var _this = this;
      var manifestLocation = path.join(this.params.targetLanguagePath, 'manifest.json');
      FileModule.readFile(manifestLocation, function(data){
        var parsedManifest = JSON.parse(data);
        var bookTitle = parsedManifest.project.name.split(' ');
        let bookFileName = bookTitle.join('') + '.json';

        var projectData = {
          local: true,
          target_language: _this.params.targetLanguagePath,
          original_language: ('data/ulgb/' + bookFileName),
          gateway_language: '',
          user: [{username: 'ihoegen', email: 'ianhoegen@gmail.com'}],
          checkLocations: [{name: 'lexical', location: 'C://Test'}]
        }
        CheckDataGrabber.saveManifest(_this.saveLocation, projectData, parsedManifest);
        _this.close();
      });
    }
    else if (this.state.modalValue == "Create") {
      CoreActions.showCreateProject("Check");
      if (this.refs.ProjectName) {
        this.params.bookAbbr = this.refs.ProjectName.getBookName();
      }
    } else if (this.state.modalValue === 'Languages') {
      CoreActions.showCreateProject("Create");
    }
  },
  setSaveLocation: function(data) {
    this.saveLocation = data;
    api.putDataInCommon('saveLocation', data);
  },
  setTargetLanguageFilePath: function(path) {
    this.params.targetLanguagePath = path;
  },

  setBookName: function(abbr) {
    this.params.bookAbbr = abbr;
  },
  changeModalBody: function(modalBody) {
    if (modalBody == "Check") {
      return (<SelectChecks currentChecks={this.state.currentChecks} loadedChecks={this.state.loadedChecks} FetchDataArray={this.state.FetchDataArray}/>);
    } else if (modalBody == "Create") {
      return (<ProjectName projectName={this.state.projectName} ref={"ProjectName"} passBack={this.setSaveLocation}/>);
    } else if (modalBody === 'Languages') {
      return (<TargetLanguage setTargetLanguageFilePath={this.setTargetLanguageFilePath} />);
    }
  },

  render: function() {
    return (
      <div>
      <Modal show={this.state.showModal} onHide={this.close}>
      {this.changeModalBody(this.state.modalValue)}
      <Modal.Footer>
      <Button type="button" onClick={this.onClick}>{this.state.doneText}</Button>
      </Modal.Footer>
      </Modal>
      </div>
    )}
  });

  module.exports = ProjectModal;
