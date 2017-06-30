import React, { Component } from 'react';
import { connect } from 'react-redux'
import PropTypes from 'prop-types';
// components
import MyProjects from '../../components/home/projectsManagement/MyProjects';
import ProjectsFAB from '../../components/home/projectsManagement/ProjectsFAB';
// import OnlineImportModal from '../../components/home/projectsManagement/OnlineImportModal'
// actions
import * as BodyUIActions from '../../actions/BodyUIActions';
import * as MyProjectsActions from '../../actions/MyProjectsActions';

class ProjectsManagementContainer extends Component {

  componentWillMount() {
    this.props.actions.getMyProjects();
    let instructions = this.instructions();
    if (this.props.reducers.homeScreenReducer.homeInstructions !== instructions) {
      this.props.actions.changeHomeInstructions(instructions);
    }
  }

  instructions() {
    return (
      <div>
        <p>Select a project from the list.</p>
        <p>To import a project, click (=)</p>
        <p>Only projects that have been saved with the latest version of translationStudio can be opened in translationCore at this time.</p>
      </div>
    );
  }

  render() {
    const {projectDetailsReducer, myProjectsReducer} = this.props.reducers;
    const myProjects = myProjectsReducer.projects;

    return (
      <div>
        <MyProjects myProjects={myProjects} actions={this.props.actions} />
        <ProjectsFAB />
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    reducers: {
      projectDetailsReducer: state.projectDetailsReducer,
      homeScreenReducer: state.homeScreenReducer,
      myProjectsReducer: state.myProjectsReducer
    }
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    actions: {
      changeHomeInstructions: (instructions) => {
        dispatch(BodyUIActions.changeHomeInstructions(instructions));
      },
      getMyProjects: () => {
        dispatch(MyProjectsActions.getMyProjects());
      }
    }
  };
};

ProjectsManagementContainer.propTypes = {
  reducers: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectsManagementContainer);
