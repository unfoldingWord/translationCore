/* eslint-env jest */

import consts from '../src/js/actions/ActionTypes';
import * as importOnlineSearchActions  from '../src/js/actions/ImportOnlineSearchActions';
require('jest');

describe('ImportOnlineSearchActions', () => {

  let returnedUser = null;
  let returnedSearchBy = null;

  beforeEach(() => {
    returnedUser = "INVALID";
    returnedSearchBy = "INVALID";
    window._gogsHandler = jest.fn();
  });

  afterEach(() => {
    delete window._gogsHandler;
  });

  test('ImportOnlineSearchActions.searchReposByUser should show spinner and then display data', () => {

    const repos_to_return = [ { name: "en_ulb" }];
    const dispatch = create_search_mocks(repos_to_return);

    const user = "dummy";
    const fn = importOnlineSearchActions.searchReposByUser(user);
    fn(dispatch);

    expect(returnedUser).toEqual(user);
    validate_dispatch_calls(dispatch, [consts.OPEN_ALERT_DIALOG, consts.SET_REPOS_DATA, consts.CLOSE_ALERT_DIALOG]);
    validate_repo_data(dispatch, 1, repos_to_return);
  });

  test('ImportOnlineSearchActions.searchReposByQuery with user should show spinner and then display data', () => {

    const repos_to_return = [ { name: "en_ulb" }];
    const dispatch = create_search_mocks(repos_to_return);

    const query = { user: "dummy" };
    const fn = importOnlineSearchActions.searchReposByQuery(query);
    fn(dispatch);
    callDispatchedFunction(dispatch);

    expect(returnedUser).toEqual(query.user);
    validate_dispatch_calls(dispatch, [null, consts.OPEN_ALERT_DIALOG, consts.SET_REPOS_DATA, consts.CLOSE_ALERT_DIALOG]);
  });

  //
  // helpers
  //

  function create_search_mocks(repos_to_return) {
    window._gogsHandler['searchReposByUser'] = (user) => {
      returnedUser = user;
      return window._gogsHandler;
    };
    window._gogsHandler['searchRepos'] = (searchBy) => {
      returnedSearchBy = searchBy;
      return window._gogsHandler;
    };
    window._gogsHandler.then = (fn) => {
      fn({ data: repos_to_return });
    };
    const dispatch = jest.fn();
    return dispatch;
  }

  function validate_dispatch_indirect_calls(dispatch, count) {
    const dispatch_call_count = dispatch.mock.calls.length;
    expect(dispatch_call_count).toEqual(count);
    for (let i = 0; i < count; i++) {
      const call_arg0 = dispatch.mock.calls[i][0];
      expect(typeof call_arg0).toEqual("function");
    }
  }

  function validate_dispatch_calls(dispatch, call_types) {
    const dispatch_call_count = dispatch.mock.calls.length;
    expect(dispatch_call_count).toEqual(call_types.length);
    for (let i = 0; i < call_types.length; i++) {
      const call_type = call_types[i];
      if(call_type) {
        const call_arg0 = dispatch.mock.calls[i][0];
        expect(call_arg0.type).toEqual(call_type);
      }
    }
  }

  function callDispatchedFunction(dispatch) {
    validate_dispatch_indirect_calls(dispatch, 1);
    const dispatched_fn = dispatch.mock.calls[0][0];
    dispatched_fn(dispatch);
  }

  function validate_repo_data(dispatch, data_pos, expected_repos) {
    const call_arg0 = dispatch.mock.calls[data_pos][0];
    const actual_repos = call_arg0.repos;
    expect(actual_repos).toEqual(expected_repos);
  }
});