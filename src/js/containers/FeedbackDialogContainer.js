import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import { getUserEmail } from '../selectors/index';
import appPackage from '../../../package';
import os from 'os';
import axios from 'axios';
import ErrorDialog from '../components/dialogComponents/ErrorDialog';
import SuccessDialog from '../components/dialogComponents/SuccessDialog';
import FeedbackDialog from '../components/dialogComponents/FeedbackDialog';

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
    const {category, message, email, includeLogs} = payload;
    const {log} = this.props;

    let requestEmail = 'help@door43.org';

    const osInfo = {
      arch: os.arch(),
      cpus: os.cpus(),
      memory: os.totalmem(),
      type: os.type(),
      networkInterfaces: os.networkInterfaces(),
      loadavg: os.loadavg(),
      eol: os.EOL,
      userInfo: os.userInfo(),
      homedir: os.homedir(),
      platform: os.platform(),
      release: os.release()
    };

    let fullMessage = `${message}\n\nApp Version:\n${appPackage.version}`;
    if(email) {
      requestEmail = email;
      fullMessage += `\n\nUser Email:\n${email}`;
    }
    if(includeLogs) {
      fullMessage += `\n\nSystem:\n${JSON.stringify(osInfo)}\n\nApp State:\n${JSON.stringify(log)}`;
    }

    const request = {
      method: 'POST',
      url: 'http://help.door43.org/api/v1/tickets',
      params: {
        token: process.env.TC_HELP_DESK_TOKEN
      },
      data: {
        name: `tC ${category}`,
        body: fullMessage,
        tag_list: `${category}, translationCore`,
        user_email: requestEmail, //'help@door43.org', // TODO: use the user email if the API allows (currently does not). requestEmail
        channel: 'translationCore'
      },
    };
    axios(request).then(() => {
      this.setState({
        submitSuccess: true
      });
    }).catch(error => {
      console.log(error);
      this.setState({
        submitError: true,
        feedback: payload
      });
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
    } else {
      return <FeedbackDialog onClose={this._handleClose}
                             open={open}
                             translate={translate}
                             onSubmit={this._handleSubmit}
                             {...feedback} />;
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
