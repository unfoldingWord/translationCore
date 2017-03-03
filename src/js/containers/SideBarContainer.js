const React = require('react');
const { connect } = require('react-redux');
const CheckStoreActions = require('../actions/CheckStoreActions.js');
const SideBarActions = require('../actions/SideBarActions.js');
const MenuHeaders = require('../components/core/navigation_menu/MenuHeaders');
const {Grid, Row, Col} = require('react-bootstrap/lib');
const {Glyphicon} = require('react-bootstrap');
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
    let concatStyle = Object.assign(sideBarContainerStyle, {display: this.props.menuVisibility ? "block" : "none"})
    return (
      <div>
        <Grid fluid style={concatStyle}>
          <Col style={
            {
              width:"300px",
              position: "fixed",
              padding: 0,
              backgroundColor: "#333333",
              height: "95%",
              overflowY: "scroll"
            }
          }>
            <MenuHeaders {...this.props} currentToolNamespace={this.props.currentToolNamespace}/>
          </Col>
        </Grid>
        <Glyphicon style={this.props.menuVisibility ? style.slideButton : style.slideButtonCollapsed}
                   glyph={this.props.menuVisibility ? 'chevron-left' : 'chevron-right'}
                   onClick={this.props.onToggleMenu} />
      </div>
    );
  }
}


function mapStateToProps(state) {
  return Object.assign({}, state.checkStoreReducer, state.sideBarReducer);
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onToggleMenu: () => {
      dispatch(SideBarActions.toggleMenu());
    },
    menuClick: (id, currentToolNamespace, bool) => {
      dispatch(SideBarActions.menuHeaderClicked(currentToolNamespace, parseInt(id), 0, bool));
    },
    checkClicked: (currentGroupIndex, id, currentToolNamespace) => {
      dispatch(
        CheckStoreActions.goToCheck(currentToolNamespace, currentGroupIndex, parseInt(id))
      );
    },
  }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(SideBarContainer);
