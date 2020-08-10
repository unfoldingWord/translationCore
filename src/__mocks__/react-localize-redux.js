export const translate = jest.fn((key) => key);

export const getTranslate = jest.fn(() => (key) => key);

export const withLocalize = jest.fn((component, localeReduxKey) => component);


export const localeReducer = jest.fn(() => ({
  languages: jest.fn(),
  translations: jest.fn(),
  options: jest.fn(),
}));
