const translate = jest.fn((key) => {
  return key;
});

export const getTranslate = () => {
  return translate;
};

export const localize = jest.fn((component, localeReduxKey) => {
  return component;
});
