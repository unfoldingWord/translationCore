
export const clone = jest.fn(() => {
  return Promise.resolve();
});
export const plugins = {
  set: jest.fn()
};
export const deleteRemote = jest.fn(() => {
  return Promise.resolve();
});
export const listRemotes = jest.fn(() => {
  return Promise.resolve([]);
});
export const addRemote = jest.fn(() => {
  return Promise.resolve();
});
export const push = jest.fn(() => {
  return Promise.resolve();
});
