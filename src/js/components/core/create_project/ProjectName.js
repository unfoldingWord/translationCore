const React = require('react');
const FormGroup = require('react-bootstrap/lib/FormGroup.js');
const FormControl = require('react-bootstrap/lib/FormControl.js');
const Button = require('react-bootstrap/lib/Button.js');
const Modal = require('react-bootstrap/lib/Modal.js');
const ControlLabel = require('react-bootstrap/lib/ControlLabel.js');
const ButtonToolbar = require('react-bootstrap/lib/ButtonToolbar.js');
const remote = window.electron.remote;
const CoreActions = require('../../../actions/CoreActions.js');
const CoreStore = require('../../../stores/CoreStore.js');
const ENTER = 13;
const path = require('path');
const {dialog} = remote;

const bookMap = require('../BooksOfBible');

const projectname = React.createClass({
  getInitialState: function() {
    return {
      projectname:this.props.projectname,
      saveLocation: null
    }
  },
  allFieldsEntered: function() {
    if(!this.state.projectname || !this.state.saveLocation) {
      return false;
    } else {
      return true;
    }
  },
  setprojectname: function (e) {
    var newName = e.target.value;
    this.setState({
      projectname: newName
    });
    this.projectName = newName;
    if (this.filePath) {
      var joined = path.join(this.filePath, newName);
      this.setState({saveLocation: joined});
      this.saveLocation = joined;
    }
    if (e.charCode == ENTER) {
    }
  },
  checkInput: function() {
    var validator = /[^a-zA-Z0-9-_\.]/g
    var text = this.state.projectname;
    if (text) {
      if (text.length >0) {
        return validator.test(text) ? 'error' : 'success';
      }
    }
  },
  sendBackSaveLocation: function() {
    var _this = this;
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }, function(filename) {
      if (filename !== undefined) {
        // FileImport(filename[0]);
        if (!_this.state.projectname){
          alert("Enter Project Name.");
          return;
        }
        _this.filePath = filename[0];
        var joined = path.join(filename[0], _this.state.projectname);
        _this.setState({saveLocation: joined});
        _this.saveLocation = joined;
      }

    });
  },
  getCheckBox: function(e) {
    this.createGogs = e.target.checked;
    if (!CoreStore.getLoggedInUser()) {
      CoreActions.updateLoginModal(true);
    }
  },
  render: function() {
    return (
      <div>
      <Modal.Header>
      <Modal.Title>{this.props.modalTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
      <FormGroup validationState={this.checkInput()}>
      <ControlLabel>Enter Project Name</ControlLabel>
      <FormControl type="text" placeholder={"John-Wycliffe"} onChange={this.setprojectname} />
      <FormControl.Feedback />
      </FormGroup>
      <label><input type="checkbox" onClick={this.getCheckBox}/>Create project on Door43?</label>
      <div>
      <br />
      <Button onClick={this.sendBackSaveLocation}>Choose Save Location</Button>
      <ControlLabel>{this.state.saveLocation}</ControlLabel>
      <br />


      </div>
      </Modal.Body>
      </div>
    )}
  });
  module.exports = projectname;
