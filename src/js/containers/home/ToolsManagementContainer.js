import React, { Component } from 'react';
import { connect } from 'react-redux'
// components
import MyProjects from '../../components/home/projectManagement/MyProjects'
import ProjectsFAB from '../../components/home/projectManagement/ProjectsFAB'
import OnlineImportModal from '../../components/home/projectManagement/OnlineImportModal'
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

export default connect(mapStateToProps, mapDispatchToProps)(ToolsManagementContainer)