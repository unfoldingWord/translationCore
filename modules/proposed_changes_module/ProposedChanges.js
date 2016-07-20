  const React = require('react');

const FormGroup = require('react-bootstrap/lib/FormGroup.js');
const Button = require('react-bootstrap/lib/Button.js');
const Panel = require('react-bootstrap/lib/Panel.js');

const api = window.ModuleApi;
//ProposedChanges is in the store
const NAMESPACE = 'ProposedChanges';

class ProposedChanges extends React.Component {
  constructor() {
    super();
    this.state = {
      open: false,
      chapter: 0,
      verse: 0
    };
  }

  componentWillMount() {
    api.registerAction('proposedChangesUpdateText', this.actionHandleChange.bind(this));
    api.registerEventListener("updateTargetLanguage", this.updateTargetLanguage.bind(this));
    api.registerEventListener("goToVerse", this.updateCheck.bind(this));
  }

  actionHandleChange(proposedChangesData, action) {
    proposedChangesData.currentChanges = action.value;
  }

  componentWillUnmount(){
    api.removeEventListener("updateTargetLanguage", this.updateTargetLanguage.bind(this));
    api.removeEventListener("goToVerse", this.updateCheck.bind(this));
  }


  updateCheck(params) {
    this.setState({chapter: params.chapterNumber, verse: params.verseNumber});
  }

  handleChange(e){
    this.value = e.target.value;
    console.log(this.value);
    //type and field are required
    //the object below is passed as an argument to actionhandlechange()
    api.sendAction({type: 'proposedChangesUpdateText', field: NAMESPACE, value: this.value});
  }

  updateTargetLanguage() {
        let targetLanguage = api.getDataFromCommon("targetLanguage");
        if (targetLanguage) {
            this.setState({
                targetLanguage: targetLanguage
            });
        }
        else {
            console.error(TARGET_LANGUAGE_ERROR);
        }
    }
  render() {
    return (
      <div style={{width:'50%'}}>
        <Button bsStyle="primary"
        onClick={ ()=> this.setState({ open: !this.state.open })} style={{width:'100%'}}>
          Propose changes
        </Button>
          <Panel collapsible expanded={this.state.open}>
            <form className="comment-form">
            <h5>{[this.state.chapter][this.state.verse]}</h5>
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
