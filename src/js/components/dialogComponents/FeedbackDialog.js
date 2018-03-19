import React from 'react';
import PropTypes from 'prop-types';
import BaseDialog from './BaseDialog';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import _ from 'lodash';
import Checkbox from 'material-ui/Checkbox';

const  styles = {
  label: {
    color: 'var(--text-color-dark)'
  }
};

/**
 * Renders the feedback category select field.
 *
 * @param {string} selectedCategory the selected category
 * @param {string} label the field label
 * @param {array} categories an array of category objects with key and value
 * @param {func} onChange the callback when the selection changes
 * @return {*}
 * @constructor
 */
const CategoryPicker = ({selectedCategory, label, categories, onChange}) => {
  return (
    <SelectField floatingLabelText={label}
                 id="feedback-category"
                 floatingLabelStyle={styles.label}
                 value={selectedCategory}
                 autoWidth={true}
                 onChange={(e, key, payload) => onChange(payload)}>
      {categories.map((category, index) => {
        return <MenuItem key={index}  primaryText={category.value} value={category.key}/>;
      })}
    </SelectField>
  );
};
CategoryPicker.propTypes = {
  selectedCategory: PropTypes.string,
  label: PropTypes.string.isRequired,
  categories: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired
};

function validateEmail(email) {
  const re = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(.\w{2,3})+$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Renders a dialog to submit user feedback.
 *
 * @class
 *
 * @property {func} translate - the localization function
 * @property {func} onClose - callback when the dialog is closed
 * @property {func} onSubmit - callback when the feedback is submitted.
 * @property {bool} open - controls whether the dialog is open or closed
 * @property {bool} [includeLogs=true] - indicates if logs should be included
 * @property {string} [message=''] - the feedback message
 * @property {string} [email=''] - the user's email
 * @property {string} [category=null] - the feedback category
 */
class FeedbackDialog extends React.Component {

  constructor(props) {
    super(props);
    this._handleSubmit = this._handleSubmit.bind(this);
    this._handleCategoryChange = this._handleCategoryChange.bind(this);
    this._handleFeedbackChange = this._handleFeedbackChange.bind(this);
    this._handleEmailChange = this._handleEmailChange.bind(this);
    this._handleClose = this._handleClose.bind(this);
    this._handleLogsChecked = this._handleLogsChecked.bind(this);

    const {category, message, email, includeLogs} = props;

    this.initialState = {
      category: null,
      message: '',
      email: '',
      includeLogs: true,
      errors: {
        message: false,
        email: false
      }
    };
    this.state = {
      ...this.initialState,
      category,
      message,
      email,
      includeLogs
    };
    // TRICKY: the values are locale keys
    this.categories = [
      {
        key: 'General Feedback',
        value: 'general_feedback'
      },
      {
        key: 'Content and Resources Feedback',
        value: 'content_resources_feedback'
      },
      {
        key: 'Bug Report',
        value: 'bug_report'
      }
    ];
  }

  _handleSubmit() {
    const {onSubmit} = this.props;
    const {category, message, email, includeLogs} = this.state;
    const errorState = {};

    if(!message) errorState['message'] = true;
    if(email && !validateEmail(email)) errorState['email'] = true;

    if(!_.isEmpty(errorState)) {
      this.setState({
        errors: errorState
      });
    } else {
      onSubmit({
        category,
        message,
        email,
        includeLogs
      });
    }
  }


  componentWillReceiveProps() {
    const {category} = this.state;
    // TRICKY: auto select the first category
    if(!category) {
      this.setState({
        category: this.categories[0].key
      });
    }
  }

  _handleClose() {
    const {onClose} = this.props;
    this.setState(this.initialState);
    onClose();
  }

  _handleCategoryChange(category) {
    this.setState({
      category
    });
  }

  _handleFeedbackChange(event) {
    this.setState({
      message: event.target.value
    });
  }

  _handleEmailChange(event) {
    this.setState({
      email: event.target.value
    });
  }

  _handleLogsChecked(event, isChecked) {
    this.setState({
      includeLogs: isChecked
    });
  }

  render () {
    const {includeLogs, message, email, category, errors} = this.state;
    const {open, translate} = this.props;

    // localize the category values
    const categories = this.categories.map(category => {
      return {
        key: category.key,
        value: translate(category.value)
      };
    });

    return (
      <BaseDialog onSubmit={this._handleSubmit}
                  primaryLabel={translate('submit')}
                  secondaryLabel={translate('buttons.cancel_button')}
                  onClose={this._handleClose}
                  title={translate('user_feedback_comments')}
                  open={open}>
        <CategoryPicker categories={categories}
                        onChange={this._handleCategoryChange}
                        label={translate('user.category')}
                        selectedCategory={category}/>
        <TextField value={message}
                   floatingLabelText={translate('leave_feedback')}
                   floatingLabelStyle={styles.label}
                   hintText={translate('leave_feedback')}
                   multiLine={true}
                   rows={3}
                   autoFocus={true}
                   errorText={errors.message && translate('profile.error_required')}
                   errorStyle={{
                     color: 'var(--warning-color)'
                   }}
                   style={{
                     width: '100%'
                   }}
                   onChange={this._handleFeedbackChange}/>
        <TextField floatingLabelText={translate('email_address_optional')}
                   floatingLabelStyle={styles.label}
                   onChange={this._handleEmailChange}
                   errorText={errors.email && translate('invalid_email')}
                   errorStyle={{
                     color: 'var(--warning-color)'
                   }}
                   value={email}
                   style={{
                     width: '100%'
                   }}/>
        <Checkbox label={translate('include_app_logs')}
                  checked={includeLogs}
                  style={{
                    marginTop: '15px'
                  }}
                  onCheck={this._handleLogsChecked}/>
      </BaseDialog>
    );
  }
}

FeedbackDialog.propTypes = {
  includeLogs: PropTypes.bool,
  message: PropTypes.string,
  email: PropTypes.string,
  category: PropTypes.string,

  translate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired
};

FeedbackDialog.defaultProps = {
  message: '',
  category: null,
  includeLogs: true,
  email: ''
};

export default FeedbackDialog;
