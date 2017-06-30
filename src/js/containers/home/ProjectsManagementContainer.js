import React, { Component } from 'react';
import { connect } from 'react-redux'
import PropTypes from 'prop-types';
// components
import MyProjects from '../../components/home/projectsManagement/MyProjects';
import ProjectsFAB from '../../components/home/projectsManagement/ProjectsFAB';
// import OnlineImportModal from '../../components/home/projectsManagement/OnlineImportModal'
// actions
import * as BodyUIActions from '../../actions/BodyUIActions';

class ProjectsManagementContainer extends Component {

  componentWillMount() {
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
    const {projectDetailsReducer} = this.props.reducers;
    const myProjects = [];
    if (projectDetailsReducer.projectSaveLocation) {
      myProjects.push(projectDetailsReducer);
      myProjects.push(projectDetailsReducer);
    }

    return (
      <div>
        <MyProjects myProjects={myProjects} actions={this.props.actions} />
        <div style={{ position: "absolute", bottom:"50px", right: "50px"}}>
          <ProjectsFAB
            homeScreenReducer={this.props.reducers.homeScreenReducer}
            actions={this.props.actions}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    reducers: {
      projectDetailsReducer: state.projectDetailsReducer,
      homeScreenReducer: state.homeScreenReducer
    }
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    actions: {
      changeHomeInstructions: (instructions) => {
        dispatch(BodyUIActions.changeHomeInstructions(instructions));
      },
      toggleProjectsFAB: () => {
        dispatch(BodyUIActions.toggleProjectsFAB());
      }
    }
  };
};

ProjectsManagementContainer.propTypes = {
  reducers: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectsManagementContainer);
