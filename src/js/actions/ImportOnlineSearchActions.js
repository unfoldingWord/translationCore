/* eslint-disable no-console */
import { getTranslate } from '../selectors';
import { DCS_BASE_URL } from '../common/constants';
import consts from './ActionTypes';
// actions
import * as AlertModalActions from './AlertModalActions';

const SEARCH_PAGE_SIZE = 50;
const SEARCH_RESULTS_MAX = 100;

export function searchReposByQuery(query) {
  return (dispatch) => {
    if (query) {
      if (query.user && query.bookId && query.languageId) {
        // search by user, bookId and languageId
        dispatch(searchReposByUser(query.user, query.bookId, query.languageId));
      } else if (query.user && query.bookId) {
        // search by user and bookId
        dispatch(searchReposByUser(query.user, query.bookId));
      } else if (query.user && query.languageId) {
        // search by user and languageId
        dispatch(searchReposByUser(query.user, query.languageId));
      } else if (query.bookId && query.languageId) {
        // search by languageId and bookId, search in both old name format and new name format
        const searchQuery = `${query.languageId}%5C_${query.bookId},${query.languageId}%5C_%25%5C_${query.bookId}%5C_`;
        dispatch(searchByQuery(searchQuery));
      } else if (query.bookId) {
        // search only by bookId
        dispatch(searchByQuery(query.bookId));
      } else if (query.languageId) {
        // search only by languageId
        dispatch(searchByQuery(query.languageId));
      } else if (query.user) {
        // search by user only
        dispatch(searchReposByUser(query.user));
      }
    }
  };
}

export const searchReposByUser = (user, firstFilter, secondFilter, onLine = navigator.onLine) => async (dispatch, getState) => {
  const translate = getTranslate(getState());

  if (onLine) {
    dispatch(AlertModalActions.openAlertDialog(translate('projects.searching_alert'), true));

    try {
      let repos = await fetchAllUserRepoPages(user);

      repos = filterReposBy(repos, firstFilter, secondFilter);
      dispatch({
        type: consts.SET_REPOS_DATA,
        repos,
      });
    } catch (e) {
      // Failed to find repo for user specified therefore clear repos list in the reducer.
      dispatch({
        type: consts.SET_REPOS_DATA,
        repos: [],
        e,
      });
    }
    dispatch(AlertModalActions.closeAlertDialog());
  } else {
    dispatch(AlertModalActions.openAlertDialog(translate('no_internet')));
  }
};

export function searchByQuery(query, onLine = navigator.onLine) {
  return async (dispatch, getState) => {
    const translate = getTranslate(getState());

    if (onLine) {
      dispatch(AlertModalActions.openAlertDialog(translate('projects.searching_alert'), true));

      try {
        const repos = await fetchAllSearchResultPages(query);

        dispatch({
          type: consts.SET_REPOS_DATA,
          repos,
        });
      } catch (e) {
        // Failed to find repo for user specified therefore clear repos list in the reducer.
        dispatch({
          type: consts.SET_REPOS_DATA,
          repos: [],
        });
      }
      dispatch(AlertModalActions.closeAlertDialog());
    } else {
      dispatch(AlertModalActions.openAlertDialog(translate('no_internet')));
    }
  };
}

/**
 * repeatedly fetches pages from buildUrl until a page comes back short of SEARCH_PAGE_LIMIT items,
 * since DCS paginates results and caps each response at that limit
 * @param {function(number): string} buildUrl - Function that takes a page number and returns a URL string
 * @param {function(*): Array} extractItems - Function that takes JSON and returns an array of items
 * @return {Promise<Array>} combined items from every page
 */
async function fetchAllPages(buildUrl, extractItems) {
  let items = [];
  let page = 1;
  let fetchedFullPage = true;

  // each page's fetch depends on knowing whether the previous page was full, so this can't be parallelized
  /* eslint-disable no-await-in-loop */
  while (fetchedFullPage && (items.length < SEARCH_RESULTS_MAX)) {
    const url = buildUrl(page);
    console.log(`fetchAllPages - searching ${url}`);
    const response = await fetch(url);
    const json = await response.json();
    const data = extractItems(json);

    items = items.concat(data);
    fetchedFullPage = data.length === SEARCH_PAGE_SIZE;
    page++;
  }
  return items;
}

/**
 * fetches all pages of repo search results for the given query
 * @param {string} query
 * @return {Promise<Array>} combined repos from every page
 */
function fetchAllSearchResultPages(query) {
  return fetchAllPages(
    (page) => `${DCS_BASE_URL}/api/v1/repos/search?q=${query}&uid=0&limit=${SEARCH_PAGE_SIZE}&page=${page}`,
    (json) => (Array.isArray(json.data) ? json.data : []),
  );
}

/**
 * fetches all pages of repos owned by the given user
 * @param {string} user
 * @return {Promise<Array>} combined repos from every page
 */
function fetchAllUserRepoPages(user) {
  return fetchAllPages(
    (page) => `${DCS_BASE_URL}/api/v1/users/${user}/repos?limit=${SEARCH_PAGE_SIZE}&page=${page}`,
    (json) => (Array.isArray(json) ? json : []),
  );
}

function filterReposBy(repos, firstFilter, secondFilter) {
  if (!Array.isArray(repos)) { // TRICKY: if no repos then return empty array
    return [];
  }

  if (firstFilter || secondFilter) {
    repos = repos.filter((repo) => {
      if (!secondFilter) {
        return repo.name.includes(firstFilter);
      } else {
        return repo.name.includes(firstFilter) && repo.name.includes(secondFilter);
      }
    });
  }
  return repos;
}
