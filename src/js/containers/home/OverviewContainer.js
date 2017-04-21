import React, { Component } from 'react'
import { connect } from 'react-redux'
// components
import UserCard from '../../components/home/overview/UserCard'
import ProjectCard from '../../components/home/overview/ProjectCard'
import ToolCard from '../../components/home/overview/ToolCard'
// actions
// import {actionCreator} from 'actionCreatorPath'

class OverviewContainer extends Component {
  render() {
    return (
      <div>
        <UserCard {...this.props} />
        <ProjectCard {...this.props} />
        <ToolCard {...this.props} />
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
)(OverviewContainer);
