import React from 'react';
import PropTypes from 'prop-types';
import BaseDialog from './BaseDialog';

export const STATUS_LOADING = 'loading';
export const STATUS_ERROR = 'error';
export const STATUS_UPDATE = 'update_available';
export const STATUS_OK = 'ok';

const makeMessage = (properties) => {
  const {
    status, update, translate,
  } = properties;

  if (status === STATUS_LOADING) {
    return translate('updates.checking_for_app');
  } else if (status === STATUS_UPDATE) {
    const message = translate('updates.update_available', {
      app: translate('_.app_name'),
      old_version: update.installed_version,
      new_version: update.latest_version,
    });
    const size = Math.round(update.size / 1024 / 1024);
    return <div>
      <p>{message}</p>
      <p>{translate('updates.file_size', { file_size: `${size} MB` })}</p>
    </div>;
  } else if (status === STATUS_ERROR) {
    return translate('updates.unable_to_check');
  } else if (status === STATUS_OK) {
    return translate('running_latest_version', { app: translate('_.app_name') });
  }
};

/**
 * This component displays feedback to the user about available software updates.
 *
 * @see {@link SoftwareUpdateDialogContainer} for usage in a container
 *
 * @property {string} status - the dialog status
 * @property {func} translate - localization function
 * @property {func} onClose - callback when the dialog is closed
 * @property {func} onSubmit - callback when the update is accepted
 * @property {bool} open - controls whether the dialog is open or closed
 * @property {object} [update] - the available update
 */
class SoftwareUpdateDialog extends React.Component {
  render() {
    const {
      open, translate, update, status, onClose, onSubmit,
    } = this.props;

    const message = makeMessage(this.props);
    const primaryLabel = update ? translate('updates.download') : translate('buttons.ok_button');
    const secondaryLabel = update ? translate('buttons.cancel_button') : null;

    return (
      <BaseDialog title={translate('alert')}
        open={open}
        actionsEnabled={status !== STATUS_LOADING}
        primaryLabel={primaryLabel}
        secondaryLabel={secondaryLabel}
        onClose={onClose}
        onSubmit={onSubmit}>
        <div id="message">
          {message}
        </div>
      </BaseDialog>
    );
  }
}

SoftwareUpdateDialog.propTypes = {
  status: PropTypes.string.isRequired,
  translate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  update: PropTypes.shape({
    size: PropTypes.number.isRequired,
    latest_version: PropTypes.string.isRequired,
    installed_version: PropTypes.string.isRequired,
  }),
};
SoftwareUpdateDialog.defaultProps = { status: STATUS_LOADING };

export default SoftwareUpdateDialog;