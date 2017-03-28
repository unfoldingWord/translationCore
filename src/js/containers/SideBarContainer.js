const React = require('react');
const { connect } = require('react-redux');
const CheckStoreActions = require('../actions/CheckStoreActions.js');
const SideBarActions = require('../actions/SideBarActions.js');
const MenuHeaders = require('../components/core/navigation_menu/MenuHeaders');
const {Grid, Row, Col, Glyphicon} = require('react-bootstrap');
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
  width:"250px"
}

class SideBarContainer extends React.Component {
  render() {
    let { menuVisibility, currentCheckNamespace, onToggleMenu } = this.props;
    return (
      <div>
        <div style={{display: menuVisibility ? "block" : "none"}}>
          <Grid fluid style={sideBarContainerStyle}>
            <Col style={
              {
                width:"250px",
                position: "fixed",
                padding: 0,
                backgroundColor: "#333333",
                height: "95%",
                overflowY: "scroll"
              }
            }>
              <MenuHeaders {...this.props} currentToolNamespace={currentCheckNamespace}/>
            </Col>
          </Grid>
        </div>
        <Glyphicon style={menuVisibility ? style.slideButton : style.slideButtonCollapsed}
                   glyph={menuVisibility ? 'chevron-left' : 'chevron-right'}
                   onClick={onToggleMenu} />
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
    menuClick: (id) => {
      dispatch(SideBarActions.menuHeaderClicked(parseInt(id), 0));
    },
    checkClicked: (currentGroupIndex, id) => {
      dispatch(
        CheckStoreActions.goToCheck(currentGroupIndex, parseInt(id))
      );
    },
  }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(SideBarContainer);
