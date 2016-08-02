const fs = require(window.__base + 'node_modules/fs-extra');
const React = require('react');
const Modal = require('react-bootstrap/lib/Modal.js');
const Button = require('react-bootstrap/lib/Button.js');
const ButtonToolbar = require('react-bootstrap/lib/ButtonToolbar.js');
const CoreStore = require('../../../stores/CoreStore.js');
const {dialog} = window.electron.remote;
const api = window.ModuleApi;
const booksOfBible = require('../BooksOfBible');
const Upload = require('../Upload');

const INVALID_PROJECT = 'This does not seem to be a translation studio project';
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
    };
  },

  componentWillMount: function() {
    CoreStore.addChangeListener(this.showCreateProject);      // action to show create project modal
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
    } else if (modal === "") {
      this.setState({
        showModal: false
      });
    }
  },

  close: function() {
// CheckStore.getNameSpaces();
    CoreStore.projectModalVisibility = "";
    this.setState({
      showModal: false,
    });
  },

  onClick: function(e) {
    api.emitEvent('changeCheckType', {currentCheckNamespace: null});
    this.close();
  },

  render: function() {
    return (
      <div>
        <Modal show={this.state.showModal} onHide={this.close}>
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