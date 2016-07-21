
const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;
const Well = ReactBootstrap.Well;
const FormGroup = ReactBootstrap.FormGroup;
const Button = ReactBootstrap.Button;
const Panel = ReactBootstrap.Panel;

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
  this.actionHandleChange = this.actionHandleChange.bind(this);
  this.updateTargetLanguage = this.updateTargetLanguage.bind(this);
  this.updateCheck = this.updateCheck.bind(this);
  }

  componentWillMount() {
    api.registerAction('proposedChangesUpdateText', this.actionHandleChange);
    api.registerEventListener("updateTargetLanguage", this.updateTargetLanguage);
    api.registerEventListener("goToVerse", this.updateCheck);
  }

  actionHandleChange(proposedChangesData, action) {
    proposedChangesData.currentChanges = action.value;
  }

  componentWillUnmount(){
    api.removeAction('proposedChangesUpdateText', this.actionHandleChange)
    api.removeEventListener("updateTargetLanguage", this.updateTargetLanguage);
    api.removeEventListener("goToVerse", this.updateCheck);
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
/*
  clearTextBox(){
    setState({});
  }*/

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
    let targetLanguage = api.getDataFromCommon('targetLanguage');
    let currentVerse = null;
    if(targetLanguage && this.state.chapter && this.state.verse){
      currentVerse = targetLanguage[this.state.chapter][this.state.verse];
    }

    return (
      <div style={{width:'100%'}}>
        <Button bsStyle="primary"
        onClick={ ()=> this.setState({ open: !this.state.open })} style={{width:'100%'}}>
          Propose changes
        </Button>
          <Panel collapsible expanded={this.state.open}>
            <form className="comment-form">
            <Well>{currentVerse}</Well>
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
