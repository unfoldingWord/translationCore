import React from 'react';
import PropTypes from 'prop-types';
import BaseDialog from '../../BaseDialog';
import LinearProgress from 'material-ui/LinearProgress';

class DownloadDialog extends React.Component {
  render() {
    const {message, size, open, sizeDownloaded, title, indeterminate, cancelLabel, onCancel} = this.props;

    let completed = sizeDownloaded / size * 100;
    if(completed > 100) {
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
  sizeDownloaded: PropTypes.number.isRequired
};

export default DownloadDialog;
