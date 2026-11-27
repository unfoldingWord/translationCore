import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// actions
import { confirmOnlineAction } from '../actions/OnlineModeConfirmActions';
import {
  checkForModelUpdates,
  downloadModelUpdates,
  formatBytes,
} from '../actions/ModelUpdatesActions';
// components
import ModelUpdateDialog from '../components/dialogComponents/ModelUpdateDialog';

/**
 * When opened, checks the AI models in ~/translationCore/models against the release, and lists the missing or
 * changed ones so the user can pick which to download.
 *
 * @class
 *
 * @property {func} translate - the localization function
 * @property {func} onClose - callback when the dialog is closed
 * @property {bool} open - controls whether the dialog is open or closed
 */
class ModelUpdatesDialogContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = { models: [], selectedModels: [] };
    this._handleClose = this._handleClose.bind(this);
    this._handleDownload = this._handleDownload.bind(this);
    this._handleSelectAll = this._handleSelectAll.bind(this);
    this._handleModelSelection = this._handleModelSelection.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.open && !prevProps.open) {
      const { confirmOnlineAction, checkForModelUpdates } = this.props;

      confirmOnlineAction(() => {
        checkForModelUpdates(
          (models) => this.setState({ models, selectedModels: models.map(model => model.name) }),
          this._handleClose,
        );
      }, this._handleClose);
    }
  }

  componentDidCatch(error, info) {
    console.error(error, info);
  }

  _handleClose() {
    this.setState({ models: [], selectedModels: [] });
    this.props.onClose();
  }

  _handleSelectAll() {
    const { models, selectedModels } = this.state;
    const allChecked = selectedModels.length === models.length;
    this.setState({ selectedModels: allChecked ? [] : models.map(model => model.name) });
  }

  _handleModelSelection(name) {
    const { selectedModels } = this.state;

    this.setState({
      selectedModels: selectedModels.includes(name) ?
        selectedModels.filter(selected => selected !== name) :
        [...selectedModels, name],
    });
  }

  _handleDownload() {
    const { models, selectedModels } = this.state;
    const toDownload = models.filter(model => selectedModels.includes(model.name));
    this._handleClose();
    this.props.downloadModelUpdates(toDownload);
  }

  render() {
    const { open, translate } = this.props;
    const { models, selectedModels } = this.state;

    if (!models.length) {
      return <div/>;
    }

    return (
      <ModelUpdateDialog
        open={open}
        models={models}
        translate={translate}
        selectedModels={selectedModels}
        onModelSelection={this._handleModelSelection}
        onSelectAll={this._handleSelectAll}
        onDownload={this._handleDownload}
        onClose={this._handleClose}
        formatBytes={formatBytes}
      />
    );
  }
}

ModelUpdatesDialogContainer.propTypes = {
  translate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  confirmOnlineAction: PropTypes.func.isRequired,
  checkForModelUpdates: PropTypes.func.isRequired,
  downloadModelUpdates: PropTypes.func.isRequired,
};

const mapDispatchToProps = {
  confirmOnlineAction,
  checkForModelUpdates,
  downloadModelUpdates,
};

export default connect(null, mapDispatchToProps)(ModelUpdatesDialogContainer);
