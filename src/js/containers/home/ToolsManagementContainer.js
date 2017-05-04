import React, { Component } from 'react';
import { connect } from 'react-redux'
// components
import ToolsCards from '../../components/home/toolsManagement/ToolsCards'
// actions
// import {actionCreator} from 'actionCreatorPath'

class ToolsManagementContainer extends Component {
  render() {
    return (
      <ToolsCards {...this.props}/>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    prop: state.prop
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatch1: () => {
      // dispatch(actionCreator)
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ToolsManagementContainer)
