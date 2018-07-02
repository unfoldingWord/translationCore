import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import { getUserEmail } from '../selectors/index';
import ErrorDialog from '../components/dialogComponents/ErrorDialog';
import SuccessDialog from '../components/dialogComponents/SuccessDialog';
import FeedbackDialog from '../components/dialogComponents/FeedbackDialog';
import {submitFeedback, emailToName} from '../helpers/FeedbackHelpers';
import {confirmOnlineAction} from '../actions/OnlineModeConfirmActions';
import {openAlertDialog} from '../actions/AlertModalActions';

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
    const {category, message, email, includeLogs} = payload;
    const {log, openAlertDialog, translate} = this.props;

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
    const {onClose} = this.props;
    this.setState(this.initialState);
    onClose();
  }

  render () {
    const {open, translate} = this.props;
    const {feedback, submitError, submitSuccess} = this.state;
    const {includeLogs, message, email, category} = feedback;

    if(submitError) {
      return <ErrorDialog translate={translate}
                          message={translate('feedback_error')}
                          open={open}
                          onClose={this._handleAcknowledgeError}/>;
    } else if (submitSuccess) {
      return <SuccessDialog translate={translate}
                            message={translate('feedback_success')}
                            open={open}
                            onClose={this._handleClose}/>;
    } else {
      return <FeedbackDialog onClose={this._handleClose}
                             open={open}
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
  openAlertDialog: PropTypes.func
};

const mapStateToProps = (state) => ({
  email: getUserEmail(state),
  log: {
    ...state,
    locale: '[truncated]'
  }
});

const mapDispatchToProps = {
  confirmOnlineAction,
  openAlertDialog
};

export default connect(mapStateToProps, mapDispatchToProps)(FeedbackDialogContainer);
