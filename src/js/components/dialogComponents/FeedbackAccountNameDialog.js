import React from 'react';
import PropTypes from 'prop-types';
import BaseDialog from './BaseDialog';
import TextField from 'material-ui/TextField';

const  styles = {
  label: {
    color: 'var(--text-color-dark)'
  }
};

/**
 * Renders a dialog to retrieve the user's name for setting up their feedback account.
 *
 * @class
 *
 * @property {func} translate - the localization function
 * @property {func} onClose - callback when the dialog is closed
 * @property {func} onSubmit - callback when the feedback is submitted.
 * @property {bool} open - controls whether the dialog is open or closed
 * @property {string} [name=''] - the user's name
 */
class FeedbackAccountNameDialog extends React.Component {

  constructor(props) {
    super(props);
    this._handleSubmit = this._handleSubmit.bind(this);
    this._handleNameChange = this._handleNameChange.bind(this);
    this._handleClose = this._handleClose.bind(this);

    const {name} = props;

    this.initialState = {
      name: '',
      error: false
    };
    this.state = {
      ...this.initialState,
      name
    };
  }

  _handleSubmit() {
    const {onSubmit} = this.props;
    const {name} = this.state;

    if(!name) {
      this.setState({
        error: true
      });
    } else {
      onSubmit({
        name
      });
    }
  }

  _handleClose() {
    const {onClose} = this.props;
    this.setState(this.initialState);
    onClose();
  }

  _handleNameChange(event) {
    this.setState({
      name: event.target.value
    });
  }

  render () {
    const {name, error} = this.state;
    const {open, translate} = this.props;

    return (
      <BaseDialog onSubmit={this._handleSubmit}
                  primaryLabel={translate('submit')}
                  secondaryLabel={translate('cancel')}
                  onClose={this._handleClose}
                  title={translate('profile.feedback_account')}
                  open={open}>
        <p>
          {translate('profile.feedback_account_setup')}
        </p>
        <TextField floatingLabelText={translate('profile.name_label')}
                   floatingLabelStyle={styles.label}
                   onChange={this._handleNameChange}
                   autoFocus={true}
                   errorText={error && translate('profile.error_required')}
                   errorStyle={{
                     color: 'var(--warning-color)'
                   }}
                   value={name}
                   style={{
                     width: '100%'
                   }}/>
      </BaseDialog>
    );
  }
}

FeedbackAccountNameDialog.propTypes = {
  name: PropTypes.string,

  translate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired
};

FeedbackAccountNameDialog.defaultProps = {
  name: ''
};

export default FeedbackAccountNameDialog;
