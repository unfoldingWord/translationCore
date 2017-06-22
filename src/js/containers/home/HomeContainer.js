import React, { Component } from 'react'
import { connect } from 'react-redux'
// components
import WelcomeSplash from '../../components/home/WelcomeSplash'
import LicenseModal from '../../components/home/LicenseModal'
// containers
import MainContainer from './MainContainer'
// actions
import * as BodyUIActions from '../../actions/BodyUIActions'
import * as modalActions from '../../actions/ModalActions';

class HomeContainer extends Component {

  render() {
    let {showWelcomeSplash} = this.props.reducers.BodyUIReducer;
    return (
      <div style={{width: '100%'}}>
        {showWelcomeSplash ? (
          <WelcomeSplash {...this.props} />
        ) : (
          <MainContainer {...this.props} />
        )}
        <LicenseModal {...this.props} />
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    reducers: {
      BodyUIReducer: state.BodyUIReducer,
      projectDetailsReducer: state.projectDetailsReducer,
      toolsReducer: state.toolsReducer,
      currentToolReducer: state.currentToolReducer,
      loginReducer: state.loginReducer
    }
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    actions: {
      toggleModal: () => {
        // temporary action being dispatched until we move to home screen implementation.
        dispatch(modalActions.selectModalTab(1, 1, true));
      },
      toggleWelcomeSplash: () => {
        dispatch(BodyUIActions.toggleWelcomeSplash());
      }
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HomeContainer);
