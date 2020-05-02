import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ipcRenderer } from 'electronite';
import DownloadDialog from '../../components/dialogComponents/DownloadDialog';
import { getTranslate } from '../../selectors/index';

/**
 * Renders a dialog to download the software update.
 * This component will begin downloading as soon as it is mounted.
 *
 * @see {@link DownloadDialog} for component details
 *
 * @property {bool} open - controls whether the dialog is open or closed
 * @property {func} translate - the localization function
 * @property {func} onClose - callback when the dialog is closed
 * @property {object} update - the available update
 */
class DownloadUpdateDialogContainer extends React.Component {
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
      error: false,
    };
    this.state = { ...this.initialState };
  }

  componentDidCatch(error, info) {
    const { onClose } = this.props;
    console.error(error, info);
    onClose();
  }

  /**
   * Handles the download startup.
   * This collects the download's cancel token in order to allow users to manually cancel the download
   * @param {*} event - the electron ipcRenderer event
   * @param {string} downloadId - the download id.
   * @private
   */
  _onDownloadStarted(event, downloadId) {
    this.setState({ cancelToken:downloadId });
  }

  /**
   * Handles progress events from the download
   * @param {*} event - the electron ipcRenderer event
   * @param {float} progress - the download progress.
   * @private
   */
  _onDownloadProgress(event, progress) {
    const { update } = this.props;

    this.setState({
      indeterminate: false,
      headers: { Accept: update.content_type },
      downloaded: update.size * progress,
    });
  }

  /**
   * Handles a successful download
   * @private
   */
  _onDownloadSuccess() {
    this._handleClose();
  }

  /**
   * Handles download errors
   * @param {*} event - the electron ipcRenderer event
   * @param {*} error
   * @private
   */
  _onDownloadError(event, error) {
    console.error('Download error', error);
    this.setState({
      ...this.initialState,
      error: true,
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
    const { update } = this.props;

    this.setState({
      ...this.initialState,
      indeterminate: true,
    });

    ipcRenderer.send('download', {
      filename: update.name,
      url: update.url,
    });

    ipcRenderer.once('download-started', this._onDownloadStarted);
    ipcRenderer.once('download-success', this._onDownloadSuccess);
    ipcRenderer.on('download-progress', this._onDownloadProgress);
    ipcRenderer.once('download-error', this._onDownloadError);
  }

  /**
   * Cancels the current download
   * @private
   */
  _cancelDownload() {
    const { cancelToken } = this.state;

    if (cancelToken) {
      ipcRenderer.send('download-cancel', { id: cancelToken });
    }
  }

  /**
   * Prepares to close the dialog
   * @private
   */
  _handleClose() {
    const { onClose } = this.props;
    this._cancelDownload();
    onClose();
  }

  render() {
    const {
      translate, update, open,
    } = this.props;
    const {
      downloaded, indeterminate, total, error,
    } = this.state;
    let message = (
      <div>
        <p>
          {translate('updates.downloading_version', { version: update.version })}
        </p>
        <p>
          {Math.round(downloaded/1024/1025)}/{Math.round(total/1024/1025)} MB
        </p>
      </div>
    );
    const title = translate('updates.downloading');

    if (error) {
      message = (
        <p>
          {translate('updates.download_error')}
        </p>
      );
    }
    return <DownloadDialog message={message}
      size={total}
      open={open}
      indeterminate={indeterminate}
      sizeDownloaded={downloaded}
      cancelLabel={translate('buttons.cancel_button')}
      onCancel={this._handleClose}
      title={title}/>;
  }
}

DownloadUpdateDialogContainer.propTypes = {
  open: PropTypes.bool.isRequired,
  translate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  update: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({ translate: getTranslate(state) });
export default connect(mapStateToProps)(DownloadUpdateDialogContainer);
