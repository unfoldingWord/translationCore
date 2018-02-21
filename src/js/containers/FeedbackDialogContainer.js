import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import { getUserEmail } from '../selectors/index';
import ErrorDialog from '../components/dialogComponents/ErrorDialog';
import SuccessDialog from '../components/dialogComponents/SuccessDialog';
import FeedbackDialog from '../components/dialogComponents/FeedbackDialog';
import FeedbackAccountNameDialog from '../components/dialogComponents/FeedbackAccountNameDialog';
import {submitFeedback} from '../helpers/feedbackHelpers';

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
    this._handleAccountNameSubmit = this._handleAccountNameSubmit.bind(this);
    this._handleAccountNameClose = this._handleAccountNameClose.bind(this);
    this.initialState = {
      submitError: false,
      submitSuccess: false,
      getName: false,
      feedback: {}
    };
    this.state = {
      ...this.initialState
    };
    this.categories = [];
  }

  _handleAccountNameSubmit(payload) {
    const {name} = payload;
    const {feedback} = this.state;

    this._handleSubmit({
      ...feedback,
      name
    });
  }

  _handleAccountNameClose() {
    this.setState({
      getName: false
    });
  }

  _handleSubmit(payload) {
    // TRICKY: `name` will be undefined unless passed in from `_handleAccountNameSubmit`
    const {category, message, email, name, includeLogs} = payload;
    const {log} = this.props;

    let requestEmail = 'help@door43.org';

    if(email) {
      requestEmail = email;
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
      if(error.response && error.response.status === 401) {
        // request name so we can create an account
        this.setState({
          getName: true,
          feedback: payload
        });
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
    const {feedback, submitError, submitSuccess, getName} = this.state;
    const {includeLogs, message, email, category} = feedback;

    if(submitError) {
      return <ErrorDialog translate={translate}
                          message={translate('profile.feedback_error')}
                          open={open}
                          onClose={this._handleAcknowledgeError}/>;
    } else if (submitSuccess) {
      return <SuccessDialog translate={translate}
                            message={translate('profile.feedback_success')}
                            open={open}
                            onClose={this._handleClose}/>;
    } else if (getName) {
      return <FeedbackAccountNameDialog translate={translate}
                                        onClose={this._handleAccountNameClose}
                                        onSubmit={this._handleAccountNameSubmit}
                                        open={open}/>;
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
  open: PropTypes.bool.isRequired
};

const mapStateToProps = (state) => ({
  email: getUserEmail(state),
  log: {
    ...state,
    locale: '[truncated]'
  }
});

export default connect(mapStateToProps)(FeedbackDialogContainer);
