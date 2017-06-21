import React, { Component } from 'react';
import { connect } from 'react-redux'
// components
import MyProjects from '../../components/home/projectsManagement/MyProjects'
import ProjectsFAB from '../../components/home/projectsManagement/ProjectsFAB'
import OnlineImportModal from '../../components/home/projectsManagement/OnlineImportModal'
// actions
// import {actionCreator} from 'actionCreatorPath'

class ProjectsManagementContainer extends Component {

  componentWillMount() {
    let instructions = <div>ProjectsManagementInstructions</div>;
    if (this.props.BodyUIReducer.homeInstructions !== instructions) {
      this.props.actions.changeHomeInstructions(instructions);
    }
  }

  render() {
    return (
      <div>
        ProjectsManagementContainer
        {/*
        <MyProjects />
        <ProjectsFAB />
        <OnlineImportModal />
        */}
      </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(ProjectsManagementContainer)
