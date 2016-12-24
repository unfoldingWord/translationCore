const api = window.ModuleApi;
const React = api.React;
const CoreStore = require('../../../stores/CoreStore.js');
const CoreActions = require('../../../actions/CoreActions.js');
const SideNavBar = require('./SideNavBar');
const Chevron = require('./Chevron');
const style = require("./Style");
const MenuHeaders = require('../navigation_menu/MenuHeaders');


class SideBarContainer extends React.Component{
  constructor(){
    super();
    this.state ={
      SideNavBar: false,
      currentToolNamespace: null,
      imgPath: null,
    }
    this.getCurrentToolNamespace = this.getCurrentToolNamespace.bind(this);
  }

  componentWillMount() {
    api.registerEventListener('changeCheckType', this.getCurrentToolNamespace);
  }

  componentWillUnmount() {
    api.removeEventListener('changeCheckType', this.getCurrentToolNamespace);
  }

  getCurrentToolNamespace(){
    let currentToolNamespace = CoreStore.getCurrentCheckNamespace();
    api.initialCurrentGroupName();
    this.setState({currentToolNamespace: currentToolNamespace});
    this.getToolIcon(currentToolNamespace);
  }

  getToolIcon(currentToolNamespace){
    let iconPathName = null;
    let currentToolMetadata = null;
    let toolsMetadata = api.getToolMetaDataFromStore();
    if(toolsMetadata){
      currentToolMetadata = toolsMetadata.find(
        (tool) => tool.name === currentToolNamespace
      );
    }
    if(currentToolMetadata){
      let iconPathName = currentToolMetadata.imagePath;
      this.setState({imgPath: iconPathName});
    }
  }

  changeView(){
    this.setState({SideNavBar: !this.state.SideNavBar});
  }

  handleOpenProject(){
    CoreActions.showCreateProject("Languages");
  }

  handleSelectTool(){
    if (api.getDataFromCommon('saveLocation') && api.getDataFromCommon('tcManifest')) {
      CoreActions.updateCheckModal(true);
    } else {
      api.Toast.info('Open a project first, then try again', '', 3);
      CoreActions.showCreateProject("Languages");
    }
  }

  render(){
    let sideBarContent;
    if(this.state.SideNavBar || this.props.initShow){
      sideBarContent = <div>
                          <SideNavBar /><br />
                          <div style={{bottom: "0px", position: "absolute"}}>
                            <Chevron color="magenta" glyphicon={"folder-open"}
                                     textValue={"Load"}
                                     handleClick={this.handleOpenProject.bind(this)}/>
                            <Chevron color="blue" glyphicon={"wrench"}
                                     textValue={"Tools"}
                                     imagePath={this.state.imgPath}
                                     handleClick={this.handleSelectTool.bind(this)}/>
                          </div>
                       </div>;
    }else{
      sideBarContent = <div>
                          <Chevron color="magenta" glyphicon={"folder-open"}
                                   textValue={"Load"}
                                   handleClick={this.handleOpenProject.bind(this)}/>
                          <Chevron color="blue" glyphicon={"wrench"}
                                   textValue={"Tools"}
                                   imagePath={this.state.imgPath}
                                   handleClick={this.handleSelectTool.bind(this)}/>
                          <MenuHeaders currentTool={this.state.currentToolNamespace}/>
                       </div>;
    }
    return(
      <div style={style.sideBarcontainer}>
        <img src="images/TC_Icon_logo.png" onClick={this.changeView.bind(this)}
             style={style.logo}/>
        {sideBarContent}
      </div>
    );
  }

}

module.exports = SideBarContainer;
