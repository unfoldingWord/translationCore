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

  displayInstalledPackages(){
    api.emitEvent('cardDisplayStatus', {'displayStatus': 'installedPack'});
  }

  displayDownloadPackages(){
    api.emitEvent('cardDisplayStatus', {'displayStatus': 'downloadPack'});
  }

  displayUpdatePackages(){
    api.emitEvent('cardDisplayStatus', {'displayStatus': 'updatePack'});
  }

  render(){
    return(
      <div style={style.sideBar}>
        <div onClick={this.props.hidePackManager} title="Go Back to Main Screen" style={{cursor: "pointer"}}>
          <img src="images/TC_Icon_logo.png" style={style.tcLogo}/>
          <span style={style.heading}> TranslationCore</span>
          <br /><br />
        </div>
        <SideBarButton value={" Packages"} title={"Access your Packages"}
                        imageName={"images/greyPackage.svg"} hoverImage={"images/Package.svg"}
                        handleButtonClick={this.displayInstalledPackages.bind(this)}  />
        <SideBarButton glyphicon={"plus"} value={" Install"} title={"Install/Download New Packages"}
                      handleButtonClick={this.displayDownloadPackages.bind(this)} />
        <SideBarButton glyphicon={"cloud-download"} value={" Updates"} title={"Update your Packages"}
                      handleButtonClick={this.displayUpdatePackages.bind(this)} />
      </div>
    );
  }
}
module.exports = PackManagerSideBar;
