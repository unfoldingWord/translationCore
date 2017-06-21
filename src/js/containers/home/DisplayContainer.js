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
    let {stepIndex} = this.props.BodyUIReducer.stepper;
    let displayContainer = <div />;
    switch (stepIndex) {
      case 0:
        displayContainer = <OverviewContainer {...this.props} />;
        break;
      case 1:
        displayContainer = <UsersManagementContainer {...this.props} />;
        break;
      case 2:
        displayContainer = <ProjectsManagementContainer {...this.props} />;
        break;
      case 3:
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
