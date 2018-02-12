import React from 'react';
import PropTypes from 'prop-types';
import BaseDialog from '../BaseDialog';

export const STATUS_LOADING = 'loading';
export const STATUS_ERROR = 'error';
export const STATUS_UPDATE = 'update_available';
export const STATUS_OK = 'ok';

const makeMessage = (properties) => {
  const {status, update, translate} = properties;
  if(status ===  STATUS_LOADING) {
    return translate('software_update.loading');
  } else if(status === STATUS_UPDATE) {
    const message = translate('software_update.update_available', {
      app: translate('_.app_name'),
      old_version: update.installed_version,
      latest_version: update.latest_version
    });
    const size = Math.round(update.size / 1024 / 1024);
    return <div>
      <p>{message}</p>
      <p>{translate('software_update.size', {size: `${size} MB`})}</p>
    </div>;
  } else if(status === STATUS_ERROR) {
    return translate('software_update.error');
  } else if(status === STATUS_OK) {
    return translate('software_update.up_to_date', {
      app: translate('_.app_name')
    });
  }
};

/**
 * Renders a dialog to check for software updates
 */
export class SoftwareUpdatesDialog extends React.Component {

  render() {
    const {open, translate, update, status, onClose, onSubmit} = this.props;

    const message = makeMessage(this.props);
    const primaryLabel = update ? translate('download') : translate('ok');
    const secondaryLabel = update ? translate('cancel') : null;

    return (
      <BaseDialog title={translate('alert')}
                  open={open}
                  actionsEnabled={status !== STATUS_LOADING}
                  primaryLabel={primaryLabel}
                  secondaryLabel={secondaryLabel}
                  onClose={onClose}
                  onSubmit={onSubmit}>
        {/*loader*/}
        <div id="message">
          {message}
        </div>
      </BaseDialog>
    );
  }
}

SoftwareUpdatesDialog.propTypes = {
  status: PropTypes.string.isRequired,
  translate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  update: PropTypes.shape({
    size: PropTypes.number,
    latest_version: PropTypes.string,
    installed_version: PropTypes.string
  })
};
SoftwareUpdatesDialog.defaultProps = {
  status: STATUS_LOADING
};

export default SoftwareUpdatesDialog;
