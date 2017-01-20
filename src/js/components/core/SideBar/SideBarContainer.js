const api = window.ModuleApi;
const React = api.React;
const SideNavBar = require('./SideNavBar');
const Chevron = require('./Chevron');
const style = require("./Style");
const MenuHeaders = require('../navigation_menu/MenuHeaders');
const CoreActionsRedux = require('../../../actions/CoreActionsRedux.js');
const Grid = require('react-bootstrap/lib/Grid.js');
const Row = require('react-bootstrap/lib/Row.js');
const Col = require('react-bootstrap/lib/Col.js');

class SideBarContainer extends React.Component {
  render() {
    let sideBarContent;
    if (this.props.SideNavBar || this.props.initShow) {
      var sideBarContainerStyle = null;
      sideBarContent = <div style={style.sideBarcontainer}>
        <img src="images/TC_Icon_logo.png" onClick={this.props.changeView}
          style={style.logo} />
        <SideNavBar handleSyncProject={this.props.handleSyncProject}
          handleReport={this.props.handleReport} handleSettings={this.props.handleSettings}
          handlePackageManager={this.props.handlePackageManager}
          /><br />
        <div style={{ bottom: "0px", position: "absolute" }}>
          <Chevron color="magenta" glyphicon={"folder-open"}
            handleClick={this.props.handleOpenProject} />
          <Chevron color="blue" glyphicon={"wrench"}
            imagePath={this.props.imgPath}
            handleClick={this.props.handleSelectTool} />
        </div>
      </div>;
    } else {
      var chevrons = document.getElementById('fixedChevrons') || { clientHeight: 228 };
      if (chevrons) {
        var sideBarContainerStyle = {
          backgroundColor: "#333333",
          zIndex: "98",
          fontSize: "12px",
          overflowX: "hidden",
          height: "100%",
          padding:0
        };
      }
      sideBarContent =
        (
            <Grid style={sideBarContainerStyle}>
              <Col md={3} style={{position:"fixed", padding:0, backgroundColor: "#333333", }}>
                <MenuHeaders ref='menuheaders' subMenuProps={this.props.subMenuProps} currentToolNamespace={this.props.currentToolNamespace} currentGroupObjects={this.props.currentGroupObjects}
                  isCurrentHeader={this.props.isCurrentHeader} currentCheckIndex={this.props.currentCheckIndex}
                  currentGroupIndex={this.props.currentGroupIndex} menuClick={this.props.menuClick} currentBookName={this.props.currentBookName}
                  currentSubGroupObjects={this.props.currentSubGroupObjects} isCurrentSubMenu={this.props.currentCheckIndex} />
              </Col>
            </Grid>);
    }
    return (
      <div>
        {sideBarContent}
      </div>
    );
  }

}

module.exports = SideBarContainer;