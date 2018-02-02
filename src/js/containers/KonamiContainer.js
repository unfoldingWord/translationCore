import React from 'react';
import PropTypes from 'prop-types';
import Konami from 'konami-code-js';
import {connect} from 'react-redux';
// Actions
import {setSetting} from '../actions/SettingsActions';
import {openAlertDialog} from '../actions/AlertModalActions';
import {getSetting} from '../reducers';
import {withLocale} from '../components/Locale';

const developerModeSettingKey = 'developerMode';

class KonamiContainer extends React.Component {

  componentWillMount() {
    const {developerMode, openAlertDialog, setSetting, translate} = this.props;
    // Konami Code ( << Up, Up, Down, Down, Left, Right, Left, Right, B, A >> )
    // This is used to enable or disable developer mode
    new Konami(
      () => {
        setSetting(developerModeSettingKey, !developerMode);
        if (developerMode) {
          openAlertDialog(translate('developer_mode.disabled'));
        } else {
          openAlertDialog(translate('developer_mode.enabled'));
        }
      }
    );
  }
  render() {
    return (<div/>);
  }
}

KonamiContainer.propTypes = {
  developerMode: PropTypes.bool,
  openAlertDialog: PropTypes.func,
  setSetting: PropTypes.func,
  translate: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  developerMode: getSetting(state, developerModeSettingKey)
});

const mapDispatchToProps = {
  setSetting,
  openAlertDialog
};

export default withLocale(connect(
  mapStateToProps,
  mapDispatchToProps
)(KonamiContainer));
