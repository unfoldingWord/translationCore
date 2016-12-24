const api = window.ModuleApi;
const React = api.React;
const CoreActions = require('../../../actions/CoreActions.js');
const CoreStore = require('../../../stores/CoreStore.js');
const CheckStore = require('../../../stores/CheckStore.js');
const LoginButton = require("./LoginButton");
const SideBarButton = require("./SideBarButton");
const OnlineStatus = require('./OnlineStatus');
const RB = api.ReactBootstrap;
const ReactDOM = require("react-dom");
const {Glyphicon} = RB;
const Image = require('react-bootstrap/lib/Image.js');
const style = require("./Style");
const gogs = require('../login/GogsApi.js');
const sync = require('./GitSync.js');
const path = require('path');
const fs = require('fs');

class SideNavBar extends React.Component{
  handleOpenProject(){
    CoreActions.showCreateProject("Languages");
  }

  handleSyncProject(){
    if (api.getDataFromCommon('saveLocation') && api.getDataFromCommon('tcManifest')) {
      sync();
    } else {
      api.Toast.info('Open a project first, then try again', '', 3);
      CoreActions.showCreateProject("Languages");
    }
  }

  handleReport(){
    api.Toast.info('Generating reports...', '', 3);
    const Report = require("./../reports/ReportGenerator");
    api.emitEvent('ReportVisibility', {'visibleReport': 'true'});
  }

  handleChangeCheckCategory(){
    if (api.getDataFromCommon('saveLocation') && api.getDataFromCommon('tcManifest')) {
      CoreActions.updateCheckModal(true);
    } else {
      api.Toast.info('Open a project first, then try again', '', 3);
      CoreActions.showCreateProject("Languages");
    }
  }

  handleSettings(){
    CoreActions.updateSettings(true);
  }

  handlePackageManager(){
    var PackageManagerView = require("./../Package_Manager/PackageManagerView");
    ReactDOM.render(<PackageManagerView />, document.getElementById('package_manager'))
    api.emitEvent('PackManagerVisibility', {'visiblePackManager': 'true'});
  }

  sayHello() {
    const user = CoreStore.getLoggedInUser();
    if (user) {
      var msg = new SpeechSynthesisUtterance('Hello ' + user.username + ', I am Translation Core');
    } else {
      var msg = new SpeechSynthesisUtterance('Hello I am Translation Core');
    }
    window.speechSynthesis.speak(msg);
  }

    render(){
      return(
        <div style={style.container}>
          <ul style={style.ul}>
            <LoginButton />
            <SideBarButton handleButtonClick={this.handleSyncProject.bind(this)} glyphicon={"cloud-upload"} value={"Sync"} />
            <SideBarButton handleButtonClick={this.handleReport.bind(this)} glyphicon={"list-alt"} value={"Reports"} />
            <SideBarButton handleButtonClick={this.handleSettings.bind(this)} glyphicon={"cog"} value={"Settings"} />
            <SideBarButton handleButtonClick={this.handlePackageManager.bind(this)} imageName={"images/package.svg"} hoverImage={"images/bluePackage.svg"} value={"Toolbox"} />
          </ul>
        </div>
      );
    }

}

module.exports = SideNavBar;
