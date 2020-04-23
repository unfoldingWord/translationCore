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
 */
class ArchiveDialog extends React.Component {
  render() {
    const {
      translate, open, onArchive, onClose,
    } = this.props;
    return (
      <BaseDialog open={open}
                  primaryLabel={translate('project.archive_project')}
                  onSubmit={onArchive}
                  onClose={onClose}
                  title={translate('alert')}
                  modal={false}>
        <span id="message">
          {translate('project.confirm_archive')}
        </span>
      </BaseDialog>
    );
  }
}

ArchiveDialog.propTypes = {
  translate: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  onArchive: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default ArchiveDialog;
