const React = require('react');
const FormGroup = require('react-bootstrap/lib/FormGroup.js');
const FormControl = require('react-bootstrap/lib/FormControl.js');
const Button = require('react-bootstrap/lib/Button.js');
const Modal = require('react-bootstrap/lib/Modal.js');
const ControlLabel = require('react-bootstrap/lib/ControlLabel.js');
const ButtonToolbar = require('react-bootstrap/lib/ButtonToolbar.js');
const remote = window.electron.remote;
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
    if (e.charCode == ENTER) {
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
        _this.setState({saveLocation: path.join(filename[0], _this.state.projectname)});
        _this.props.passBack(path.join(filename[0], _this.state.projectname));
      }

    });
  },
  render: function() {
    return (
      <div>
      <Modal.Header>
      <Modal.Title>{this.props.modalTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
      <FormGroup>
      <ControlLabel>Enter Project Name</ControlLabel>
      <FormControl type="text" placeholder={"John Wycliffe"} onChange={this.setprojectname} />
      </FormGroup>
      <div>
      <Button onClick={this.sendBackSaveLocation}>Choose Save Location</Button>
      <ControlLabel>{this.state.saveLocation}</ControlLabel>

      </div>
      </Modal.Body>
      </div>
    )}
  });
  module.exports = projectname;
