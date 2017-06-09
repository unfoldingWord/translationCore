/**
 * @author Ian Hoegen
 * @description: This is the modal for the drag and drop upload feature.
 ******************************************************************************/
const React = require('react');
const Modal = require('react-bootstrap/lib/Modal.js');
const FormGroup = require('react-bootstrap/lib/FormGroup.js');
const ControlLabel = require('react-bootstrap/lib/ControlLabel.js');
const FormControl = require('react-bootstrap/lib/FormControl.js');

class Settings extends React.Component {
  settingsChange(e){
    let options = e.target.value;
    let name = e.target.name;
    if(options === 'true' || options === 'false'){
      if(options == "true"){
        options = true;
      }else if (options == "false") {
        options = false;
      }else{
        console.error("optionString is not equal to 'true' or 'false'");
      }
    }
    this.props.onSettingsChange(name, options);
  }
  render() {
    let { currentSettings } = this.props;
    let textSelect = currentSettings.textSelect ? currentSettings.textSelect : 'click';
    let tutorialView = currentSettings.showTutorial ? currentSettings.showTutorial.toString() : 'false';
    let developerMode = currentSettings.developerMode ? currentSettings.developerMode.toString() : "false";
    return (
      <div style={{paddingTop: '65px', width: '40%', marginLeft: 'auto', marginRight: 'auto'}}>
        <FormGroup controlId="tutorialView">
          <ControlLabel>Tutorial</ControlLabel>
          <FormControl componentClass="select" placeholder="select" name="showTutorial"
            style={{marginBottom: '25px'}}
            defaultValue={tutorialView} onChange={this.settingsChange.bind(this)}>
            <option value="true">Show</option>
            <option value="false">Hide</option>
          </FormControl>
        </FormGroup>
        <FormGroup controlId="textSelect">
          <ControlLabel>Text Select Method</ControlLabel>
          <FormControl componentClass="select" placeholder="select" name="textSelect"
            style={{marginBottom: '25px'}}
            defaultValue={textSelect} onChange={this.settingsChange.bind(this)}>
            <option value="drag">Drag to select</option>
            <option value="click">Click to select</option>
          </FormControl>
        </FormGroup>
        <FormGroup controlId="developerMode">
          <ControlLabel>Enable Developer Mode</ControlLabel>
          <FormControl componentClass="select" placeholder="select" name="developerMode"
            style={{marginBottom: '25px'}}
            defaultValue={developerMode} onChange={this.settingsChange.bind(this)}>
            <option value="false">Disabled</option>
            <option value="true">Enabled</option>
          </FormControl>
        </FormGroup>
      </div>
    );
  }
};

module.exports = Settings;
