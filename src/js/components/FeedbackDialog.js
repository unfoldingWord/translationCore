import React from 'react';
import PropTypes from 'prop-types';
import BaseDialog from './BaseDialog';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import {connect} from 'react-redux';
import { getTranslate, getUserEmail } from '../selectors';
import _ from 'lodash';
import Checkbox from 'material-ui/Checkbox';
import appPackage from '../../../package';
import os from 'os';

const  styles = {
  label: {
    color: 'var(--text-color-dark)'
  }
};

/**
 *
 * @param selectedCategory
 * @param label
 * @param categories
 * @param onChange
 * @return {*}
 * @constructor
 */
const CategoryPicker = ({selectedCategory, label, categories, onChange}) => {
  return (
    <SelectField floatingLabelText={label}
                 floatingLabelStyle={styles.label}
                 value={selectedCategory}
                 autoWidth={true}
                 onChange={(e, key, payload) => onChange(payload)}>
      {categories.map((category, index) => {
        return <MenuItem key={index}  primaryText={category.value} value={category.value}/>;
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
 * Displays a dialog to submit user feedback
 */
class FeedbackDialog extends React.Component {

  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleCategoryChange = this.handleCategoryChange.bind(this);
    this.handleFeedbackChange = this.handleFeedbackChange.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleLogsChecked = this.handleLogsChecked.bind(this);
    this.initialState = {
      selectedCategory: null,
      message: '',
      email: props.email,
      includeLogs: true,
      errors: {
        message: false,
        email: false
      }
    };
    this.state = {
      ...this.initialState
    };
    this.categories = [];
  }

  handleSubmit() {
    const {onClose, log} = this.props;
    const {selectedCategory, message, email, includeLogs} = this.state;
    const errorState = {};

    if(!message) errorState['message'] = true;
    if(email && !validateEmail(email)) errorState['email'] = true;

    if(!_.isEmpty(errorState)) {
      this.setState({
        errors: errorState
      });
    } else {
      // TODO: submit feedback
      // TODO: also include the os name and version
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
      console.log('Submitting feedback', selectedCategory, email, includeLogs, message, log, appPackage.version, osInfo);

      this.setState({
        ...this.initialState
      });
      onClose();
    }
  }

  componentWillReceiveProps(nextProps) {
    const {translate, } = nextProps;
    const {selectedCategory} = this.state;

    // NOTE: keys are sent with the feedback and should remain in English
    this.categories = [
      {
        key: 'General Feedback',
        value: translate('profile.feedback')
      },
      {
        key: 'Content and Resources Feedback',
        value: translate('profile.content_feedback')
      },
      {
        key: 'Bug Report',
        value: translate('profile.bug_report')
      }
    ];

    // TRICKY: auto select the first category
    if(selectedCategory === null) {
      this.setState({
        selectedCategory: this.categories[0].key
      });
    }
  }

  handleClose() {
    const {onClose} = this.props;
    this.setState({
      ...this.initialState
    });
    onClose();
  }

  handleCategoryChange(category) {
    this.setState({
      selectedCategory: category
    });
  }

  handleFeedbackChange(event) {
    this.setState({
      message: event.target.value
    });
  }

  handleEmailChange(event) {
    this.setState({
      email: event.target.value
    });
  }

  handleLogsChecked(event, isChecked) {
    this.setState({
      includeLogs: isChecked
    });
  }

  render () {
    const {open, translate} = this.props;
    const {selectedCategory, message, email, errors, includeLogs} = this.state;

    return (
      <BaseDialog onSubmit={this.handleSubmit}
                  primaryLabel={translate('submit')}
                  secondaryLabel={translate('cancel')}
                  onClose={this.handleClose}
                  title={translate('profile.feedback_and_comments')}
                  open={open}>
        <CategoryPicker categories={this.categories}
                        onChange={this.handleCategoryChange}
                        label={translate('profile.category_label')}
                        selectedCategory={selectedCategory}/>
        <TextField value={message}
                   floatingLabelText={translate('profile.leave_feedback')}
                   floatingLabelStyle={styles.label}
                   hintText={translate('profile.leave_feedback')}
                   multiLine={true}
                   autoFocus={true}
                   errorText={errors.message && translate('profile.error_required')}
                   errorStyle={{
                     color: 'var(--warning-color)'
                   }}
                   style={{
                     width: '100%',
                   }}
                   onChange={this.handleFeedbackChange}/>
        <TextField floatingLabelText="Email address (optional):"
                   floatingLabelStyle={styles.label}
                   onChange={this.handleEmailChange}
                   errorText={errors.email && translate('profile.error_invalid_email')}
                   errorStyle={{
                     color: 'var(--warning-color)'
                   }}
                   value={email}
                   style={{
                     width: '100%'
                   }}/>
        <Checkbox label={translate('profile.include_logs')}
                  checked={includeLogs}
                  style={{
                    marginTop: '15px'
                  }}
                  onCheck={this.handleLogsChecked}/>
      </BaseDialog>
    );
  }
}

FeedbackDialog.propTypes = {
  log: PropTypes.string,
  email: PropTypes.string,
  translate: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired
};

const mapStateToProps = (state) => ({
  translate: getTranslate(state),
  email: getUserEmail(state),
  log: {
    ...state,
    locale: '[truncated]'
  }
});

export default connect(mapStateToProps)(FeedbackDialog);
