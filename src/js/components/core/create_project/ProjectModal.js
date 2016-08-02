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
const Upload = require('../Upload');
const ManifestGenerator = require('../ProjectManifest');
const path = require('path');
const Access = require('../AccessProject.js');

const INVALID_PROJECT = 'This does not appear to be a translation studio project';
const DEFAULT_ERROR = 'Error';

const ProjectModal = React.createClass({

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

  render: function() {
    return (
      <div>
        <Modal show={this.state.showModal} onHide={this.hideModal}>
          <Upload ref={"TargetLanguage"} />
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
