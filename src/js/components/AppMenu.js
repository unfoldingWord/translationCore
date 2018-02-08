import React from 'react';
import PropTypes from 'prop-types';
import TranslateIcon from 'material-ui/svg-icons/action/translate';
import FeedbackIcon from 'material-ui/svg-icons/action/question-answer';
import SyncIcon from 'material-ui/svg-icons/notification/sync';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import PopoverMenu from './PopoverMenu';
import MenuItem from 'material-ui/MenuItem';
import {withLocale} from './Locale';
import LocaleSettingsDialog from './LocaleSettingsDialog';
import FeedbackDialog from './FeedbackDialog';

class AppMenu extends React.Component {

  constructor(props) {
    super(props);
    this.setLocaleOpen = this.setLocaleOpen.bind(this);
    this.handleUpdateApp = this.handleUpdateApp.bind(this);
    this.setFeedbackOpen = this.setFeedbackOpen.bind(this);

    this.state = {
      localeOpen: false,
      feedbackOpen: false
    };
  }

  componentDidCatch(error, info) {
    console.error(error);
    console.warn(info);
  }

  /**
   * Handles menu clicks to change app locale settings
   * @param {bool} isOpen
   */
  setLocaleOpen(isOpen) {
    this.setState({
      localeOpen: isOpen
    });
  }


  /**
   * Handles menu clicks to check for app updates
   */
  handleUpdateApp() {
    // TODO: check for app updates
  }

  /**
   * Handles menu clicks to submit feedback
   * @param {bool} isOpen
   */
  setFeedbackOpen(isOpen) {
    this.setState({
      feedbackOpen: isOpen
    });
  }

  render() {
    const {variant, translate} = this.props;
    const {localeOpen, feedbackOpen} = this.state;

    return (
      <div>
        <PopoverMenu label={translate('app_menu.actions')}
                     variant={variant}
                     icon={<SettingsIcon/>}>
          <MenuItem onClick={this.handleUpdateApp}
                    primaryText={translate('app_menu.check_app_updates')}
                    leftIcon={<SyncIcon/>}/>
          <MenuItem onClick={() => this.setFeedbackOpen(true)}
                    primaryText={translate('app_menu.user_feedback')}
                    leftIcon={<FeedbackIcon/>}/>
          <MenuItem onClick={() => this.setLocaleOpen(true)}
                    primaryText={translate('app_menu.change_app_locale')}
                    leftIcon={<TranslateIcon/>}/>
        </PopoverMenu>
        <FeedbackDialog open={feedbackOpen}
                        translate={translate}
                        onClose={() => this.setFeedbackOpen(false)}/>
        <LocaleSettingsDialog open={localeOpen}
                              onClose={() => this.setLocaleOpen(false)}/>
      </div>

    );
  }
}
AppMenu.propTypes = {
  translate: PropTypes.func,
  variant: PropTypes.string
};
AppMenu.defaultProps = {
  variant: 'primary'
};


export default withLocale(AppMenu);
