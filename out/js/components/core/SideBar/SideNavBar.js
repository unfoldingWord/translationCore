const api = window.ModuleApi;
const React = api.React;
const CoreActions = require('../../../actions/CoreActions.js');
const CoreStore = require('../../../stores/CoreStore.js');
const CheckStore = require('../../../stores/CheckStore.js');
const LoginButton = require("./LoginButton");
const SideBarButton = require("./SideBarButton");
const OnlineStatus = require('./OnlineStatus');
const RB = api.ReactBootstrap;
const { Glyphicon } = RB;
const Image = require('react-bootstrap/lib/Image.js');
const style = require("./Style");
const gogs = require('../login/GogsApi.js');
const sync = require('./GitSync.js');

class SideNavBar extends React.Component {
  handleOpenProject() {
    CoreActions.showCreateProject("Languages");
  }

  handleSyncProject() {
    if (api.getDataFromCommon('saveLocation') && api.getDataFromCommon('tcManifest')) {
      sync();
    } else {
      api.Toast.info('Open a project first, then try again', '', 3);
      CoreActions.showCreateProject("Languages");
    }
  }

  handleReport() {
    require("./../reports/ReportGenerator")(err => {
      if (err) {
        console.log(err);
      }
    });
  }

  handleChangeCheckCategory() {
    if (api.getDataFromCommon('saveLocation') && api.getDataFromCommon('tcManifest')) {
      CoreActions.updateCheckModal(true);
    } else {
      api.Toast.info('Open a project first, then try again', '', 3);
      CoreActions.showCreateProject("Languages");
    }
  }

  handleSettings() {
    CoreActions.updateSettings(true);
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

  render() {
    return React.createElement(
      'div',
      { style: style.container },
      React.createElement(
        'ul',
        { style: style.ul },
        React.createElement('img', { src: 'images/TC_Icon_logo.png', onClick: this.sayHello.bind(this), style: style.logo }),
        React.createElement(LoginButton, null),
        React.createElement(SideBarButton, { handleButtonClick: this.handleOpenProject.bind(this), glyphicon: "folder-open", value: "Load" }),
        React.createElement(SideBarButton, { handleButtonClick: this.handleSyncProject.bind(this), glyphicon: "cloud-upload", value: "Sync" }),
        React.createElement(SideBarButton, { handleButtonClick: this.handleReport.bind(this), glyphicon: "list-alt", value: "Reports" }),
        React.createElement(SideBarButton, { handleButtonClick: this.handleChangeCheckCategory.bind(this), glyphicon: "check", value: "Apps" }),
        React.createElement(SideBarButton, { handleButtonClick: this.handleSettings.bind(this), glyphicon: "cog", value: "Settings" })
      )
    );
  }

}

module.exports = SideNavBar;