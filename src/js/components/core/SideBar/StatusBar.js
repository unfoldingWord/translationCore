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
      newToolSelected: false,
    }
    this.currentCheckNamespace = this.currentCheckNamespace.bind(this);
    this.getSwitchCheckToolEvent = this.getSwitchCheckToolEvent.bind(this);
  }

  componentWillMount() {
    api.registerEventListener('changeCheckType', this.currentCheckNamespace);
    api.registerEventListener('newToolSelected', this.getSwitchCheckToolEvent);
  }

  componentWillUnmount() {
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
    }
    if(this.state.currentCheckNamespace !== ""){
      content = <div>
                  {bookName + " "}<Glyphicon glyph={"menu-right"}/>
                  {" " + currentTool + " "}
                </div>;
      this.setState({path: content});
    }
  }

  getSwitchCheckToolEvent(){
    this.setState({path: ""});
  }

  render(){
    return(
      <div style={style.StatusBar}>
          <OnlineStatus />
          <div style={{color: "#fff", float: "right", padding: "3px", marginRight: "50px"}}>
            {this.state.path}
          </div>
      </div>
      );
  }
}


module.exports = StatusBar;
