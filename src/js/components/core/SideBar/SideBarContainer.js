const api = window.ModuleApi;
const React = api.React;
const CoreStore = require('../../../stores/CoreStore.js');
const SideNavBar = require('./SideNavBar');
const Chevron = require('./Chevron');
const style = require("./Style");
const MenuHeaders = require('../navigation_menu/MenuHeaders');


class SideBarContainer extends React.Component{
  constructor(){
    super();
    this.state ={
      SideNavBar: false,
      menuHeaders: true,
      currentToolNamespace: null,
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
    this.setState({currentToolNamespace: currentToolNamespace})
  }

  changeView(){
    this.setState({SideNavBar: !this.state.SideNavBar});
  }

  render(){
    let sideBarContent;
    if(this.state.SideNavBar){
      sideBarContent = <div><SideNavBar /><br />
                            <div style={{bottom: "0px", position: "absolute"}}>
                            <Chevron color="magenta"/><br />
                            <Chevron color="blue"/>
                            </div>
                       </div>;
    }else if (this.state.menuHeaders) {
      sideBarContent = <div>
                          <Chevron color="magenta"/><br />
                          <Chevron color="blue"/>
                          <MenuHeaders currentTool={this.state.currentToolNamespace}/>
                       </div>;
    }else {
      sideBarContent = <div>
                          <Chevron color="magenta"/><br />
                          <Chevron color="blue"/>
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
