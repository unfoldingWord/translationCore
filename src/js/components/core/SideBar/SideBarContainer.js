const api = window.ModuleApi;
const React = api.React;
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
    var chevrons = document.getElementById('fixedChevrons') || { clientHeight: 228 };
    if (chevrons) {
      var sideBarContainerStyle = {
        backgroundColor: "#333333",
        zIndex: "98",
        fontSize: "12px",
        overflowX: "hidden",
        height: "100%",
        padding: 0,
        position:"fixed",
        width:"300px"
      };
    }
      sideBarContent = (
          <Grid fluid style={sideBarContainerStyle}>
            <Col id='fixedChevrons' style={style.fixedChevrons}>
              <img src="images/TC_Icon_White.png"
                   onClick={this.props.changeView}
                   style={style.logo}
                   title="Click to open app preferences"/>
              <Chevron color="magenta" glyphicon={"folder-open"}
                handleClick={this.props.handleOpenProject} style={{width:"100%"}}/>
              <Chevron color="blue" glyphicon={"wrench"} style={{width:"100%"}}
                imagePath={this.props.imgPath}
                handleClick={this.props.handleSelectTool} />
            </Col>
            <Col style={{width:"300px", position: "fixed", padding: 0, backgroundColor: "#333333", height: "100%", overflowY: "scroll" }}>
              <MenuHeaders ref='menuheaders' subMenuProps={this.props.subMenuProps} currentToolNamespace={this.props.currentToolNamespace} currentGroupObjects={this.props.currentGroupObjects}
                isCurrentHeader={this.props.isCurrentHeader} currentCheckIndex={this.props.currentCheckIndex}
                currentGroupIndex={this.props.currentGroupIndex} menuClick={this.props.menuClick} currentBookName={this.props.currentBookName}
                currentSubGroupObjects={this.props.currentSubGroupObjects} isCurrentSubMenu={this.props.currentCheckIndex}
                isOpen={this.props.isOpen}/>
            </Col>
          </Grid>);
    return (
      <div>
        {sideBarContent}
      </div>
    );
  }

}

module.exports = SideBarContainer;
