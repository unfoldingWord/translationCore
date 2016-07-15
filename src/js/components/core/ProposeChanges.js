const React = require('react');
const FormGroup = require('react-bootstrap/lib/FormGroup.js');
const FormControl = require('react-bootstrap/lib/FormControl.js');
const Button = require('react-bootstrap/lib/Button.js');
const Panel = require('react-bootstrap/lib/Panel.js');

class ProposeChanges extends React.Component {
  constructor() {
    super();
    this.state = {
      open: false
    };
  }

  render() {
    return (
      <div style={{width:'35%'}}>
        <Button bsStyle="primary"
        onClick={ ()=> this.setState({ open: !this.state.open })} style={{width:'100%'}}>
          Propose changes
        </Button>
          <Panel collapsible expanded={this.state.open}>
            <FormGroup controlId="formControlsTextarea">
              <FormControl componentClass="textarea" placeholder="Please type in the changes you would like to propose" />
            </FormGroup>
            <Button bsStyle="primary" type="submit" style={{width:'100%'}}>
            Submit Propose Changes
            </Button>

          </Panel>
      </div>
    );
  }
}

module.exports = ProposeChanges;
