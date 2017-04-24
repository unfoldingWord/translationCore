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
  render() {
    let {toggleHomeView} = this.props.actions;
    return (
      <div>
        <h1 onClick={toggleHomeView}>hello</h1>
        <WelcomeSplash />
        <LicenseModal />
       {/* <MainContainer {...this.props} /> */}
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
    actions: {
      toggleHomeView: () => {
        dispatch(BodyUIActions.toggleHomeView())
      }
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HomeContainer);
