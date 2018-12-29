// export const mockGetLatestTranslationHelp = jest.fn();
// export function mockDefault() {
//   return {
//     getLatestTranslationHelp: mockGetLatestTranslationHelp,
//   };
// }
//
// // instance
// const mock = jest.fn();
//
//
// // static methods
// mock.default = mockDefault;
//
// export default mock;

export const mockGetLatestTranslationHelp = jest.fn();
export const mockDefault = jest.fn(() => new mock());

// instance
const mock = jest.fn().mockImplementation(() => ({
  getLatestTranslationHelp: mockGetLatestTranslationHelp
}));

// static methods
mock.default = mockDefault;

export default mock;
