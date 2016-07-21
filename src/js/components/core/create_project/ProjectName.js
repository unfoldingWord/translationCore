const React = require('react');
const FormGroup = require('react-bootstrap/lib/FormGroup.js');
const FormControl = require('react-bootstrap/lib/FormControl.js');
const Button = require('react-bootstrap/lib/Button.js');
const Modal = require('react-bootstrap/lib/Modal.js');
const ControlLabel = require('react-bootstrap/lib/ControlLabel.js');
const ButtonToolbar = require('react-bootstrap/lib/ButtonToolbar.js');
const remote = window.electron.remote;
const ENTER = 13;
const {dialog} = remote;

const ProjectName = React.createClass({
  getInitialState: function() {
    return {
      projectName:this.props.projectName
    }
  },
  setProjectName: function (e) {
    this.setState({
      projectname: e.target.value
    });
    if (e.charCode == ENTER) {
    }
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
      <FormControl type="text" placeholder={"John 1 Jay Scott"} onKeyPress={this.setProjectName} setProjectName={this.props.setProjectName}/>
      </FormGroup>
      </Modal.Body>
      </div>
    )}
});
module.exports = ProjectName;
