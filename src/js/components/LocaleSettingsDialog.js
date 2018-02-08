import React from 'react';
import PropTypes from 'prop-types';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import BaseDialog from './BaseDialog';
import { withLocale } from './Locale';
import { connect } from 'react-redux';
import { getLocaleLanguages } from '../selectors';
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
      selectedLanguage: props.currentLanguage
    };
  }

  handleSave () {
    const {setLanguage, onClose} = this.props;
    setLanguage(this.state.selectedLanguage);
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
      translate,
      languages
    } = this.props;

    const {selectedLanguage} = this.state;
    return (
      <BaseDialog onSubmit={this.handleSave}
                  primaryLabel={translate('save')}
                  secondaryLabel={translate('cancel')}
                  onClose={onClose}
                  title={translate('app_menu.change_app_locale')}
                  open={open}>
        <div style={styles.container}>
          <p>
            {translate('locale.change_info')}
          </p>
          <p>
            <i>{translate('locale.change_info_note')}</i>
          </p>
          <div style={styles.selectContainer}>
            <SelectField
              value={selectedLanguage}
              style={styles.select}
              underlineStyle={styles.selectUnderline}
              onChange={(e, key, payload) => this.handleLanguageChange(payload)}>
              {languages.map((language, key) => {
                return <MenuItem key={key}
                                 value={language.code}
                                 primaryText={language.name}/>;
              })}
            </SelectField>
          </div>
        </div>
      </BaseDialog>
    );
  }
}

LocaleSettingsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  translate: PropTypes.func,
  setLanguage: PropTypes.func,
  languages: PropTypes.array,
  currentLanguage: PropTypes.string
};

const mapStateToProps = (state) => ({
  languages: getLocaleLanguages(state)
});

const mapDispatchToProps = {
  setLanguage
};

export default withLocale(
  connect(mapStateToProps, mapDispatchToProps)(LocaleSettingsDialog));
