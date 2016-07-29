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
      backButton:'hidden',
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
      var _this = this;
      var manifestLocation = path.join(this.params.targetLanguagePath, 'manifest.json');
      FileModule.readFile(manifestLocation, function(data){
        var parsedManifest = JSON.parse(data);
        var bookTitle = parsedManifest.project.name.split(' ');
        var bookName = _this.getBookAbbr(parsedManifest.project.name);
        _this.setBookName(bookName);
        let bookFileName = bookTitle.join('') + '.json';

        var projectData = {
          local: true,
          target_language: _this.params.targetLanguagePath,
          original_language: ('data/ulgb/'),
          gateway_language: '',
          user: [{username: '', email: ''}],
          checkLocations: [],
          saveLocation: _this.saveLocation
        }
        var checkArray = api.getDataFromCommon('arrayOfChecks');
        projectData.checkLocations = checkArray;
        CheckDataGrabber.saveManifest(_this.saveLocation, projectData, parsedManifest);
      });
      if (tempFetchDataArray.length > 0) {
        // CoreActions.getFetchData(tempFetchDataArray);
        CheckDataGrabber.getFetchData(tempFetchDataArray, this.params);
      }
      this.close();
    }

    else if (this.state.modalValue === 'Languages') {
      CoreActions.showCreateProject("Create");
    }

    else if (this.state.modalValue == "Create") {
      if (this.refs.ProjectName) {
        if (!this.refs.ProjectName.allFieldsEntered()) {
          alert("Enter All Fields Before Continuing.");
          return;
        }
      }
      CoreActions.showCreateProject("Check");
    }

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
    api.putDataInCommon('saveLocation', data);
  },
  setTargetLanguageFilePath: function(path) {
    this.params.targetLanguagePath = path;
    this.onClick();
  },

  setBookName: function(abbr) {
    this.params.bookAbbr = abbr;
  },
  changeModalBody: function(modalBody) {
    if (modalBody == "Check") {
      return (<SelectChecks currentChecks={this.state.currentChecks} ref={"SelectChecks"} loadedChecks={this.state.loadedChecks} FetchDataArray={this.state.FetchDataArray}/>);
    } else if (modalBody == "Create") {
      return (<ProjectName projectName={this.state.projectName} ref={"ProjectName"} passBack={this.setSaveLocation}/>);
    } else if (modalBody === 'Languages') {
      return (<TargetLanguage ref={"TargetLanguage"} setTargetLanguageFilePath={this.setTargetLanguageFilePath} />);
    }
  },

  render: function() {
    return (
      <div>
        {this.state.modalValue}
        <ButtonToolbar>

        <Button bsSize="xsmall"
                style={{visibility: this.state.backButton}}>
                Back
        </Button>

        <Button type="button"
                onClick={this.onClick}
                style={{position:'fixed', right: 15, bottom:10}}>
          {this.state.doneText}
        </Button>

        </ButtonToolbar>
      </div>
    )}
  });

  module.exports = ProjectModal;
