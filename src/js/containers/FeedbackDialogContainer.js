import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  getUserEmail,
  getUsername,
  getErrorFeedbackMessage,
  getErrorFeedbackExtraDetails,
  getErrorFeedbackCategory,
} from '../selectors/index';
import ErrorDialog from '../components/dialogComponents/ErrorDialog';
import SuccessDialog from '../components/dialogComponents/SuccessDialog';
import FeedbackDialog from '../components/dialogComponents/FeedbackDialog';
import { submitFeedback } from '../helpers/FeedbackHelpers';
import { getCurrentLog } from '../helpers/logger';
import { confirmOnlineAction } from '../actions/OnlineModeConfirmActions';
import { openAlertDialog, closeAlertDialog } from '../actions/AlertModalActions';
import { feedbackDialogClosing } from '../actions/HomeScreenActions';
import { LOG_FILES_PATH } from '../common/constants';
import { delay } from '../common/utils';

const MAX_LOG_SIZE = 25000000; // maximum amount of log data to attach to message

/**
 * Renders a dialog to submit user feedback.
 *
 * @class
 *
 * @property {func} translate - the localization function
 * @property {func} onClose - callback when the dialog is closed
 * @property {bool} open - controls whether the dialog is open or closed
 */
class FeedbackDialogContainer extends React.Component {
  constructor(props) {
    super(props);
    this._handleSubmit = this._handleSubmit.bind(this);
    this._handleClose = this._handleClose.bind(this);
    this._handleAcknowledgeError = this._handleAcknowledgeError.bind(this);
    this._submitFeedback = this._submitFeedback.bind(this);
    this.initialState = {
      submitError: false,
      submitSuccess: false,
      feedback: {},
    };
    this.state = { ...this.initialState };
    this.categories = [];
  }

  _handleSubmit(payload) {
    const { confirmOnlineAction } = this.props;

    confirmOnlineAction(() => {
      this._submitFeedback(payload);
    });
  }

  /**
   * Submits the feedback
   * @param payload
   * @private
   */
  _submitFeedback(payload) {
    const {
      category, email, includeLogs,
    } = payload;
    const {
      openAlertDialog, translate, username, errorFeedbackMessage,
      errorFeedbackExtraDetails, closeAlertDialog,
    } = this.props;

    let { message } = payload;
    message = message ? message.trim() : '';
    let logData = '';

    if (includeLogs) {
      // trim, truncate, and to html
      logData = getCurrentLog(LOG_FILES_PATH).trim().substr(-MAX_LOG_SIZE);
    }

    let extraData = '';

    if (errorFeedbackMessage) {
      extraData += '\n\n*********\nError Feedback Message:\n' + errorFeedbackMessage;
    }

    if (errorFeedbackExtraDetails) {
      extraData += '\n\n*********\nExtra Details:\n' + errorFeedbackExtraDetails;
    }
    extraData = extraData.trim();

    if (extraData) {
      message += '\n\n------------\n' + extraData + '\n';
    }
    console.log('FeedbackDialogContainer._submitFeedback() - sending: ', {
      email, username, message, extraData,
    });

    openAlertDialog(translate('sending_feedback'), true);
    delay(1000).then(() => {
      submitFeedback({
        category,
        message,
        name: username,
        email,
        state: (includeLogs ? { logData } : undefined),
      }).then(() => {
        console.log('FeedbackDialogContainer._submitFeedback() - Submitted');
        closeAlertDialog();
        this.setState({ submitSuccess: true });
      }).catch(error => {
        this.setState({
          submitError: true,
          feedback: payload,
        });
        closeAlertDialog();

        if (error.message === 'Network Error') {
          console.error('FeedbackDialogContainer._submitFeedback() - Network Error', error);
          openAlertDialog(translate('no_internet'));
        } else {
          openAlertDialog(translate('sending_feedback_failed'));
          console.error('FeedbackDialogContainer._submitFeedback() - Failed to submit feedback', error);
        }
      });
    });
  }

  _handleAcknowledgeError() {
    this.setState({ submitError: false });
  }

  _handleClose() {
    const { errorFeedbackMessage } = this.props;

    if (errorFeedbackMessage) {
      const { feedbackDialogClosing } = this.props;
      feedbackDialogClosing();
    }

    const { onClose } = this.props;
    this.setState(this.initialState);
    onClose();
  }

  render() {
    const {
      open, translate, errorFeedbackMessage, errorFeedbackCategory,
    } = this.props;
    const {
      feedback, submitError, submitSuccess,
    } = this.state;
    let {
      includeLogs, email, category,
    } = feedback;
    let { message } = feedback;
    const show = !!(open || errorFeedbackMessage); // get value as boolean

    if (submitError) {
      return <ErrorDialog translate={translate}
        message={translate('feedback_error')}
        open={show}
        onClose={this._handleAcknowledgeError}/>;
    } else if (submitSuccess) {
      return <SuccessDialog translate={translate}
        message={translate('feedback_success')}
        open={show}
        onClose={this._handleClose}/>;
    } else {
      // if previous state data not feedback, use values in reducer
      message = message || errorFeedbackMessage;
      category = category || errorFeedbackCategory;
      return <FeedbackDialog onClose={this._handleClose}
        open={show}
        translate={translate}
        onSubmit={this._handleSubmit}
        includeLogs={includeLogs}
        email={email}
        message={message}
        category={category}/>;
    }
  }
}

FeedbackDialogContainer.propTypes = {
  email: PropTypes.string,
  username: PropTypes.string,
  translate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  confirmOnlineAction: PropTypes.func,
  openAlertDialog: PropTypes.func,
  closeAlertDialog: PropTypes.func,
  errorFeedbackMessage: PropTypes.string,
  errorFeedbackExtraDetails: PropTypes.string,
  errorFeedbackCategory: PropTypes.string,
  feedbackDialogClosing: PropTypes.func,
};

const mapStateToProps = (state) => ({
  email: getUserEmail(state),
  username: getUsername(state),
  errorFeedbackMessage: getErrorFeedbackMessage(state),
  errorFeedbackExtraDetails: getErrorFeedbackExtraDetails(state),
  errorFeedbackCategory: getErrorFeedbackCategory(state),
});

const mapDispatchToProps = {
  confirmOnlineAction,
  openAlertDialog,
  closeAlertDialog,
  feedbackDialogClosing,
};

export default connect(mapStateToProps, mapDispatchToProps)(FeedbackDialogContainer);
