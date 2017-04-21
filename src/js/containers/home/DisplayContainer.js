import React, { Component } from 'react'
import { connect } from 'react-redux'
// containers
import OverviewContainer from './OverviewContainer'
import UsersManagementContainer from './UsersManagementContainer'
import ProjectsManagementContainer from './ProjectsManagementContainer'
import ToolsManagementContainer from './ToolsManagementContainer'
// actions
// import {actionCreator} from 'actionCreatorPath'

class DisplayContainer extends Component {
  render() {
    return (
      <div>
        <OverviewContainer {...this.props} />
        <UsersManagementContainer {...this.props} />
        <ProjectsManagementContainer {...this.props} />
        <ToolsManagementContainer {...this.props} />
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
