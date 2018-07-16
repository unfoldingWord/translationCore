import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import { getUserEmail, getErrorFeedbackMessage, getErrorFeedbackExtraDetails } from '../selectors/index';
import ErrorDialog from '../components/dialogComponents/ErrorDialog';
import SuccessDialog from '../components/dialogComponents/SuccessDialog';
import FeedbackDialog from '../components/dialogComponents/FeedbackDialog';
import {submitFeedback, emailToName} from '../helpers/FeedbackHelpers';
import {confirmOnlineAction} from '../actions/OnlineModeConfirmActions';
import {openAlertDialog} from '../actions/AlertModalActions';
import {feedbackDialogClosing} from "../actions/HomeScreenActions";

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
      feedback: {}
    };
    this.state = {
      ...this.initialState
    };
    this.categories = [];
  }

  _handleSubmit(payload) {
    const {confirmOnlineAction} = this.props;
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
    const {category,  email, includeLogs} = payload;
    let {message} = payload;
    const {log, openAlertDialog, translate} = this.props;
    let {errorFeedbackMessage} = this.props;
    if (errorFeedbackMessage) {
      const extraDetails = (this.props.getErrorFeedbackExtraDetails() || "");
      message = (message || "") + "\n\n------------\n" + errorFeedbackMessage +  "\n\n" + extraDetails;
    }

    let requestEmail = 'help@door43.org';
    let name = undefined;

    if(email) {
      requestEmail = email;
      name = emailToName(email);
    }

    submitFeedback({
      category,
      message,
      name,
      email: requestEmail,
      state: (includeLogs ? log : undefined)
    }).then(() => {
      this.setState({
        submitSuccess: true
      });
    }).catch(error => {
      if(error.message === 'Network Error') {
        openAlertDialog(translate('no_internet'));
      } else {
        console.error('Failed to submit feedback', error);
        this.setState({
          submitError: true,
          feedback: payload
        });
      }
    });
  }

  _handleAcknowledgeError() {
    this.setState({
      submitError: false
    });
  }

  _handleClose() {
    const {errorFeedbackMessage} = this.props;
    if (errorFeedbackMessage) {
      const {feedbackDialogClosing} = this.props;
      feedbackDialogClosing();
    }
    const {onClose} = this.props;
    this.setState(this.initialState);
    onClose();
  }

  render () {
    const {open, translate, errorFeedbackMessage} = this.props;
    const {feedback, submitError, submitSuccess} = this.state;
    const {includeLogs, email, category} = feedback;
    let {message} = feedback;
    const show = !!(open || errorFeedbackMessage); // get value as boolean

    if(submitError) {
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
  log: PropTypes.object,
  email: PropTypes.string,
  translate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  confirmOnlineAction: PropTypes.func,
  openAlertDialog: PropTypes.func,
  errorFeedbackMessage: PropTypes.string,
  feedbackDialogClosing: PropTypes.func,
  getErrorFeedbackExtraDetails: PropTypes.func
};

const mapStateToProps = (state) => ({
  email: getUserEmail(state),
  log: {
    ...state,
    locale: '[truncated]'
  },
  errorFeedbackMessage: getErrorFeedbackMessage(state)
});

const mapDispatchToProps = {
  confirmOnlineAction,
  openAlertDialog,
  feedbackDialogClosing,
  getErrorFeedbackExtraDetails
};

export default connect(mapStateToProps, mapDispatchToProps)(FeedbackDialogContainer);
