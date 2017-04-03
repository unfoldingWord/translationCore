import React from 'react'
import { connect } from 'react-redux'
import CheckStoreActions from '../actions/CheckStoreActions.js'
import SideBarActions from '../actions/SideBarActions.js'
import Groups from '../components/core/groupMenu/Groups'
import {Grid, Row, Col, Glyphicon} from 'react-bootstrap'
import Chevron from '../components/core/SideBar/Chevron'
import * as style from '../components/core/SideBar/Style'
import {changeCurrentContextId} from '../actions/ContextIdActions.js'

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
    let { onToggleMenu } = this.props
    let { menuVisibility, currentCheckNamespace } = this.props.sideBarReducer;

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
              <Groups {...this.props} />
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
  return {
    groupsIndexReducer: state.groupsIndexReducer,
    groupsDataReducer: state.groupsDataReducer,
    selectionsReducer: state.selectionsReducer,
    contextIdReducer: state.contextIdReducer,
    resourcesReducer: state.resourcesReducer,
    projectDetailsReducer: state.projectDetailsReducer,
    sideBarReducer: state.sideBarReducer
  }
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
    actions: {
      changeCurrentContextId: (contextId) => {
        dispatch(changeCurrentContextId(contextId));
      }
    }
  }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(SideBarContainer);
