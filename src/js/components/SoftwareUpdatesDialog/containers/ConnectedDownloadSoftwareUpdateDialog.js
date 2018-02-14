import React from 'react';
import PropTypes from 'prop-types';
import DownloadDialog from '../components/DownloadDialog';
import { getTranslate } from '../../../selectors';
import {connect} from 'react-redux';
import { ipcRenderer } from 'electron';

/**
 * Renders a dialog to download the software update.
 * This component will begin downloading as soon as it is mounted.
 */
class ConnectedDownloadSoftwareUpdateDialog extends React.Component {

  constructor(props) {
    super(props);
    this._handleClose = this._handleClose.bind(this);
    this._cancelDownload = this._cancelDownload.bind(this);
    this._onDownloadStarted = this._onDownloadStarted.bind(this);
    this._onDownloadProgress = this._onDownloadProgress.bind(this);
    this._onDownloadSuccess = this._onDownloadSuccess.bind(this);
    this._onDownloadError = this._onDownloadError.bind(this);
    this.initialState = {
      downloaded: 0,
      indeterminate: true,
      total: props.update.size,
      cancelToken: null,
      error: false
    };
    this.state = {
      ...this.initialState
    };
  }

  componentDidCatch(error, info) {
    const {onClose} = this.props;
    console.error(error, info);
    onClose();
  }

  _onDownloadStarted(event, downloadId) {
    this.setState({
      ...this.state,
      cancelToken:downloadId
    });
  }

  _onDownloadProgress(event, progress) {
    const {update} = this.props;
    this.setState({
      ...this.state,
      indeterminate: false,
      headers: {
        Accept: update.content_type
      },
      downloaded: update.size * progress
    });
  }

  _onDownloadSuccess() {
    this._handleClose();
  }

  _onDownloadError(event, error) {
    console.error('Download error', error);
    this.setState({
      ...this.initialState,
      error: true
    });
  }

  componentWillUnmount() {
    ipcRenderer.removeListener('download-started', this._onDownloadStarted);
    ipcRenderer.removeListener('download-success', this._onDownloadSuccess);
    ipcRenderer.removeListener('download-progress', this._onDownloadProgress);
    ipcRenderer.removeListener('download-error', this._onDownloadError);
    this._cancelDownload();
  }

  componentDidMount() {
    const {update} = this.props;

    this.setState({
      ...this.initialState,
      indeterminate: true
    });

    ipcRenderer.send('download', {
      filename: update.name,
      url: update.url
    });

    ipcRenderer.once('download-started', this._onDownloadStarted);
    ipcRenderer.once('download-success', this._onDownloadSuccess);
    ipcRenderer.on('download-progress', this._onDownloadProgress);
    ipcRenderer.once('download-error', this._onDownloadError);
  }

  _cancelDownload() {
    const {cancelToken} = this.state;
    if(cancelToken) {
      ipcRenderer.send('download-cancel', {id: cancelToken});
    }
  }

  _handleClose() {
    const {onClose} = this.props;
    this._cancelDownload();
    onClose();
  }

  render() {
    const {translate, update, open} = this.props;
    const {downloaded, indeterminate, total, error} = this.state;
    let message = (
      <div>
        <p>
          {translate('software_update.downloading_version', {
            version: update.version
          })}
        </p>
        <p>
          {Math.round(downloaded/1024/1025)}/{Math.round(total/1024/1025)} MB
        </p>
      </div>
    );
    const title = translate('software_update.downloading');
    if(error) {
      message = (
        <p>
          {translate('software_update.download_error')}
        </p>
      );
    }
    return <DownloadDialog message={message}
                           size={total}
                           open={open}
                           indeterminate={indeterminate}
                           sizeDownloaded={downloaded}
                           cancelLabel={translate('cancel')}
                           onCancel={this._handleClose}
                           title={title}/>;
  }
}

ConnectedDownloadSoftwareUpdateDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  translate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  update: PropTypes.object.isRequired
};
const mapStateToProps = (state) => ({
  translate: getTranslate(state)
});
export default connect(mapStateToProps)(ConnectedDownloadSoftwareUpdateDialog);
