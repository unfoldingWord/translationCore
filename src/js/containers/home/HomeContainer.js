import React, { Component } from 'react'
import { connect } from 'react-redux'
// components
import WelcomeSplash from '../../components/home/WelcomeSplash'
import LicenseModal from '../../components/home/LicenseModal'
// containers
import MainContainer from './MainContainer'
// actions
// import {actionCreator} from 'actionCreatorPath'


class HomeContainer extends Component {
  render() {
    return (
      <div>
        <WelcomeSplash />
        <LicenseModal />
        <MainContainer {...this.props} />
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
)(HomeContainer);
