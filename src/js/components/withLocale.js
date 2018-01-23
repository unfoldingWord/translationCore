import {localize} from 'react-localize-redux';

/**
 * This is a convenience Higher Order Component that
 * attaches localization to a component.
 * It handles connecting `localize` with the correct key in redux.
 *
 * @see js/actions/LocalizationActions
 * @param {React.Component} wrappedComponent
 * @return {function()}
 */
const withLocale = (wrappedComponent) => {
    const localeReduxKey = 'locale';
    return localize(wrappedComponent, localeReduxKey);
};

export default withLocale;
