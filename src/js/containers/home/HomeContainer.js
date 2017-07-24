import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// info
import packagefile from '../../../../package.json';
// components
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import WelcomeSplash from '../../components/home/WelcomeSplash'
import LicenseModal from '../../components/home/license/LicenseModal'
import AppVersion from '../../components/home/AppVersion';
import Stepper from '../../components/home/stepper/Stepper';
import Overview from '../../components/home/overview';
import Instructions from '../../components/home/instructions/Instructions';
import BackNavigation from '../../components/home/BackNavigation';
// containers
import UsersManagementContainer from './UsersManagementContainer';
import ProjectsManagementContainer from './ProjectsManagementContainer';
import ToolsManagementContainer from './ToolsManagementContainer';
// actions
import * as BodyUIActions from '../../actions/BodyUIActions';

class HomeContainer extends Component {

  componentWillReceiveProps(nextProps) {
    this.props.actions.getStepperNextButtonIsDisabled();
  }

  render() {
    let {
      stepper: {
        stepIndex
      },
      showWelcomeSplash,
      showLicenseModal
    } = this.props.reducers.homeScreenReducer;

    let displayContainer = <div />;

    switch (stepIndex) {
      case 0:
        displayContainer = <Overview {...this.props} />;
        break;
      case 1:
        displayContainer = <UsersManagementContainer />;
        break;
      case 2:
        displayContainer = <ProjectsManagementContainer />;
        break;
      case 3:
        displayContainer = <ToolsManagementContainer />;
        break;
      default:
        break;
    }

    return (
      <div style={{width: '100%'}}>
        {showWelcomeSplash ?
          <WelcomeSplash {...this.props} /> :
          (
            <MuiThemeProvider style={{ fontSize: '1.1em' }}>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', background: 'var(--background-color-light)' }}>
                <Stepper homeScreenReducer={this.props.reducers.homeScreenReducer} />
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', height: '70%' }}>
                  <div style={{ width: '400px', padding: '0 20px' }}>
                    <Instructions {...this.props} />
                  </div>
                  <div style={{ width: '600px', padding: '0 20px', marginBottom: '25px' }}>
                    {displayContainer}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <BackNavigation {...this.props} />
                    <AppVersion actions={this.props.actions} version={packagefile.version} />
                  </div>
                </div>
              </div>
            </MuiThemeProvider>
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
      },
      goToNextStep: () => {
        dispatch(BodyUIActions.goToNextStep());
      },
      goToPrevStep: () => {
        dispatch(BodyUIActions.goToPrevStep());
      },
      goToStep: (stepNumber) => {
        dispatch(BodyUIActions.goToStep(stepNumber));
      },
      changeHomeInstructions: (instructions) => {
        dispatch(BodyUIActions.changeHomeInstructions(instructions));
      },
      toggleHomeView: () => {
        dispatch(BodyUIActions.toggleHomeView());
      },
      getStepperNextButtonIsDisabled: () => {
        dispatch(BodyUIActions.getStepperNextButtonIsDisabled());
      },
      openLicenseModal: () => {
        dispatch(BodyUIActions.openLicenseModal());
      }
    }
  };
};

HomeContainer.propTypes = {
  actions: PropTypes.object.isRequired,
  reducers: PropTypes.object.isRequired
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HomeContainer);
