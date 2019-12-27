import React from 'react';
import PropTypes from 'prop-types';
import LinearProgress from 'material-ui/LinearProgress';
import BaseDialog from './BaseDialog';

/**
 * This is a generic download dialog.
 * You should wrap this in a container to provide the actual download functionality.
 * This is simply the UI.
 *
 * @see {@link BaseDialog} for inner component information
 *
 * @property {bool} [open] - controls whether the dialog is open or closed
 * @property {func} [onCancel] - callback when the dialog is closed
 * @property {string} [cancelLabel]
 * @property {bool} [indeterminate] -
 * @property {string} [title] - the title of the dialog
 * @property {number} size - the total size in bytes of the file being downloaded
 * @property {*} message - the message to display above the progress bar
 * @property {number} sizeDownloaded - the size in bytes that have been downloaded
 */
class DownloadDialog extends React.Component {
  render() {
    const {
      message, size, open, sizeDownloaded, title, indeterminate, cancelLabel, onCancel,
    } = this.props;

    let completed = sizeDownloaded / size * 100;

    if (completed > 100) {
      completed = 100;
    }

    const mode = indeterminate ? 'indeterminate' : 'determinate';
    return (
      <BaseDialog open={open}
        secondaryLabel={cancelLabel}
        onClose={onCancel}
        title={title}
        modal={false}>
        {message}
        <LinearProgress mode={mode} value={completed}/>
      </BaseDialog>
    );
  }
}

DownloadDialog.propTypes = {
  open: PropTypes.bool,
  onCancel: PropTypes.func,
  cancelLabel: PropTypes.string,
  indeterminate: PropTypes.bool,
  title: PropTypes.string,
  size: PropTypes.number.isRequired,
  message: PropTypes.any.isRequired,
  sizeDownloaded: PropTypes.number.isRequired,
};

export default DownloadDialog;
