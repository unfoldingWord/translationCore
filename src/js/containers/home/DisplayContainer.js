import React, { Component } from 'react'
import { connect } from 'react-redux'
// containers
import HomeScreenContainer from './HomeScreenContainer'
import UserSelectionContainer from './UserSelectionContainer'
import ProjectSelectionContainer from './ProjectSelectionContainer'
import ToolSelectionContainer from './ToolSelectionContainer'
// actions
// import {actionCreator} from 'actionCreatorPath'

class DisplayContainer extends Component {
  render() {
    return (
      <div>
        <HomeScreenContainer {...this.props} />
        <UserSelectionContainer {...this.props} />
        <ProjectSelectionContainer {...this.props} />
        <ToolSelectionContainer {...this.props} />
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
