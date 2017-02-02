const React = require('react');
const { connect } = require('react-redux');
const CheckStoreActions = require('../actions/CheckStoreActions.js');
const SideBarActions = require('../actions/SideBarActions.js');
const MenuHeaders = require('../components/core/navigation_menu/MenuHeaders');
const {Grid, Row, Col} = require('react-bootstrap/lib');
const Chevron = require('../components/core/SideBar/Chevron');
const style = require("../components/core/SideBar/Style");


var sideBarContainerStyle = {
  backgroundColor: "#333333",
  zIndex: "98",
  fontSize: "12px",
  overflowX: "hidden",
  height: "100%",
  padding: 0,
  position:"fixed",
  width:"300px"
}

class SideBarContainer extends React.Component {
  render() {
    return (
      <div>
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
            <MenuHeaders {...this.props} currentToolNamespace={this.props.currentToolNamespace}/>
          </Col>
        </Grid>
      </div>
    );
  }
}


function mapStateToProps(state) {
  return Object.assign({}, state.checkStoreReducer, state.sideBarReducer);
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    menuClick: (id, currentToolNamespace, bool) => {
      dispatch(SideBarActions.menuHeaderClicked(currentToolNamespace, parseInt(id), 0, bool));
    },
    checkClicked: (currentGroupIndex, id, currentToolNamespace) => {
      console.log(currentGroupIndex, id,  currentToolNamespace);
      dispatch(
        CheckStoreActions.goToCheck(currentToolNamespace, currentGroupIndex, parseInt(id))
      );
    },
  }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(SideBarContainer);
