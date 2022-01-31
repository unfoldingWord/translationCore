import { withLocalize } from 'react-localize-redux';

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
  const localeReduxKey = 'localize';
  return withLocalize(wrappedComponent, localeReduxKey);
};

