import React from 'react';
import PropTypes from 'prop-types';
import BaseDialog from './BaseDialog';

/**
 * Renders an error dialog
 *
 * @see {@link BaseDialog} for inner component information
 *
 * @property {func} translate - the localization function
 * @property {bool} [open] - controls whether the dialog is open or closed
 * @property {func} [onClose] - callback when the dialog is closed
 * @property {*} message - the error message
 */
class ErrorDialog extends React.Component {
  render() {
    const {
      translate, open, onClose, message,
    } = this.props;
    return (
      <BaseDialog open={open}
        primaryLabel={translate('buttons.ok_button')}
        bodyStyle={{ overflowY: 'auto' }}
        onSubmit={onClose}
        title={translate('error')}
        modal={false}>
        <span id="message">
          {message}
        </span>
      </BaseDialog>
    );
  }
}

ErrorDialog.propTypes = {
  translate: PropTypes.func.isRequired,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  message: PropTypes.any.isRequired,
};

export default ErrorDialog;
