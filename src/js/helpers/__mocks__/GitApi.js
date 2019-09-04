/* eslint-disable require-await */
export var __data_init = {
  mockInit_Ret: null,
  mockStatus_Error: null,
  mockStatus_Ret: {},
  mockGetRemoteRepoHead_Ret: true,
};

export var __data = JSON.parse(JSON.stringify(__data_init));

export function __Reset() {
  __data = JSON.parse(JSON.stringify(__data_init));
}

export const mockInit = jest.fn(async (callback) => callback(__data.mockInit_Ret));
export const mockStatus = jest.fn(async (callback) => callback(__data.mockStatus_Error, __data.mockStatus_Ret));
export const mockGetRemoteRepoHead = jest.fn(async () => __data.mockGetRemoteRepoHead_Ret);

// instance
const mock = jest.fn().mockImplementation((dir, user) => ({
  dir,
  user,
  init: mockInit,
  status: mockStatus,
}));

// static methods
mock.__GetData = jest.fn(() => __data);
mock.__Reset = __Reset;

export const getRemoteRepoHead = mockGetRemoteRepoHead;

export default mock;
