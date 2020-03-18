export const translate = jest.fn((key) => {
  return key;
});

export const getTranslate = jest.fn(() => {
  return (key) => key;
});

export const withLocalize = jest.fn((component, localeReduxKey) => {
  return component;
});


export const localeReducer = jest.fn(() => ({
  languages: jest.fn(),
  translations: jest.fn(),
  options: jest.fn()
}));
