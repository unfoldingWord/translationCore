import React, { Component } from 'react'
import { connect } from 'react-redux'
// components
import UserInfoCard from '../../components/home/homeScreen/UserInfoCard'
import ProjectInfoCard from '../../components/home/homeScreen/ProjectInfoCard'
import ToolInfoCard from '../../components/home/homeScreen/ToolInfoCard'
// actions
// import {actionCreator} from 'actionCreatorPath'

class HomeScreenContainer extends Component {
  render() {
    return (
      <div>
        <UserInfoCard {...this.props} />
        <ProjectInfoCard {...this.props} />
        <ToolInfoCard {...this.props} />
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
)(HomeScreenContainer);
