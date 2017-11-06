/* eslint-disable no-console */
import consts from './ActionTypes';
import Gogs from '../components/login/GogsApi';
// actions
import * as AlertModalActions from './AlertModalActions';

/**
 * @description - makes it easier to mock Gogs for testing.
 *                  Set window._gogsHandler to mock for testing
 * @return {{login, createAccount, createRepo, listRepos, searchReposByUser, searchRepos}|*}  Gogs
 */
function getGogs() {
  if (window._gogsHandler) {
    return window._gogsHandler;
  }
  return Gogs();
}

export function searchReposByUser(user) {
  return ((dispatch) => {
    dispatch( AlertModalActions.openAlertDialog("Searching, Please wait...", true));
    getGogs().searchReposByUser(user).then((repos) => {
      dispatch({
        type: consts.SET_REPOS_DATA,
        repos: repos.data
      });
      dispatch(AlertModalActions.closeAlertDialog());
    });
  });
}

export function searchReposByQuery(query) {
  return ((dispatch) => {
    if (query) {
      if (query.user && query.bookId && query.laguageId) {
        // search by user, bookId and laguageId
        dispatch(searchByUserAndFilter(query.user, query.bookId, query.laguageId));
      } else if (query.user && query.bookId) {
        // search by user and bookId
        dispatch(searchByUserAndFilter(query.user, query.bookId));
      } else if (query.user && query.laguageId) {
        // search by user and laguageId
        dispatch(searchByUserAndFilter(query.user, query.laguageId));
      } else if (query.bookId && query.laguageId) {
        // search by bookId and laguageId
        dispatch(searchAndFilter(query.bookId, query.laguageId));
      } else if (query.bookId) {
        // search only by bookId
        dispatch(searchBy(query.bookId));
      } else if (query.laguageId) {
        // search only by laguageId
        dispatch(searchBy(query.laguageId));
      } else if (query.user) {
        // search by user only
        dispatch(searchReposByUser(query.user));
      }
    }
  });
}

function searchByUserAndFilter(user, filterBy, secondFilter) {
  return ((dispatch) => {
    dispatch( AlertModalActions.openAlertDialog("Searching, Please wait...", true));
    getGogs().searchReposByUser(user).then((repos) => {
      let filteredRepos = repos.data.filter((repo) => {
        if (!secondFilter) {
          return repo.name.includes(filterBy);
        } else {
          return repo.name.includes(filterBy) && repo.name.includes(secondFilter);
        }
      });
      dispatch({
        type: consts.SET_REPOS_DATA,
        repos: filteredRepos
      });
      dispatch(AlertModalActions.closeAlertDialog());
    });
  });
}

function searchAndFilter(bookId, languageId) {
  return ((dispatch) => {
    dispatch( AlertModalActions.openAlertDialog("Searching, Please wait...", true));
    let searchBy = `${languageId}_${bookId}`;
    getGogs().searchRepos(searchBy).then((repos) => {
      let filteredRepos = repos.filter((repo) => {
        return repo.name.includes(languageId);
      });
      dispatch({
        type: consts.SET_REPOS_DATA,
        repos: filteredRepos
      });
      dispatch(AlertModalActions.closeAlertDialog());
    });
  });
}

function searchBy(searchBy) {
  return ((dispatch) => {
    dispatch( AlertModalActions.openAlertDialog("Searching, Please wait...", true));
    getGogs().searchRepos(searchBy).then((repos) => {
      dispatch({
        type: consts.SET_REPOS_DATA,
        repos
      });
      dispatch(AlertModalActions.closeAlertDialog());
    });
  });
}
