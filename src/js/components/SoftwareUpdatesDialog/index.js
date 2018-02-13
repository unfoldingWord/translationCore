import React from 'react';
import PropTypes from 'prop-types';
import ConnectedCheckSoftwareUpdateDialog from './containers/ConnectedCheckSoftwareUpdateDialog';
import ConnecteDownloadSoftwareUpdateDialog from './containers/ConnectedDownloadSoftwareUpdateDialog';

export class ConnectedSoftwareUpdateDialog extends React.Component {

  constructor(props) {
    super(props);
    this.handleDownload = this.handleDownload.bind(this);
    this.handleClose = this.handleClose.bind(this);

    this.initialState = {
      download: null
    };
    this.state = {
      ...this.initialState
    };
  }

  handleClose() {
    const {onClose} = this.props;
    this.setState({
      ...this.initialState
    });
    onClose();
  }

  handleDownload(update) {
    this.setState({
      download: update,
    });
  }

  render() {
    const {open} = this.props;
    const {download} = this.state;

    if(download) {
      // download dialog
      return <ConnecteDownloadSoftwareUpdateDialog update={download}
                                                   onClose={this.handleClose}/>;
    } else {
      // update dialog
      return <ConnectedCheckSoftwareUpdateDialog open={open}
                                                 onClose={this.handleClose}
                                                 onDownload={this.handleDownload}/>;
    }
  }
}

ConnectedSoftwareUpdateDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired
};

export default ConnectedSoftwareUpdateDialog;
