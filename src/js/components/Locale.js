import React from 'react';
import {localize} from 'react-localize-redux';
import PropTypes from 'prop-types';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import { getLocaleLanguages, getActiveLocaleLanguage } from '../selectors';
import {connect} from 'react-redux';

/**
 * This is a convenience Higher Order Component that
 * attaches localization to a component.
 * It handles connecting `localize` with the correct key in redux.
 *
 * @see js/actions/LocaleActions
 * @param {React.Component} wrappedComponent
 * @return {function()}
 */
export const withLocale = (wrappedComponent) => {
    const localeReduxKey = 'locale';
    return localize(wrappedComponent, localeReduxKey);
};

/**
 * Represents a select field for locale languages
 * @param {string} selectedLocale the locale (language code) that is currently selected
 * @param {array} languages an array of language objects with a code and name.
 * @param {func} onChange the call back when an item is chosen.
 * @return {*}
 * @constructor
 */
const LocalePicker = ({selectedLocale, languages, onChange}) => (
  <SelectField
    value={selectedLocale}
    style={{
      border: 'solid 1px var(--text-color-dark)',
      borderRadius: '5px',
      textAlign: 'center'
    }}
    underlineStyle={{
      textDecoration: 'none',
      border: 'none',
      color: 'var(--text-color-dark)'
    }}
    onChange={(e, key, payload) => onChange(payload)}>
    {languages.map((language, key) => {
      return <MenuItem key={key}
                       value={language.code}
                       primaryText={language.name}/>;
    })}
  </SelectField>
);
LocalePicker.propTypes = {
  selectedLocale: PropTypes.string.isRequired,
  languages: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired
};

/**
 * Renders a language picker with the data loaded from the state
 */
class ConnectedLocalePicker extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedLocale: props.currentLanguage
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    // TRICKY: update the selection if the language is changed elsewhere
    if(nextProps.currentLanguage !== this.props.currentLanguage) {
      this.setState({
        selectedLocale: nextProps.currentLanguage
      });
    }
  }

  componentDidCatch(error, info) {
    console.error(error);
    console.warn(info);
  }

  handleChange(language) {
    const {onChange} = this.props;
    this.setState({
      selectedLocale: language
    });
    onChange(language);
  }

  render() {
    const {languages} = this.props;
    const {selectedLocale} = this.state;
    return (
      <LocalePicker languages={languages}
                    selectedLocale={selectedLocale}
                    onChange={this.handleChange}/>
    );
  }
}
ConnectedLocalePicker.propTypes = {
  currentLanguage: PropTypes.string,
  languages: PropTypes.array,
  onChange: PropTypes.func.isRequired
};
const mapLanguagePickerStateToProps = (state) => ({
  languages: getLocaleLanguages(state),
  currentLanguage: getActiveLocaleLanguage(state).code
});
exports.ConnectedLocalePicker = connect(mapLanguagePickerStateToProps)(ConnectedLocalePicker);
