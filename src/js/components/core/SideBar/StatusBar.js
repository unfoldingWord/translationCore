const api = window.ModuleApi;
const React = api.React;
const RB = api.ReactBootstrap;
const {Glyphicon} = RB;
const CoreStore = require('../../../stores/CoreStore.js');
const style = require("./Style");
const OnlineStatus = require("./OnlineStatus");

class StatusBar extends React.Component{
  constructor(){
    super();
    this.state ={
      path: "",
      currentCheckNamespace: "",
      currentWordOrPhrase: "",
      newToolSelected: false,
    }
    this.getCurrentCheck = this.getCurrentCheck.bind(this);
    this.currentCheckNamespace = this.currentCheckNamespace.bind(this);
    this.getSwitchCheckToolEvent = this.getSwitchCheckToolEvent.bind(this);
  }

  componentWillMount() {
    api.registerEventListener('goToNext', this.getCurrentCheck);
    api.registerEventListener('goToPrevious', this.getCurrentCheck);
    api.registerEventListener('goToCheck', this.getCurrentCheck);
    api.registerEventListener('changeCheckType', this.currentCheckNamespace);
    api.registerEventListener('newToolSelected', this.getSwitchCheckToolEvent);
  }

  componentWillUnmount() {
    api.removeEventListener('goToNext', this.getCurrentCheck);
    api.removeEventListener('goToPrevious', this.getCurrentCheck);
    api.removeEventListener('goToCheck', this.getCurrentCheck);
    api.removeEventListener('changeCheckType', this.currentCheckNamespace);
    api.removeEventListener('newToolSelected', this.getSwitchCheckToolEvent);
  }

  currentCheckNamespace(){
    let bookName = "";
    let content = "";

    let manifest = ModuleApi.getDataFromCommon("tcManifest");
    if (manifest && manifest.ts_project){
      bookName = manifest.ts_project.name;
    }
    let currentTool = CoreStore.getCurrentCheckNamespace();
    if(currentTool){
      this.setState({currentCheckNamespace: currentTool});
      this.getCurrentCheck();
      console.log(this.state.currentCheckNamespace);
    }
    if(this.state.currentCheckNamespace !== ""){
      content = <div>
                  {bookName + " "}<Glyphicon glyph={"menu-right"}/>
                  {" " + currentTool + " "}<Glyphicon glyph={"menu-right"}/>
                  {" " + this.state.currentWordOrPhrase + " "}
                </div>;
      this.setState({path: content});
    }
  }

  getCurrentCheck(){
    var groups = null;
    if(this.state.currentCheckNamespace !== ""){
      groups = api.getDataFromCheckStore(this.state.currentCheckNamespace, 'groups');
    }
    console.log(groups);
  if(groups){
    console.log("it is doing it..");
    var currentGroupIndex = api.getDataFromCheckStore(this.state.currentCheckNamespace, 'currentGroupIndex');
    console.log(currentGroupIndex);
    var currentCheckIndex = api.getDataFromCheckStore(this.state.currentCheckNamespace, 'currentCheckIndex');
    console.log(currentCheckIndex);
    var currentCheck = groups[currentGroupIndex]['checks'][currentCheckIndex];
    if(this.state.currentCheckNamespace === "TranslationWordsChecker"){
      this.setState({currentWordOrPhrase: currentCheck.word});
    }else if (this.state.currentCheckNamespace === "TranslationNotesChecker") {
      this.setState({currentWordOrPhrase: currentCheck.group});
    }else {
      console.error("currentCheckNamespace is undefined in CoreStore");
    }
    console.log(currentCheck);
  }
  }

  getSwitchCheckToolEvent(){
    this.setState({path: ""});
  }

  render(){
    return(
      <div style={style.StatusBar} onClick={this.getCurrentCheck.bind(this)}>
          <OnlineStatus />
          <div style={{color: "#fff", float: "right", padding: "3px", marginRight: "50px"}}>
            {this.state.path}
          </div>
      </div>
      );
  }
}


module.exports = StatusBar;
