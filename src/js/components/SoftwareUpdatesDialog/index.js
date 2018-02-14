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

  componentWillReceiveProps(nextProps) {
    // reset the state when the dialog opens/closes
    if(nextProps.open !== this.props.open) {
      this.setState({
        ...this.initialState
      });
    }
  }

  handleClose() {
    const {onClose} = this.props;
    onClose();
  }

  componentDidCatch(error, info) {
    console.error(error, info);
    this.setState({
      ...this.initialState
    });
  }

  handleDownload(update) {
    this.setState({
      download: update
    });
  }

  render() {
    const {open} = this.props;
    const {download} = this.state;

    if(download) {
      // download dialog
      return <ConnecteDownloadSoftwareUpdateDialog update={download}
                                                   open={open}
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
