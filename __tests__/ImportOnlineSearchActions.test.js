import * as importOnlineSearchActions  from '../src/js/actions/ImportOnlineSearchActions';
require('jest');

describe('ImportOnlineSearchActions.searchReposByUser', () => {

  beforeEach(() => {
    window._gogsHandler = jest.fn();
  });

  afterEach(() => {
    delete window._gogsHandler;
  });

  test('ImportOnlineSearchActions.searchReposByUser should show spinner and then display data', () => {

    const repos = [];
    window._gogsHandler.searchReposByUser = jest.fn();
    window._gogsHandler.then = (fn)=> {
      fn(repos);
    };
    window._gogsHandler.searchReposByUser.mockReturnValue(window._gogsHandler);

    const user = "dummy";
    const dispatch = jest.fn();
    const fn = importOnlineSearchActions.searchReposByUser(user);
    fn(dispatch);
    const dispatch_call_count = dispatch.mock.calls.length;
    expect(dispatch_call_count).toEqual(3);
  });
});