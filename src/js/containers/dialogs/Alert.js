import React from 'react';
import PropTypes from 'prop-types';
import IgnorableAlert from '../../components/dialogComponents/IgnorableAlert';
import { withLocale } from '../../helpers/localeHelpers';

/**
 * A generic alert container that injects some default localization.
 */
class Alert extends React.Component {
  render() {
    const {
      children,
      translate,
      onCancel,
      onConfirm,
      onIgnore,
      confirmText,
      cancelText,
      open,
    } = this.props;

    const title = translate('alert');
    const ignoreText = translate('do_not_show_again');

    const confirmButtonText = confirmText ? confirmText : translate('buttons.ok_button');
    const cancelButtonText = cancelText ? cancelText : translate('buttons.cancel_button');

    return (
      <IgnorableAlert
        title={title}
        confirmText={confirmButtonText}
        onConfirm={onConfirm}
        cancelText={cancelButtonText}
        onCancel={onCancel}
        ignoreText={ignoreText}
        onIgnore={onIgnore}
        open={open}>
        {children}
      </IgnorableAlert>
    );
  }
}

Alert.propTypes = {
  children: PropTypes.any.isRequired,
  translate: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onIgnore: PropTypes.func,
  onCancel: PropTypes.func,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  open: PropTypes.bool,
};

Alert.defaultProps = { open: true };

export default withLocale(Alert);
