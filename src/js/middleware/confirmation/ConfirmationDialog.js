// see documentation in confirmationMiddleware.js for details how to launch

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withLocale } from '../../helpers/localeHelpers';
import IgnorableAlert from '../../components/dialogComponents/IgnorableAlert';
import {
  approveConfirmation, getNextConfirmation, rejectConfirmation,
} from './confirmationMiddleware';

/**
 * Keeps the most recent non-null value of a prop.
 *
 * This is useful for dialog close animations where the controlling prop may be
 * cleared before the dialog has fully unmounted. Returning the last meaningful
 * value prevents visible content from briefly disappearing while the dialog is
 * closing.
 *
 * @param {*} prop - The incoming prop value to stabilize.
 * @returns {*} The latest non-null prop value.
 */
function useStableProp(prop) {
  const [stableProp, setStableProp] = useState(prop);

  useEffect(() => {
    if (prop !== null) {
      setStableProp(prop);
    }
  }, [prop]);
  return stableProp;
}

/**
 * Displays queued confirmation requests from Redux in an application-level dialog.
 *
 * The component reads the next pending confirmation from the configured state
 * slice and renders it through {@link IgnorableAlert}. When the user confirms,
 * the original action stored in the confirmation payload is approved. When the
 * user cancels, the full confirmation object is rejected so the middleware can
 * resolve or discard it appropriately.
 *
 * The dialog can be mounted once near the application root and only requires a
 * `stateKey` prop to identify the reducer slice containing confirmation state.
 *
 * @param {Object} props - Component props.
 * @param {Object|null} props.confirmation - The next pending confirmation request.
 * @param {Function} props.approve - Dispatches approval for the pending action.
 * @param {Function} props.reject - Dispatches rejection for the pending confirmation.
 * @param {Function} props.translate - Localized string lookup function.
 * @returns {React.Element} The confirmation dialog component.
 * @constructor
 */
function ConfirmationDialog(props) {
  const {
    confirmation, approve, reject, translate,
  } = props;
  // TRICKY: stabilize the action so text does not flicker when closing.
  const stableConfirmation = useStableProp(confirmation);
  let title, message, confirmText, cancelText;

  if (stableConfirmation && stableConfirmation.meta) {
    title = stableConfirmation.meta.title;
    message = stableConfirmation.meta.message;
    confirmText = stableConfirmation.meta.confirmButtonText;
    cancelText = stableConfirmation.meta.cancelButtonText;
  }

  const open = !!confirmation;

  const onApprove = () => {
    if (open) {
      approve(stableConfirmation.action);
    }
  };

  const onReject = () => {
    if (open) {
      reject(stableConfirmation);
    }
  };

  // NOTE: we could potentially support ignorable confirmations with a little more work here.
  return (
    <IgnorableAlert
      open={open}
      title={title ? title : translate('alert')}
      confirmText={confirmText ? confirmText : translate('buttons.ok_button')}
      onConfirm={onApprove}
      cancelText={cancelText ? cancelText : translate('buttons.cancel_button')}
      onCancel={onReject}>
      {message ? message : 'Missing confirmation message'}
    </IgnorableAlert>
  );
}

ConfirmationDialog.propTypes = {
  /**
   * The key where the confirmation state is stored.
   * Deeply nested keys are not currently supported.
   */
  stateKey: PropTypes.string.isRequired,
  /**
   * The active confirmation request returned from the confirmation reducer.
   * When null or undefined, the dialog is closed.
   */
  confirmation: PropTypes.object,
  /**
   * Approves the pending confirmation and dispatches the action that originally
   * requested confirmation.
   */
  approve: PropTypes.func.isRequired,
  /**
   * Rejects the pending confirmation and allows the confirmation middleware to
   * continue without dispatching the protected action.
   */
  reject: PropTypes.func.isRequired,
  /**
   * Returns a localized string for the provided translation key.
   */
  translate: PropTypes.func.isRequired,
};

const mapStateToProps = (state, { stateKey }) => ({ confirmation: getNextConfirmation(state[stateKey]) });
const mapDispatchToProps = {
  approve: approveConfirmation,
  reject: rejectConfirmation,
};
export default withLocale(connect(mapStateToProps, mapDispatchToProps)(ConfirmationDialog));
