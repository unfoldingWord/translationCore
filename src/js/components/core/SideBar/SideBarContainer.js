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
      direction: false,
      menuHeaders: true,
      currentToolNamespace: null,
    }
    this.getCurrentToolNamespace = this.getCurrentToolNamespace.bind(this);
  }

  componentWillMount() {
    api.registerEventListener('goToNext', this.getCurrentToolNamespace);
    api.registerEventListener('goToPrevious', this.getCurrentToolNamespace);
    api.registerEventListener('goToCheck', this.getCurrentToolNamespace);
    api.registerEventListener('changeCheckType', this.getCurrentToolNamespace);
  }

  componentWillUnmount() {
    api.removeEventListener('goToNext', this.getCurrentToolNamespace);
    api.removeEventListener('goToPrevious', this.getCurrentToolNamespace);
    api.removeEventListener('goToCheck', this.getCurrentToolNamespace);
    api.removeEventListener('changeCheckType', this.getCurrentToolNamespace);
  }

  getCurrentToolNamespace(){
    let currentToolNamespace = CoreStore.getCurrentCheckNamespace();
    api.initialCurrentGroupName();
    this.setState({currentToolNamespace: currentToolNamespace})
  }


  changeView(){
    this.setState({SideNavBar: !this.state.SideNavBar});
    this.setState({direction: !this.state.direction});
  }

  render(){
    let sideBarContent;
    if(this.state.SideNavBar){
      sideBarContent = <div><Chevron direction={this.state.direction}/>
                       <br /><SideNavBar /></div>;
    }else if (this.state.menuHeaders) {
      sideBarContent = <div><Chevron direction={this.state.direction}/>
                       <br /><MenuHeaders currentTool={this.state.currentToolNamespace}/></div>;
    }else {
      sideBarContent = <Chevron direction={this.state.direction}/>;
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
