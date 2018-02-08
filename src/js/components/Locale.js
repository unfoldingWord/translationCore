import { localize, getTranslate } from 'react-localize-redux';
const localeReduxKey = 'locale';

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
    return localize(wrappedComponent, localeReduxKey);
};

export const withTranslate = (state) => {
    return getTranslate(state[localeReduxKey]);
};