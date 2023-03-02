/* eslint-disable require-await */
export const mockClone = jest.fn();
export const mockGetRemote = jest.fn(() => ({
  owner: 'remote_owner',
  url: 'remote_url',
}));
export const mockRemoveRemote = jest.fn();
export const mockAddRemote = jest.fn();
export const mockPush = jest.fn();
export const mockSave = jest.fn();
export const mockParseRemoteUrl = jest.fn();
export const mockOpen = jest.fn((dir, user) => new mock(dir, user));
export const mockOpenSafe = jest.fn((dir, user) => new mock(dir, user));
export const mockDoesRemoteRepoExist = jest.fn(async (dir) => !dir);

// instance
const mock = jest.fn().mockImplementation(() => ({
  getRemote: mockGetRemote,
  removeRemote: mockRemoveRemote,
  addRemote: mockAddRemote,
  push: mockPush,
  save: mockSave,
}));

// static methods
mock.open = mockOpen;
mock.openSafe = mockOpenSafe;
mock.clone = mockClone;
mock.parseRemoteUrl = mockParseRemoteUrl;
mock.doesRemoteRepoExist = mockDoesRemoteRepoExist;

export default mock;
