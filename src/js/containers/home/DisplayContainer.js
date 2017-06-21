import React, { Component } from 'react';
import { connect } from 'react-redux';
// containers
import OverviewContainer from './OverviewContainer';
import UsersManagementContainer from './UsersManagementContainer';
import ProjectsManagementContainer from './ProjectsManagementContainer';
import ToolsManagementContainer from './ToolsManagementContainer';
// actions
// import {actionCreator} from 'actionCreatorPath'

class DisplayContainer extends Component {
  render() {
    let displayMode = 'Overview';
    let displayContainer = <div />;
    switch (displayMode) {
      case 'Overview':
        displayContainer = <OverviewContainer {...this.props} />;
        break;
      case 'UsersManagement':
        displayContainer = <UsersManagementContainer {...this.props} />;
        break;
      case 'ProjectsManagement':
        displayContainer = <ProjectsManagementContainer {...this.props} />;
        break;
      case 'ToolsManagement':
        displayContainer = <ToolsManagementContainer {...this.props} />;
        break;
      default:
        break;
    }
    return (
      <div>
        DisplayContainer
        {displayContainer}
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    prop: state.prop
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatch1: () => {
      // dispatch(actionCreator);
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DisplayContainer);
