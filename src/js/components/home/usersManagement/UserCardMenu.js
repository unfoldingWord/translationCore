import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';
import Popover from 'material-ui/Popover/Popover';
import LocaleSettingsDialog from './LocaleSettingsDialog';

export default class UserCardMenu extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }

  handleTouchTap(e) {
    e.preventDefault();
    this.setState({
      open: true,
      anchorEl: e.currentTarget
    });
  }

  handleRequestClose() {
    this.setState({
      open: false
    });
  }

  render() {
    const {
      translate,
      languages,
      localeSettings,
      closeLocaleScreen,
      openLocaleScreen,
      setLocaleLanguage,
      currentLanguage
    } = this.props;

    const menuItemStyle = { padding: '4px', display: 'flex', margin: '4px 4px 0 0' };
    const glyphStyle = { fontSize: 'large', margin: '0 14px 0 4px' };

    return (
      <div>
        <LocaleSettingsDialog open={localeSettings.open}
                              onClose={closeLocaleScreen}
                              languages={languages}
                              currentLanguage={currentLanguage}
                              setActiveLanguage={setLocaleLanguage}
                              {...this.props}/>
        <div style={{ cursor: 'pointer' }}>
          <div onTouchTap={(e) => { this.handleTouchTap(e) }}>
            <Glyphicon glyph="option-vertical" style={{ fontSize: "large" }} />
          </div>
          <Popover
            style={{ cursor: 'pointer' }}
            open={this.state.open}
            anchorEl={this.state.anchorEl}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            targetOrigin={{ horizontal: 'right', vertical: 'top' }}
            onRequestClose={() => { this.handleRequestClose() }}
          >
            <div style={{ margin: '4px' }} >
              <div
                style={menuItemStyle}
                onClick={() => {
                  this.handleRequestClose();
                  openLocaleScreen();
                }}
              >
                <Glyphicon glyph='globe' style={glyphStyle} />
                <div>{translate('home.users_management.user_card_menu.change_locale')}</div>
              </div>
            </div>
          </Popover>
        </div>
      </div>

    );
  }
}

UserCardMenu.propTypes = {
  user: PropTypes.any.isRequired,
  closeLocaleScreen: PropTypes.func.isRequired,
  setLocaleLanguage: PropTypes.func.isRequired,
  openLocaleScreen: PropTypes.func.isRequired,
  localeSettings: PropTypes.object.isRequired,
  translate: PropTypes.func,
  currentLanguage: PropTypes.string.isRequired,
  languages: PropTypes.array.isRequired
};
