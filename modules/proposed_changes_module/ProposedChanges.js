
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
    this.updateTargetLanguage = this.updateTargetLanguage.bind(this);
    this.updateCheck = this.updateCheck.bind(this);
  }

  componentWillMount() {
    api.registerEventListener("updateTargetLanguage", this.updateTargetLanguage);
    api.registerEventListener("goToVerse", this.updateCheck);
  }

  componentWillUnmount(){
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

  handleChange(e) {
    this.value = e.target.value;
    this.setState({currentVerse: this.value});
  }

  handleSubmit(event){
    this.setState({ open: !this.state.open });
    api.getDataFromCheckStore(NAMESPACE)['currentChanges'] = this.state.currentVerse;
    let user = api.getLoggedInUser();
console.log(user);
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
      <div style={style.width}>
        <Button bsStyle="primary"
        onClick={ ()=> this.setState({ open: !this.state.open })} style={style.width}>
          Propose changes
        </Button>
        <Panel collapsible expanded={this.state.open} style={style.panelBackgroundColor}>
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
          style={style.width}>Submit</Button>
        </Panel>
      </div>
    );
  }
}

module.exports = ProposedChanges;
