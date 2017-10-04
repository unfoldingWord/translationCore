import React from 'react';
import PropTypes from 'prop-types';
import Konami from 'konami-code-js';
import {connect} from 'react-redux';
// Actions
import {toggleSettings} from '../actions/SettingsActions';
import * as AlertModalActions from '../actions/AlertModalActions';

class KonamiContainer extends React.Component {

  componentWillMount() {
    // Konami Code ( << Up, Up, Down, Down, Left, Right, Left, Right, B, A >> )
    // This is used to enable or disable developer mode
    new Konami(
      () => {
        let developerMode = this.props.currentSettings.developerMode;
        this.props.actions.onToggleSettings();
        if (developerMode) {
          this.props.actions.openAlertDialog("Developer Mode Disabled");
        } else {
          this.props.actions.openAlertDialog("Developer Mode Enabled: No technical support is provided for translationCore in developer mode!");
        }
      }
    );
  }
  render() {
    return (<div/>);
  }
}

KonamiContainer.propTypes = {
    currentSettings: PropTypes.any.isRequired,
    actions: PropTypes.any.isRequired
};

const mapStateToProps = state => {
  return {
    ...state.settingsReducer
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: {
      onToggleSettings: () => {
        dispatch(toggleSettings("developerMode"));
      },
      openAlertDialog: (message) => {
        dispatch(AlertModalActions.openAlertDialog(message));
      }
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(KonamiContainer);
