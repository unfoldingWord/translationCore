import React from 'react';
import PropTypes from 'prop-types';
import TranslateIcon from 'material-ui/svg-icons/action/translate';
import FeedbackIcon from 'material-ui/svg-icons/action/question-answer';
import SyncIcon from 'material-ui/svg-icons/notification/sync';
import UpdateIcon from 'material-ui/svg-icons/action/update';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import MenuItem from 'material-ui/MenuItem';
import PopoverMenu from '../components/PopoverMenu';
import LocaleSettingsDialogContainer from './LocaleSettingsDialogContainer';
import FeedbackDialogContainer from './FeedbackDialogContainer';
import SoftwareUpdatesDialog from './SoftwareUpdateDialog';
import SourceContentUpdatesDialogContainer from './SourceContentUpdatesDialogContainer';

const APP_UPDATE = 'app_update';
const CONTENT_UPDATE = 'content_update';
const FEEDBACK = 'feedback';
const APP_LOCALE = 'app_locale';

/**
 * This component renders the global application menu.
 * Items in the menu trigger the display of dialog components.
 *
 * @property {func} translate - the localization function
 * @property {string} [variant=primary] - the style variant of the menu.
 */
class AppMenu extends React.Component {
  constructor(props) {
    super(props);
    this.closeDialog = this.closeDialog.bind(this);
    this.openDialog = this.openDialog.bind(this);
    this.isDialogOpen = this.isDialogOpen.bind(this);

    this.state = {
      dialog: {
        [APP_UPDATE]: false,
        [CONTENT_UPDATE]: false,
        [FEEDBACK]: false,
        [APP_LOCALE]: false,
      },
    };
  }

  componentDidCatch(error, info) {
    console.error(error, info);
  }


  /**
   * Opened the named dialog
   *
   * @private
   * @param {string} dialog
   * @return {function()}
   */
  closeDialog(dialog) {
    return () => {
      this.setState({
        dialog: {
          ...this.state.dialog,
          [dialog]: false,
        },
      });
    };
  }

  /**
   * Opens the named dialog
   *
   * @private
   * @param {string} dialog
   * @return {function()}
   */
  openDialog(dialog) {
    return () => {
      this.setState({
        dialog: {
          ...this.state.dialog,
          [dialog]: true,
        },
      });
    };
  }

  /**
   * Checks if the named dialog is open
   *
   * @private
   * @param {string} dialog
   * @return {bool}
   */
  isDialogOpen(dialog) {
    return this.state.dialog[dialog];
  }

  render() {
    const {
      variant,
      translate,
      orderHelpsByRef,
      setOrderHelpsByRef,
    } = this.props;
    const orderingString = orderHelpsByRef ? translate('order_helps_by_group') : translate('order_helps_by_ref');

    return (
      <div>
        <PopoverMenu label={translate('actions')}
          variant={variant}
          icon={<SettingsIcon/>}>
          <MenuItem onClick={this.openDialog(APP_UPDATE)}
            primaryText={translate('updates.check_for_newer_app')}
            leftIcon={<SyncIcon/>}/>
          <MenuItem onClick={this.openDialog(CONTENT_UPDATE)}
            primaryText={translate('updates.check_for_content_updates')}
            leftIcon={<UpdateIcon/>}/>
          <MenuItem onClick={this.openDialog(FEEDBACK)}
            primaryText={translate('user_feedback')}
            leftIcon={<FeedbackIcon/>}/>
          <MenuItem onClick={() => setOrderHelpsByRef && setOrderHelpsByRef(!orderHelpsByRef)}
            primaryText={orderingString}
            leftIcon={<TranslateIcon/>}/>
          <MenuItem onClick={this.openDialog(APP_LOCALE)}
            primaryText={translate('change_locale')}
            leftIcon={<TranslateIcon/>}/>
        </PopoverMenu>

        <FeedbackDialogContainer open={this.isDialogOpen(FEEDBACK)}
          translate={translate}
          onClose={this.closeDialog(FEEDBACK)}/>

        <LocaleSettingsDialogContainer open={this.isDialogOpen(APP_LOCALE)}
          translate={translate}
          onClose={this.closeDialog(APP_LOCALE)}/>

        <SoftwareUpdatesDialog open={this.isDialogOpen(APP_UPDATE)}
          translate={translate}
          onClose={this.closeDialog(APP_UPDATE)}/>

        <SourceContentUpdatesDialogContainer open={this.isDialogOpen(CONTENT_UPDATE)}
          translate={translate}
          onClose={this.closeDialog(CONTENT_UPDATE)}/>
      </div>

    );
  }
}
AppMenu.propTypes = {
  translate: PropTypes.func.isRequired,
  variant: PropTypes.string,
  orderHelpsByRef: PropTypes.bool,
  setOrderHelpsByRef: PropTypes.func,
};

AppMenu.defaultProps = { variant: 'primary' };

export default AppMenu;
