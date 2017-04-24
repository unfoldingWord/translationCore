import React, { Component } from 'react'
import { connect } from 'react-redux'
// components
import WelcomeSplash from '../../components/home/WelcomeSplash'
import LicenseModal from '../../components/home/LicenseModal'
// containers
import MainContainer from './MainContainer'
// actions
import * as BodyUIActions from '../../actions/BodyUIActions'

class HomeContainer extends Component {

  homeContainerDisplay() {
    let {showWelcomeSplash} = this.props.BodyUIReducer;
    let display = <div />;
    if (showWelcomeSplash) {
      display = (
        <WelcomeSplash {...this.props} />
      );
    } else {
      display = (
        <MainContainer {...this.props} />
      );
    }
    return display;
  }

  render() {
    let {toggleHomeView} = this.props.actions;
    return (
      <div>
        {this.homeContainerDisplay()}
        <LicenseModal {...this.props} />
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    BodyUIReducer: state.BodyUIReducer
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    actions: {
      toggleHomeView: () => {
        dispatch(BodyUIActions.toggleHomeView())
      },
      toggleWelcomeSplash: () => {
        dispatch(BodyUIActions.toggleWelcomeSplash())
      }
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HomeContainer);
