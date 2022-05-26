import React from 'react';
import PropTypes from 'prop-types';
import SoftwareUpdateDialogContainer from './SoftwareUpdateDialogContainer';
import DownloadUpdateDialogContainer from './DownloadUpdateDialogContainer';

/**
 * This container controls the software update dialogs.
 *
 * @see {@link SoftwareUpdateDialogContainer} displayed initially while checking for updates
 * @see {@link DownloadUpdateDialogContainer} displayed while downloading
 *
 * @property {bool} open - controls whether the dialog is open or closed
 * @property {func} translate - the localization function
 * @property {func} onClose - callback when the dialog is closed
 */
class SoftwareUpdateContainer extends React.Component {
  constructor(props) {
    super(props);
    this.handleDownload = this.handleDownload.bind(this);
    this.handleClose = this.handleClose.bind(this);

    this.initialState = { download: null };
    this.state = { ...this.initialState };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // reset the state when the dialog opens/closes
    if (nextProps.open !== this.props.open) {
      this.setState({ ...this.initialState });
    }
  }

  handleClose() {
    const { onClose } = this.props;
    onClose();
  }

  componentDidCatch(error, info) {
    console.error(error, info);
    this.setState({ ...this.initialState });
  }

  handleDownload(update) {
    this.setState({ download: update });
  }

  render() {
    const { open, translate } = this.props;
    const { download } = this.state;

    if (download) {
      // download dialog
      return <DownloadUpdateDialogContainer update={download}
        open={open}
        onClose={this.handleClose}/>;
    } else {
      // update dialog
      return <SoftwareUpdateDialogContainer open={open}
        onClose={this.handleClose}
        translate={translate}
        onDownload={this.handleDownload}/>;
    }
  }
}

SoftwareUpdateContainer.propTypes = {
  onClose: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

export default SoftwareUpdateContainer;
