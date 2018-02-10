import React from 'react';
import PropTypes from 'prop-types';
import BaseDialog from './BaseDialog';
import {connect} from 'react-redux';
import { getTranslate } from '../selectors';
import appPackage from '../../../package';

const makeMessage = (actions, translate) => {
  const {loading, update} = actions;
  if(loading) {
    return translate('software_update.loading');
  } else if(update) {
    const message = translate('software_update.update_available', {
      app: translate('_.app_name'),
      old_version: appPackage.version,
      new_version: '0.0.0'
    });
    return <div>
      <p>{message}</p>
      <p>{translate('software_update.size', {size: '266 MB'})}</p>
    </div>;
  } else {
    return translate('software_update.up_to_date');
  }
};

class SoftwareUpdatesDialog extends React.Component {

  constructor(props) {
    super(props);
    this.handleClose = this.handleClose.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      loading: true
    };
  }

  handleClose() {
    const {onClose} = this.props;
    this.setState({
      ...this.initialState
    });
    onClose();
  }

  handleSubmit() {

  }

  render() {
    const {open, translate} = this.props;
    const {loading, update} = this.state;

    const message = makeMessage(this.state, translate);
    const primaryLabel = update ? translate('download') : translate('ok');
    const secondaryLabel = update ? translate('cancel') : null;

    return (
      <BaseDialog title={translate('alert')}
                  open={open}
                  actionsEnabled={!loading}
                  primaryLabel={primaryLabel}
                  secondaryLabel={secondaryLabel}
                  onClose={this.handleClose}
                  onSubmit={this.handleSubmit}>
        {/*loader*/}
        {message}
      </BaseDialog>
    );
  }
}

SoftwareUpdatesDialog.propTypes = {
  translate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired
};

const mapStateToProps = (state) => ({
  translate: getTranslate(state)
});

export default connect(mapStateToProps)(SoftwareUpdatesDialog);
