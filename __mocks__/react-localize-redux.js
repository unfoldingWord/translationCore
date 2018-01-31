const translate = jest.fn((key) => {
  return key;
});

export const getTranslate = () => {
  return translate;
};
