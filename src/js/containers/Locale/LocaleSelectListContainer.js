import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getLocaleLanguages, getActiveLocaleLanguage } from '../../selectors/index';
import LanguageSelectField from '../../components/LanguageSelectField';

/**
 * Renders a select list to choose the locale used in the app.
 *
 * @class
 * @property {func} onChange - callback when the selection changes.
 */
class LocaleSelectListContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selectedLocale: props.currentLanguage };
    this.handleChange = this.handleChange.bind(this);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // TRICKY: update the selection if the language is changed elsewhere
    if (nextProps.currentLanguage !== this.props.currentLanguage) {
      this.setState({ selectedLocale: nextProps.currentLanguage });
    }
  }

  componentDidCatch(error, info) {
    console.error(error);
    console.warn(info);
  }

  handleChange(language) {
    const { onChange } = this.props;

    this.setState({ selectedLocale: language });
    onChange(language);
  }

  render() {
    const { languages, translate } = this.props;
    const { selectedLocale } = this.state;
    return (
      <LanguageSelectField languages={languages}
        selectedLanguageCode={selectedLocale}
        onChange={this.handleChange}
        translate={translate}/>
    );
  }
}

LocaleSelectListContainer.propTypes = {
  translate: PropTypes.func.isRequired,
  currentLanguage: PropTypes.string,
  languages: PropTypes.array,
  onChange: PropTypes.func.isRequired,
};

const mapLanguagePickerStateToProps = (state) => ({
  languages: getLocaleLanguages(state),
  currentLanguage: getActiveLocaleLanguage(state).code,
});

export default connect(mapLanguagePickerStateToProps)(LocaleSelectListContainer);
