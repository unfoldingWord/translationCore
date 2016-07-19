const React = require('react');
const FormGroup = require('react-bootstrap/lib/FormGroup.js');
const FormControl = require('react-bootstrap/lib/FormControl.js');
const Button = require('react-bootstrap/lib/Button.js');
const Panel = require('react-bootstrap/lib/Panel.js');
const CheckActions = require('../../../actions/CheckActions.js');

const api = window.ModuleApi;
//ProposedChanges is in the store
const NAMESPACE = 'ProposedChanges';

class ProposedChanges extends React.Component {
  constructor() {
    super();
    var targetLanguage = api.getDataFromCommon('targetLanguage');
    this.state = {
      open: false,
      "targetLanguage": !targetLanguage ? "" : targetLanguage,
    };
  }

  componentWillMount() {
    api.registerAction('proposedChangesUpdateText', this.actionHandleChange.bind(this));
    api.registerEventListener("updateTargetLanguage", this.updateTargetLanguage.bind(this));
  }

  actionHandleChange() {
    api.putDataInCheckStore(NAMESPACE, 'currentChangedText', this.value);
    api.removeEventListener("updateTargetLanguage", this.updateTargetLanguage.bind(this));
  }

  handleChange(e){
    this.value = e.target.value;
    console.log(proposedChange);
    api.sendAction('proposedChangesUpdateText');
  }

  updateTargetLanguage() {
        var targetLanguage = api.getDataFromCommon("targetLanguage");
        if (targetLanguage) {
            this.setState({
                targetLanguage: targetLanguage
            });
        }
        else {
            console.error(TARGET_LANGUAGE_ERROR);
        }
    }
  /*
  handleChange(e){
    let proposedChange = e.target.value;
    console.log(proposedChange);
    CheckActions.changeCheckProperty("proposedChange", proposedChange.value);
  }*/
  render() {
    return (
      <div style={{width:'50%'}}>
        <Button bsStyle="primary"
        onClick={ ()=> this.setState({ open: !this.state.open })} style={{width:'100%'}}>
          Propose changes
        </Button>
          <Panel collapsible expanded={this.state.open}>
            <form className="comment-form">
            <h3>Hey text here lol</h3>
            <FormGroup controlId="formControlsTextarea">
              <textarea style={{width:'100%', borderRadius:'4px', borderColor:'#D3D3D3'}}
              placeholder="Please type in the changes you would like to propose"
               value={this.props.text}
               onChange={this.handleChange.bind(this)}></textarea>
            </FormGroup>
            </form>
          </Panel>
      </div>
    );
  }
}

module.exports = ProposedChanges;
