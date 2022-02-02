import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withLocale } from '../../helpers/localeHelpers';
import IgnorableAlert from '../../components/dialogComponents/IgnorableAlert';
import {
  approveConfirmation, getNextConfirmation, rejectConfirmation,
} from './confirmationMiddleware';

/**
 * Produces a prop that can never become null.
 * @param prop
 * @returns {unknown}
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
 * Prompts the user to confirm an action before it is executed.
 * This can be dropped into the root of your application without any props.
 * @param action
 * @param approve
 * @param reject
 * @returns {*}
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
  confirmation: PropTypes.object,
  approve: PropTypes.func.isRequired,
  reject: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
};

const mapStateToProps = (state, { stateKey }) => ({ confirmation: getNextConfirmation(state[stateKey]) });
const mapDispatchToProps = {
  approve: approveConfirmation,
  reject: rejectConfirmation,
};
export default withLocale(connect(mapStateToProps, mapDispatchToProps)(ConfirmationDialog));
