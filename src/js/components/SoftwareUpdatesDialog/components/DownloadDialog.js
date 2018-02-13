import React from 'react';
import PropTypes from 'prop-types';
import BaseDialog from '../../BaseDialog';
import LinearProgress from 'material-ui/LinearProgress';

class DownloadDialog extends React.Component {
  render() {
    const {message, size, sizeDownloaded, title, indeterminate, cancelLabel, onCancel} = this.props;

    let completed = sizeDownloaded / size * 100;
    if(completed > 100) {
      completed = 100;
    }
    const mode = indeterminate ? 'indeterminate' : 'determinate';
    return (
      <BaseDialog open={true}
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
  onCancel: PropTypes.func,
  cancelLabel: PropTypes.string,
  indeterminate: PropTypes.bool,
  title: PropTypes.string,
  size: PropTypes.number.isRequired,
  message: PropTypes.any.isRequired,
  sizeDownloaded: PropTypes.number.isRequired
};

export default DownloadDialog;
