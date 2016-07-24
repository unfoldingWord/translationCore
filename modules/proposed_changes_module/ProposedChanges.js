
const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;
const Button = ReactBootstrap.Button;
const Panel = ReactBootstrap.Panel;
const style = require('./style');

const NAMESPACE = 'ProposedChanges';

class ProposedChanges extends React.Component {
  constructor() {
    super();
    this.state = {
      open: false,
      currentVerse: ""
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
    api.removeAction('proposedChangesUpdateText', this.actionHandleChange);
    api.removeEventListener("updateTargetLanguage", this.updateTargetLanguage);
    api.removeEventListener("goToVerse", this.updateCheck);
  }

  updateCheck(params) {
    let targetLanguage = api.getDataFromCommon('targetLanguage');
    let currentVerse = "";
      if(targetLanguage && params.chapterNumber && params.verseNumber){
        currentVerse = targetLanguage[params.chapterNumber][params.verseNumber];
        this.setState({currentVerse: currentVerse});
      }
  }

  handleChange(e){

    this.value = e.target.value;
    this.setState({currentVerse: this.value});

  }

  handleSubmit(event){
    this.setState({ open: !this.state.open });
    api.sendAction({type: 'proposedChangesUpdateText', field: NAMESPACE, value: this.state.currentVerse});
    console.log(this.state.currentVerse);
  }

  updateTargetLanguage() {
        let targetLanguage = api.getDataFromCommon("targetLanguage");
        if (targetLanguage) {
            this.setState({targetLanguage: targetLanguage});
        }
        else {
            console.error(TARGET_LANGUAGE_ERROR);
        }
    }
  render() {
    return (
      <div style={{width:'100%'}}>
        <Button bsStyle="primary"
        onClick={ ()=> this.setState({ open: !this.state.open })} style={{width:'100%'}}>
          Propose changes
        </Button>
          <Panel collapsible expanded={this.state.open} style={{backgroundColor: "#D3D3D3"}}>
            <div style={style.background}>
              <div style={style.paper}>
                <div style={style.sideline}></div>
                  <div style={style.paperContent}>
                    <textarea autofocus style={style.textarea} value={this.state.currentVerse}
                    onChange={this.handleChange.bind(this)} />
                  </div>
              </div>
            </div>
            <Button bsStyle="success" onClick={this.handleSubmit.bind(this)}
            style={{width:'100%'}}>Submit</Button>
          </Panel>
      </div>
    );
  }
}

module.exports = ProposedChanges;
