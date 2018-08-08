import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
// selectors
import { getListOfOutdatedSourceContent } from '../selectors/index';
// actions
import {confirmOnlineAction} from '../actions/OnlineModeConfirmActions';
import {getListOfSourceContentToUpdate, downloadSourceContentUpdates} from '../actions/SourceContentUpdatesActions';
// components
import ContentUpdateDialog from '../components/dialogComponents/ContentUpdateDialog';

/**
 * Renders a dialog displaying a list of new content updates.
 *
 * @class
 *
 * @property {func} translate - the localization function
 * @property {func} onClose - callback when the dialog is closed
 * @property {bool} open - controls whether the dialog is open or closed
 */
class ContentUpdatesDialogContainer extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
    this._handleClose = this._handleClose.bind(this);
    this._startContentUpdateCheck = this._startContentUpdateCheck.bind(this);
    this._handleDownload = this._handleDownload.bind(this);
  }

  componentWillReceiveProps(newProps) {
    const openChanged = newProps.open !== this.props.open;
    console.log(openChanged);
    if(openChanged && newProps.open) {
      const {confirmOnlineAction} = this.props;
      confirmOnlineAction(() => {
        this._startContentUpdateCheck();
      }, ()=> {
        this._handleClose();
      });
    }
  }

  componentDidCatch(error, info) {
    console.error(error, info);
  }

  _handleClose() {
    const {onClose} = this.props;
    onClose();
  }

  _startContentUpdateCheck() {
    const {getListOfSourceContentToUpdate} = this.props;
    getListOfSourceContentToUpdate();
  }

  _handleDownload() {
    const {downloadSourceContentUpdates, onClose} = this.props;
    onClose();
    downloadSourceContentUpdates();
  }

  render () {
    const {open, translate, resources} = this.props;

    if (resources.length > 0)
      return (
        <div>
          <ContentUpdateDialog  open={open}
                                onDownload={this._handleDownload}
                                onClose={this._handleClose}
                                translate={translate}
                                resources={resources} />
        </div>
      );
    else
      return <div/>;
  }
}

ContentUpdatesDialogContainer.propTypes = {
  translate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  resources: PropTypes.array.isRequired,
  confirmOnlineAction: PropTypes.func.isRequired,
  getListOfSourceContentToUpdate: PropTypes.func.isRequired,
  downloadSourceContentUpdates: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  resources: getListOfOutdatedSourceContent(state)
});

const mapDispatchToProps = {
  confirmOnlineAction,
  getListOfSourceContentToUpdate,
  downloadSourceContentUpdates
};

export default connect(mapStateToProps, mapDispatchToProps)(ContentUpdatesDialogContainer);
