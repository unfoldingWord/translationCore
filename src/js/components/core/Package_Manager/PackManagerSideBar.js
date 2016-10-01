/******************************************************************************
 *@author: Manny Colon
 *@description: This component takes on props from PackageManagerView.js
 in order to display cards for each of the apps/packages found
*******************************************************************************/
const api = window.ModuleApi;
const React = api.React;
const ReactDOM = require("react-dom");
const ReactBootstrap = api.ReactBootstrap;
//const RB = api.ReactBootstrap;
//const {Glyphicon} = RB;
const style = require("./Style");
const SideBarButton = require("./SideBarButton");

class PackManagerSideBar extends React.Component{
  constructor() {
    super();
    this.state = {
    };
  }


  render(){
    return(
      <div style={style.sideBar}>
        <div onClick={this.props.hidePackManager} title="Go Back to Main Screen" style={{cursor: "pointer"}}>
          <img src="images/TC_Icon_logo.png" style={style.tcLogo}/>
          <span style={style.heading}> TranslationCore</span>
          <br /><br />
        </div>
        <SideBarButton value={" Packages"} title={"Access your Packages"} imageName={"images/greyPackage.svg"} hoverImage={"images/Package.svg"}/>
        <SideBarButton glyphicon={"plus"} value={" Install"} title={"Install/Download New Packages"}/>
        <SideBarButton glyphicon={"cloud-download"} value={" Updates"} title={"Update your Packages"}/>
      </div>
    );
  }
}
module.exports = PackManagerSideBar;
