
export const mockClone = jest.fn();
export const mockGetRemote = jest.fn(() => {
  return {
    owner: 'remote_owner',
    url: 'remote_url'
  };
});
export const mockRemoveRemote = jest.fn();
export const mockAddRemote = jest.fn();
export const mockPush = jest.fn();
export const mockParseRemoteUrl = jest.fn();
export const mockOpen = jest.fn((dir, user) => {
  return new mock(dir, user);
});
export const mockDoesRemoteRepoExist = jest.fn(async (dir) => {
  return !dir;
});

// instance
const mock = jest.fn().mockImplementation(() => {
  return {
    getRemote: mockGetRemote,
    removeRemote: mockRemoveRemote,
    addRemote: mockAddRemote,
    push: mockPush
  };
});

// static methods
mock.open = mockOpen;
mock.clone = mockClone;
mock.parseRemoteUrl = mockParseRemoteUrl;
mock.doesRemoteRepoExist = mockDoesRemoteRepoExist;

export default mock;
