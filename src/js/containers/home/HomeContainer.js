import React, { Component } from 'react'
import { connect } from 'react-redux'
// components
import WelcomeSplash from '../../components/home/WelcomeSplash'
import LicenseModal from '../../components/home/license/LicenseModal'
// containers
import MainContainer from './MainContainer'
// actions
import * as BodyUIActions from '../../actions/BodyUIActions';
// info
import packagefile from '../../../../package.json';

class HomeContainer extends Component {

  render() {
    let { showWelcomeSplash, showLicenseModal } = this.props.reducers.homeScreenReducer;
    return (
      <div style={{width: '100%'}}>
        {
          showWelcomeSplash ? (
            <WelcomeSplash {...this.props} />
          ) : (
            <MainContainer {...this.props} version={packagefile.version} />
          )
        }
        <LicenseModal
          version={packagefile.version}
          actions={this.props.actions}
          showLicenseModal={showLicenseModal}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    reducers: {
      homeScreenReducer: state.homeScreenReducer,
      loginReducer: state.loginReducer,
      projectDetailsReducer: state.projectDetailsReducer,
      toolsReducer: state.toolsReducer,
      groupsDataReducer: state.groupsDataReducer
    }
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: {
      toggleWelcomeSplash: () => {
        dispatch(BodyUIActions.toggleWelcomeSplash());
      },
      closeLicenseModal: () => {
        dispatch(BodyUIActions.closeLicenseModal());
      }
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HomeContainer);
