import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
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
    this.state = { selectedItems: [], languages: {} };
    this._handleClose = this._handleClose.bind(this);
    this._startContentUpdateCheck = this._startContentUpdateCheck.bind(this);
    this._handleDownload = this._handleDownload.bind(this);
    this._handleAllListItemsSelection = this._handleAllListItemsSelection.bind(this);
    this._handleListItemSelection = this._handleListItemSelection.bind(this);
    this.onSubitemSelection = this.onSubitemSelection.bind(this);
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

  _handleListItemSelection({ languageId, resources }) {
    console.log({ languageId, resources }); // TODO:
    const _languages = { ...this.state.languages };
    const languageKeys = Object.keys(_languages);

    if (languageKeys.includes(languageId)) {
      delete _languages[languageId];
      this.setState({ languages: _languages });
    } else {
      _languages[languageId] = resources;
      this.setState({ languages: _languages });
    }
  }

  onSubitemSelection(subitem, languageId) {
    const _languages = Object.assign({}, this.state.languages);
    console.log('_languages', _languages);
    console.log('languageId', languageId);
    const languageResources = _languages[languageId] ? Array.from(_languages[languageId]) : [];
    const found = _.find(languageResources, subitem);
    console.log({ languageResources });

    if (found) {
      const _languageResources = _.filter(languageResources, (o) => !_.isEqual(o, subitem));
      _languages[languageId] = _languageResources;
      console.log({ _languageResources });
      this.setState({ languages: _languages });
    } else {
      console.log({
        languageResources, languageId, array: typeof languageResources,
      });
      _languages[languageId] = languageResources.push(subitem);
      console.log({ ff: _languages[languageId] });

      this.setState({ languages: _languages });
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

    console.log({ resources, s: this.state.languages });

    if (resources.length > 0) {
      return (
        <div>
          <SourceContentUpdateDialog
            open={open}
            translate={translate}
            resources={resources}
            onClose={this._handleClose}
            onDownload={this._handleDownload}
            selectedItems={this.state.selectedItems}
            onSubitemSelection={this.onSubitemSelection}
            selectedLanguageResources={this.state.languages}
            handleListItemSelection={this._handleListItemSelection}
            handleAllListItemsSelection={this._handleAllListItemsSelection}
          />
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
