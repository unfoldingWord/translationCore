/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import OnlineImportModal from '../js/components/home/projectsManagement/OnlineImportModal';

describe('OnlineImportModal component renders correctly', () => {
  test('OnlineImportModal Component render should match snapshot', () => {
    const importOnlineReducer = {
      showOnlineButton: true,
      showBack: false,
      importLink: '',
      repos: [
        {
          'id': 11341,
          'owner': {
            'id': 4989,
            'login': 'manny-test',
            'full_name': 'manny test',
            'email': 'manny-test@noreply.door43.org',
            'avatar_url': 'https://secure.gravatar.com/avatar/c7dd170301474c6fedfe344f7a095a05',
            'username': 'manny-test',
          },
          'name': 'hi_tit_text_reg',
          'full_name': 'manny-test/hi_tit_text_reg',
          'description': 'ts-desktop: hi_tit_text_reg',
          'html_url': 'https://git.door43.org/manny-test/hi_tit_text_reg',
          'ssh_url': 'git@git.door43.org:manny-test/hi_tit_text_reg.git',
          'clone_url': 'https://git.door43.org/manny-test/hi_tit_text_reg.git',
        },
      ],
      onlineProjects: null,
      loggedIn: true,
      showLoadingCircle: false,
      err: null,
    };

    const homeScreenReducer = {
      displayHomeView: true,
      showWelcomeSplash: true,
      homeInstructions: <div/>,
      stepper: {
        stepIndex: 0,
        nextStepName: 'Go To User',
        previousStepName: '',
        nextDisabled: false,
        stepIndexAvailable: [true, true, false, false],
        stepperLabels: ['Home', 'User', 'Project', 'Tool'],
      },
      showFABOptions: false,
      showLicenseModal: false,
      onlineImportModalVisibility: true,
      dimmedScreen: false,
    };

    const loginReducer = {
      loggedInUser: false,
      userdata: { username: 'manny-test' },
      feedback: '',
      subject: 'Bug Report',
      placeholder: 'Leave us your feedback!',
    };

    const actions = {
      closeOnlineImportModal: () => jest.fn(),
      handleURLInputChange: () => jest.fn(),
      loadProjectFromLink: () => jest.fn(),
      searchReposByUser: () => jest.fn(),
      searchReposByQuery: () => jest.fn(),
    };

    const modal = shallow(
      <OnlineImportModal
        translate={key => key}
        importOnlineReducer={importOnlineReducer}
        homeScreenReducer={homeScreenReducer}
        loginReducer={loginReducer}
        actions={actions} />,
    ).dive();
    expect(modal).toMatchSnapshot();
  });
});
