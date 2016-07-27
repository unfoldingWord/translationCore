
const api = window.ModuleApi;
const React = api.React;
const CoreActions = require('../../../actions/CoreActions.js');
const CoreStore = require('../../../stores/CoreStore.js');
const CheckStore = require('../../../stores/CheckStore.js');
const LoginButton = require("./LoginButton");
const SideBarButton = require("./SideBarButton");
const OnlineStatus = require('./OnlineStatus');
const RB = api.ReactBootstrap;
const {Glyphicon} = RB;
const Image = require('react-bootstrap/lib/Image.js');
const style = require("./Style");

class SideNavBar extends React.Component{
  handleCreateProject(){
    CoreActions.showCreateProject("Languages");
  }

  handleOpenProject(){
    CoreActions.showOpenModal(true);
  }

  handleSaveProject(){
  let path = api.getDataFromCommon('saveLocation');
    CheckStore.saveAllToDisk(path, function() {});
  }

  handleSettings(){
    CoreActions.updateSettings(true);
  }

  handleRecentProject(){
    console.log("Recent Project modal not designed yet");
  }

  handleChangeCheckCategory(){
    CoreActions.updateCheckModal(true);
  }
    render(){
      return(
        <div style={style.container}>
          <ul style={style.ul}>
            <img src="images/TC_Icon_logo.png" style={style.logo}/>
            <LoginButton />
            <SideBarButton handleButtonClick={this.handleCreateProject.bind(this)} glyphicon={"file"} value={"New"} />
            <SideBarButton handleButtonClick={this.handleOpenProject.bind(this)} glyphicon={"folder-open"} value={"Open"} />
            <SideBarButton handleButtonClick={this.handleRecentProject.bind(this)} glyphicon={"list-alt"} value={"Reports"} />
            <SideBarButton handleButtonClick={this.handleSaveProject.bind(this)} glyphicon={"floppy-save"} value={"Save"} />
            <SideBarButton handleButtonClick={this.handleChangeCheckCategory.bind(this)} glyphicon={"check"} value={"Check Category"} />
            <SideBarButton handleButtonClick={this.handleSettings.bind(this)} glyphicon={"cog"} value={"Settings"} />
            <OnlineStatus />
          </ul>
        </div>
      );
    }

}

module.exports = SideNavBar;
