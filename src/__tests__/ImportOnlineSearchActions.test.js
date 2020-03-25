/* eslint-env jest */
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import fetchMock from 'fetch-mock';
import consts from '../js/actions/ActionTypes';
// actions
import * as ImportOnlineSearchActions from '../js/actions/ImportOnlineSearchActions';

// mock repos
const repos = [
  {
    'id': 2240,
    'owner': {
      'id': 3919,
      'login': 'QATest1',
      'full_name': '',
      'email': 'qatest1@noreply.door43.org',
      'avatar_url': 'https://secure.gravatar.com/avatar/e60cb8172a7bc97715ed5393a9ee7f9e',
      'username': 'QATest1',
    },
    'name': 'aac_tit_text_reg',
    'full_name': 'QATest1/aac_tit_text_reg',
    'description': '',
    'html_url': 'https://git.door43.org/QATest1/aac_tit_text_reg',
    'ssh_url': 'git@git.door43.org:QATest1/aac_tit_text_reg.git',
    'clone_url': 'https://git.door43.org/QATest1/aac_tit_text_reg.git',
  },
  {
    'id': 11727,
    'owner': {
      'id': 4232,
      'login': 'royalsix',
      'full_name': 'Jay Scott',
      'email': 'royalsix@noreply.door43.org',
      'avatar_url': 'https://git.door43.org/img/avatar_default.png',
      'username': 'royalsix',
    },
    'name': 'amo_mat_text_reg',
    'full_name': 'royalsix/amo_mat_text_reg',
    'description': 'tc-desktop: amo_mat_text_reg',
    'html_url': 'https://git.door43.org/royalsix/amo_mat_text_reg',
    'ssh_url': 'git@git.door43.org:royalsix/amo_mat_text_reg.git',
    'clone_url': 'https://git.door43.org/royalsix/amo_mat_text_reg.git',
  },
  {
    'id': 11341,
    'owner': {
      'id': 4989,
      'login': 'klappy-test',
      'full_name': 'Christopher Klapp Test Account',
      'email': 'klappy-test@noreply.door43.org',
      'avatar_url': 'https://secure.gravatar.com/avatar/c7dd170301474c6fedfe344f7a095a05',
      'username': 'klappy-test',
    },
    'name': 'hi_tit_text_reg',
    'full_name': 'klappy-test/hi_tit_text_reg',
    'description': 'ts-desktop: hi_tit_text_reg',
    'html_url': 'https://git.door43.org/klappy-test/hi_tit_text_reg',
    'ssh_url': 'git@git.door43.org:klappy-test/hi_tit_text_reg.git',
    'clone_url': 'https://git.door43.org/klappy-test/hi_tit_text_reg.git',
  },
];

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('ImportOnlineSearchActions async actions', () => {
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  test('ImportOnlineSearchActions.searchReposByUser with user should display list of repos for mannytest', () => {
    fetchMock.getOnce('https://git.door43.org/api/v1/users/mannytest/repos', repos);

    const expectedActions = [
      {
        'type': consts.OPEN_ALERT_DIALOG, 'alertMessage': 'projects.searching_alert', 'loading': true,
      },
      { type: consts.SET_REPOS_DATA, repos: repos },
      { type: consts.CLOSE_ALERT_DIALOG },
    ];

    const store = mockStore({ repos: [] });

    return store.dispatch(ImportOnlineSearchActions.searchReposByUser('mannytest')).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  test('ImportOnlineSearchActions.searchReposByUser with user and bookId should display list of repos for mannytest with the specified bookId', () => {
    fetchMock.getOnce('https://git.door43.org/api/v1/users/mannytest/repos', repos);

    const expectedActions = [
      {
        'type': consts.OPEN_ALERT_DIALOG, 'alertMessage': 'projects.searching_alert', 'loading': true,
      },
      {
        type: consts.SET_REPOS_DATA, repos: [
          {
            'id': 11727,
            'owner': {
              'id': 4232,
              'login': 'royalsix',
              'full_name': 'Jay Scott',
              'email': 'royalsix@noreply.door43.org',
              'avatar_url': 'https://git.door43.org/img/avatar_default.png',
              'username': 'royalsix',
            },
            'name': 'amo_mat_text_reg',
            'full_name': 'royalsix/amo_mat_text_reg',
            'description': 'tc-desktop: amo_mat_text_reg',
            'html_url': 'https://git.door43.org/royalsix/amo_mat_text_reg',
            'ssh_url': 'git@git.door43.org:royalsix/amo_mat_text_reg.git',
            'clone_url': 'https://git.door43.org/royalsix/amo_mat_text_reg.git',
          }],
      },
      { type: consts.CLOSE_ALERT_DIALOG },
    ];

    const store = mockStore({ repos: [] });

    return store.dispatch(ImportOnlineSearchActions.searchReposByUser('mannytest', 'mat')).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  test('ImportOnlineSearchActions.searchReposByUser with user and bookId and laguageId should return display repos for mannytest with the specified languageId & bookId', () => {
    fetchMock.getOnce('https://git.door43.org/api/v1/users/mannytest/repos', repos);

    const expectedActions = [
      {
        'type': consts.OPEN_ALERT_DIALOG, 'alertMessage': 'projects.searching_alert', 'loading': true,
      },
      {
        type: consts.SET_REPOS_DATA, repos: [
          {
            'id': 11341,
            'owner': {
              'id': 4989,
              'login': 'klappy-test',
              'full_name': 'Christopher Klapp Test Account',
              'email': 'klappy-test@noreply.door43.org',
              'avatar_url': 'https://secure.gravatar.com/avatar/c7dd170301474c6fedfe344f7a095a05',
              'username': 'klappy-test',
            },
            'name': 'hi_tit_text_reg',
            'full_name': 'klappy-test/hi_tit_text_reg',
            'description': 'ts-desktop: hi_tit_text_reg',
            'html_url': 'https://git.door43.org/klappy-test/hi_tit_text_reg',
            'ssh_url': 'git@git.door43.org:klappy-test/hi_tit_text_reg.git',
            'clone_url': 'https://git.door43.org/klappy-test/hi_tit_text_reg.git',
          }],
      },
      { type: consts.CLOSE_ALERT_DIALOG },
    ];

    const store = mockStore({ repos: [] });

    return store.dispatch(ImportOnlineSearchActions.searchReposByUser('mannytest', 'hi', 'tit')).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  test('ImportOnlineSearchActions.searchByQuery with search query should display repos with the specified query criteria', () => {
    fetchMock.getOnce('https://git.door43.org/api/v1/repos/search?q=hi_tit&uid=0&limit=100', {
      data: [
        {
          'id': 11341,
          'owner': {
            'id': 4989,
            'login': 'klappy-test',
            'full_name': 'Christopher Klapp Test Account',
            'email': 'klappy-test@noreply.door43.org',
            'avatar_url': 'https://secure.gravatar.com/avatar/c7dd170301474c6fedfe344f7a095a05',
            'username': 'klappy-test',
          },
          'name': 'hi_tit_text_reg',
          'full_name': 'klappy-test/hi_tit_text_reg',
          'description': 'ts-desktop: hi_tit_text_reg',
          'html_url': 'https://git.door43.org/klappy-test/hi_tit_text_reg',
          'ssh_url': 'git@git.door43.org:klappy-test/hi_tit_text_reg.git',
          'clone_url': 'https://git.door43.org/klappy-test/hi_tit_text_reg.git',
        },
      ],
    });

    const expectedActions = [
      {
        'type': consts.OPEN_ALERT_DIALOG, 'alertMessage': 'projects.searching_alert', 'loading': true,
      },
      {
        type: consts.SET_REPOS_DATA, repos: [
          {
            'id': 11341,
            'owner': {
              'id': 4989,
              'login': 'klappy-test',
              'full_name': 'Christopher Klapp Test Account',
              'email': 'klappy-test@noreply.door43.org',
              'avatar_url': 'https://secure.gravatar.com/avatar/c7dd170301474c6fedfe344f7a095a05',
              'username': 'klappy-test',
            },
            'name': 'hi_tit_text_reg',
            'full_name': 'klappy-test/hi_tit_text_reg',
            'description': 'ts-desktop: hi_tit_text_reg',
            'html_url': 'https://git.door43.org/klappy-test/hi_tit_text_reg',
            'ssh_url': 'git@git.door43.org:klappy-test/hi_tit_text_reg.git',
            'clone_url': 'https://git.door43.org/klappy-test/hi_tit_text_reg.git',
          }],
      },
      { type: consts.CLOSE_ALERT_DIALOG },
    ];

    const store = mockStore({ repos: [] });

    return store.dispatch(ImportOnlineSearchActions.searchByQuery('hi_tit')).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  test('ImportOnlineSearchActions.searchByQuery should display an alert if no internet connection is found.', () => {
    const expectedActions = [
      {
        alertMessage: 'no_internet',
        loading: undefined,
        type: 'OPEN_ALERT_DIALOG',
      },
    ];

    const store = mockStore({ repos: [] });

    return store.dispatch(ImportOnlineSearchActions.searchByQuery('hi_tit', false)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  test('ImportOnlineSearchActions.searchReposByUser should display an alert if no internet connection is found.', () => {
    const expectedActions = [
      {
        alertMessage: 'no_internet',
        loading: undefined,
        type: 'OPEN_ALERT_DIALOG',
      },
    ];

    const store = mockStore({ repos: [] });

    return store.dispatch(ImportOnlineSearchActions.searchReposByUser('mannytest', 'hi', 'tit', false)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
