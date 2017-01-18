const api = window.ModuleApi;
const React = api.React;
const LoginButton = require("./LoginButton");
const SideBarButton = require("./SideBarButton");
const OnlineStatus = require('./OnlineStatus');
const RB = api.ReactBootstrap;
const ReactDOM = require("react-dom");
const {Glyphicon} = RB;
const Image = require('react-bootstrap/lib/Image.js');
const style = require("./Style");

class SideNavBar extends React.Component{
    render(){
      return(
        <div style={style.container}>
          <ul style={style.ul}>
            <LoginButton />
            <SideBarButton handleButtonClick={this.props.handleSyncProject} glyphicon={"cloud-upload"} value={"Sync"} />
            <SideBarButton handleButtonClick={this.props.handleReport} glyphicon={"list-alt"} value={"Reports"} />
            <SideBarButton handleButtonClick={this.props.handleSettings} glyphicon={"cog"} value={"Settings"} />
            <SideBarButton handleButtonClick={this.props.handlePackageManager} imageName={"images/package.svg"} hoverImage={"images/bluePackage.svg"} value={"Toolbox"} />
          </ul>
        </div>
      );
    }

}

module.exports = SideNavBar;
