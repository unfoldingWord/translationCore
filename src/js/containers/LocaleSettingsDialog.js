import React from 'react';
import PropTypes from 'prop-types';
import BaseDialog from '../components/dialogComponents/BaseDialog';
import { ConnectedLocalePicker } from '../components/Locale';
import { connect } from 'react-redux';
import { setLanguage } from '../actions/LocaleActions';

const styles = {
  container: {
    color: 'var(--text-color-dark)'
  },
  selectContainer: {

    textAlign: 'center'
  },
  select: {
    border: 'solid 1px var(--text-color-dark)',
    borderRadius: '5px'
  },
  selectUnderline: {
    textDecoration: 'none',
    border: 'none'
  }
};

/**
 * The dialog for controlling locale settings within the app
 */
class LocaleSettingsDialog extends React.Component {

  constructor (props) {
    super(props);
    this.handleSave = this.handleSave.bind(this);
    this.handleLanguageChange = this.handleLanguageChange.bind(this);
    this.state = {
      selectedLanguage: null
    };
  }

  componentDidCatch(error, info) {
    console.error(error);
    console.warn(info);
  }

  handleSave () {
    const {setLanguage, onClose} = this.props;
    const {selectedLanguage} = this.state;
    // TRICKY: the initial state is null
    if(selectedLanguage) {
      setLanguage(selectedLanguage);
    }
    onClose();
  }

  handleLanguageChange (language) {
    this.setState({
      selectedLanguage: language
    });
  }

  render () {
    const {
      open = false,
      onClose,
      translate
    } = this.props;

    return (
      <BaseDialog onSubmit={this.handleSave}
                  primaryLabel={translate('save')}
                  secondaryLabel={translate('cancel')}
                  onClose={onClose}
                  title={translate('locale.app_locale')}
                  open={open}>
        <div style={styles.container}>
          <p>
            {translate('locale.change_info')}
          </p>
          <p>
            <i>{translate('locale.change_info_note')}</i>
          </p>
          <div style={styles.selectContainer}>
            <ConnectedLocalePicker onChange={this.handleLanguageChange}/>
          </div>
        </div>
      </BaseDialog>
    );
  }
}

LocaleSettingsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
  setLanguage: PropTypes.func
};

const mapDispatchToProps = {
  setLanguage
};

export default connect(null, mapDispatchToProps)(LocaleSettingsDialog);
