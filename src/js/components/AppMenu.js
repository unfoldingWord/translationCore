import React from 'react';
import PropTypes from 'prop-types';
import TranslateIcon from 'material-ui/svg-icons/action/translate';
import FeedbackIcon from 'material-ui/svg-icons/action/question-answer';
import SyncIcon from 'material-ui/svg-icons/notification/sync';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import PopoverMenu from './PopoverMenu';
import MenuItem from 'material-ui/MenuItem';

export default class AppMenu extends React.Component {

  constructor(props) {
    super(props);
    this.handleChangeLocale = this.handleChangeLocale.bind(this);
    this.handleUpdateApp = this.handleUpdateApp.bind(this);
    this.handleFeedback = this.handleFeedback.bind(this);
  }

  componentDidCatch(error, info) {
    console.error(error);
    console.warn(info);
  }

  /**
   * Handles menu clicks to change app locale settings
   */
  handleChangeLocale() {
    // TODO: change the locale
  }

  /**
   * Handles menu clicks to check for app updates
   */
  handleUpdateApp() {
    // TODO: check for app updates
  }

  /**
   * Handles menu clicks to submit feedback
   */
  handleFeedback() {
    // TODO: send feedback
  }

  render() {
    const {variant} = this.props;
    return (
      <PopoverMenu label="Actions"
                   variant={variant}
                   icon={<SettingsIcon/>}>
        <MenuItem onClick={this.handleUpdateApp}
                  primaryText="Check for Software Updates"
                  leftIcon={<SyncIcon/>}/>
        <MenuItem onClick={this.handleFeedback}
                  primaryText="User Feedback"
                  leftIcon={<FeedbackIcon/>}/>
        <MenuItem onClick={this.handleChangeLocale}
                  primaryText="Change User Interface Language"
                  leftIcon={<TranslateIcon/>}/>
      </PopoverMenu>
    );
  }
}
AppMenu.propTypes = {
  variant: PropTypes.string
};
AppMenu.defaultProps = {
  variant: 'primary'
};
