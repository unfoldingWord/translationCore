import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// selectors
import { getListOfOutdatedSourceContent } from '../selectors/index';
// actions
import { confirmOnlineAction } from '../actions/OnlineModeConfirmActions';
import { getListOfSourceContentToUpdate, downloadSourceContentUpdates } from '../actions/SourceContentUpdatesActions';
// components
import SourceContentUpdateDialog from '../components/dialogComponents/SourceContentUpdateDialog';

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
    this.state = { selectedItems: [] };
    this._handleClose = this._handleClose.bind(this);
    this._startContentUpdateCheck = this._startContentUpdateCheck.bind(this);
    this._handleDownload = this._handleDownload.bind(this);
    this._handleAllListItemsSelection = this._handleAllListItemsSelection.bind(this);
    this._handleListItemSelection = this._handleListItemSelection.bind(this);
  }

  componentWillReceiveProps(newProps) {
    const openChanged = newProps.open !== this.props.open;

    if (openChanged && newProps.open) {
      const { confirmOnlineAction } = this.props;

      confirmOnlineAction(() => {
        this._startContentUpdateCheck();
      }, () => {
        this._handleClose();
      });
    }
  }

  componentDidCatch(error, info) {
    console.error(error, info);
  }

  _handleClose() {
    const { onClose } = this.props;
    this.setState({ selectedItems: [] });
    onClose();
  }

  _handleAllListItemsSelection() {
    const { resources } = this.props;
    const availableLanguageIds = resources.map(resource => resource.languageId);
    const allChecked = JSON.stringify(availableLanguageIds) === JSON.stringify(this.state.selectedItems);

    if (allChecked) {
      this.setState({ selectedItems: [] });
    } else {
      this.setState({ selectedItems: availableLanguageIds });
    }
  }

  _handleListItemSelection(languageName) {
    const newSelectedItems = Array.from(this.state.selectedItems);

    if (newSelectedItems.includes(languageName)) {
      const selectedItems = newSelectedItems.filter((selectedItem) => selectedItem !== languageName);
      this.setState({ selectedItems });
    } else {
      newSelectedItems.push(languageName);
      this.setState({ selectedItems: newSelectedItems });
    }
  }

  _startContentUpdateCheck() {
    const { getListOfSourceContentToUpdate, onClose } = this.props;
    getListOfSourceContentToUpdate(onClose);
  }

  _handleDownload() {
    const { downloadSourceContentUpdates, onClose } = this.props;
    this.setState({ selectedItems: [] });
    onClose();
    downloadSourceContentUpdates(this.state.selectedItems);
  }

  render() {
    const {
      open, translate, resources,
    } = this.props;

    console.log({ resources });

    if (resources.length > 0) {
      return (
        <div>
          <SourceContentUpdateDialog
            open={open}
            onDownload={this._handleDownload}
            onClose={this._handleClose}
            selectedItems={this.state.selectedItems}
            handleListItemSelection={this._handleListItemSelection}
            handleAllListItemsSelection={this._handleAllListItemsSelection}
            translate={translate}
            resources={resources} />
        </div>
      );
    } else {
      return <div/>;
    }
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

const mapStateToProps = (state) => ({ resources: getListOfOutdatedSourceContent(state) });

const mapDispatchToProps = {
  confirmOnlineAction,
  getListOfSourceContentToUpdate,
  downloadSourceContentUpdates,
};

export default connect(mapStateToProps, mapDispatchToProps)(ContentUpdatesDialogContainer);
