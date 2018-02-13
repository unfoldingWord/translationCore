import React from 'react';
import PropTypes from 'prop-types';
import DownloadDialog from '../components/DownloadDialog';
import axios from 'axios';
import { getTranslate } from '../../../selectors';
import {connect} from 'react-redux';
import fileDownload from 'react-file-download';

/**
 * Renders a dialog to download the software update.
 * This component will begin downloading as soon as it is mounted.
 */
class ConnectedDownloadSoftwareUpdateDialog extends React.Component {

  constructor(props) {
    super(props);
    this.handleClose = this.handleClose.bind(this);
    this.cancelDownload = this.cancelDownload.bind(this);
    this.state = {
      downloaded: 0,
      indeterminate: true,
      total: props.update.size,
      cancelToken: null
    };
  }

  componentDidCatch(error, info) {
    const {onClose} = this.props;
    console.error(error, info);
    onClose();
  }

  componentWillUnmount() {
    // TODO: cancel download
  }

  componentDidMount() {
    const {update} = this.props;
    const source = axios.CancelToken.source();
    const request = {
      url: update.url,
      method: 'get',
      onDownloadProgress: event => {
        this.setState({
          ...this.state,
          indeterminate: false,
          downloaded: event.loaded,
          total: event.total
        });
      },
      cancelToken: source.token
    };

    this.setState({
      ...this.state,
      cancelToken: source
    });

    axios(request).then(response => {
      this.setState({
        ...this.state,
        indeterminate: true
      });
      return fileDownload(response.data, update.name);
    }).then(() => {
      this.handleClose();
    }).catch(error => {
      if(axios.isCancel(error)) {
        this.handleClose();
      } else {
        // TODO: display error to the user
        console.error('Failed to download app update', error);
        this.handleClose();
      }
    });
  }

  cancelDownload() {
    const {cancelToken} = this.state;
    if(cancelToken) {
      cancelToken.cancel('Operation canceled by user');
    }
  }

  handleClose() {
    const {onClose} = this.props;
    this.cancelDownload();
    onClose();
  }

  render() {
    const {translate, update} = this.props;
    const {downloaded, indeterminate, total} = this.state;
    const message = (
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
    return <DownloadDialog message={message}
                           size={total}
                           indeterminate={indeterminate}
                           sizeDownloaded={downloaded}
                           cancelLabel={translate('cancel')}
                           onCancel={this.cancelDownload}
                           title={title}/>;
  }
}

ConnectedDownloadSoftwareUpdateDialog.propTypes = {
  translate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  update: PropTypes.object.isRequired
};
const mapStateToProps = (state) => ({
  translate: getTranslate(state)
});
export default connect(mapStateToProps)(ConnectedDownloadSoftwareUpdateDialog);
