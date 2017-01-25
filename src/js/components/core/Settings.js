/**
 * @author Ian Hoegen
 * @description: This is the modal for the drag and drop upload feature.
 ******************************************************************************/
const React = require('react');

const CoreStore = require('../../stores/CoreStore.js');
const Button = require('react-bootstrap/lib/Button.js');
const Modal = require('react-bootstrap/lib/Modal.js');
const FormGroup = require('react-bootstrap/lib/FormGroup.js');
const ControlLabel = require('react-bootstrap/lib/ControlLabel.js');
const FormControl = require('react-bootstrap/lib/FormControl.js');

class Settings extends React.Component {
  render() {
    return (
      <div style={{paddingTop: '65px', width: '40%', marginLeft: 'auto', marginRight: 'auto'}}>
        <FormGroup controlId="tutorialView">
          <ControlLabel>Tutorial</ControlLabel>
          <FormControl componentClass="select" placeholder="select" name="tutorialView"
            style={{marginBottom: '25px'}}
            defaultValue={this.props.currentSettings.tutorialView} onChange={this.props.onSettingsChange}>
            <option value="show">Show</option>
            <option value="hide">Hide</option>
          </FormControl>
        </FormGroup>
        <FormGroup controlId="textSelect">
          <ControlLabel>Text Select Method</ControlLabel>
          <FormControl componentClass="select" placeholder="select" name="textSelect"
            style={{marginBottom: '25px'}}
            defaultValue={this.props.currentSettings.textSelect} onChange={this.props.onSettingsChange}>
            <option value="drag">Drag to select</option>
            <option value="click">Click to select</option>
          </FormControl>
        </FormGroup>
        <FormGroup controlId="developerMode">
          <ControlLabel>Enable Developer Mode</ControlLabel>
          <FormControl componentClass="select" placeholder="select" name="developerMode"
            style={{marginBottom: '25px'}}
            defaultValue={this.props.currentSettings.developerMode} onChange={this.props.onSettingsChange}>
            <option value="disable">Disabled</option>
            <option value="enable">Enabled</option>
          </FormControl>
        </FormGroup>
      </div>
    );
  }
};

module.exports = Settings;
