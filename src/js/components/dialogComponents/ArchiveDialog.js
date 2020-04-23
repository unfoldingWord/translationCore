import React from 'react';
import PropTypes from 'prop-types';
import BaseDialog from './BaseDialog';

/**
 * Displays a confirmation dialog before a project is archived
 *
 * @see {@link BaseDialog} for inner component information
 *
 * @property {func} translate - the localization function
 * @property {bool} open - controls whether the dialog is open or closed
 * @property {func} onArchive - callback when the user confirms.
 * @property {func} onClose - callback when the dialog is closed
 * @property {*} message - the error message
 */
class ArchiveDialog extends React.Component {
  render() {
    const {
      translate, open, onArchive, onClose, message,
    } = this.props;
    return (
      <BaseDialog open={open}
                  primaryLabel={translate('buttons.ok_button')}
                  onSubmit={onArchive}
                  onClose={onClose}
                  title={translate('success')}
                  modal={false}>
        <span id="message">
          {message}
        </span>
      </BaseDialog>
    );
  }
}

ArchiveDialog.propTypes = {
  translate: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  onArchive: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  message: PropTypes.any.isRequired,
};

export default ArchiveDialog;
