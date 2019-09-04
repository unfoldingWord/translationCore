import React from 'react';
import PropTypes from 'prop-types';
import BaseDialog from './BaseDialog';

/**
 * Renders a success dialog
 *
 * @see {@link BaseDialog} for inner component information
 *
 * @property {func} translate - the localization function
 * @property {bool} [open] - controls whether the dialog is open or closed
 * @property {func} [onClose] - callback when the dialog is closed
 * @property {*} message - the error message
 */
class SuccessDialog extends React.Component {
  render() {
    const {
      translate, open, onClose, message,
    } = this.props;
    return (
      <BaseDialog open={open}
        primaryLabel={translate('buttons.ok_button')}
        onSubmit={onClose}
        title={translate('success')}
        modal={false}>
        <span id="message">
          {message}
        </span>
      </BaseDialog>
    );
  }
}

SuccessDialog.propTypes = {
  translate: PropTypes.func.isRequired,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  message: PropTypes.any.isRequired,
};

export default SuccessDialog;
