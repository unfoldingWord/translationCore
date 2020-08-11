import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import consts from '../js/actions/ActionTypes';
import * as actions from '../js/actions/BodyUIActions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('actions.toggleHomeView', () => {
  test('Create action to open home view', () => {
    const expectedAction = {
      type: consts.TOGGLE_HOME_VIEW,
      boolean: true,
    };
    expect(actions.toggleHomeView(true)).toEqual(expectedAction);
  });

  test('Create action to close home view', () => {
    const expectedAction = {
      type: consts.TOGGLE_HOME_VIEW,
      boolean: false,
    };
    expect(actions.toggleHomeView(false)).toEqual(expectedAction);
  });
});

describe('goToNextStep', () => {
  let initialState = {};

  beforeEach(() => {
    initialState = {
      homeScreenReducer: {
        stepper: {
          stepIndex: 1,
          nextStepName: 'Project Information',
          previousStepName: 'Cancel',
          nextDisabled: false,
        },
      },
      loginReducer: {
        loggedInUser: false,
        userdata: {},
        feedback: '',
        subject: 'Bug Report',
        placeholder: 'Leave us your feedback!',
      },
      projectDetailsReducer: {
        projectSaveLocation: '',
        manifest: {},
        currentProjectToolsProgress: {},
        projectType: null,
      },
    };
  });

  it('should not allow logged out user to next step', () => {
    const store = mockStore(initialState);
    store.dispatch(actions.goToNextStep());
    expect(store.getActions()).toEqual([]);
  });

  it('allows logged in user to the next step', () => {
    const expectedActions= [
      {
        type: 'GO_TO_STEP',
        stepIndex: 2,
      },
    ];
    initialState.loginReducer.loggedInUser = true;
    const store = mockStore(initialState);
    store.dispatch(actions.goToNextStep());
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('blocks going to disabled step', () => {
    const expectedActions= [];
    initialState.loginReducer.loggedInUser = true;
    initialState.homeScreenReducer.stepper.nextDisabled = true;
    initialState.homeScreenReducer.stepper.stepIndex = 2;
    const store = mockStore(initialState);
    store.dispatch(actions.goToNextStep());
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('blocks going to step past beginning', () => {
    const expectedActions= [];
    initialState.loginReducer.loggedInUser = true;
    initialState.homeScreenReducer.stepper.nextDisabled = true;
    initialState.homeScreenReducer.stepper.stepIndex = 0;
    const store = mockStore(initialState);
    store.dispatch(actions.goToPrevStep());
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('blocks going to step if project save location is missing', () => {
    const expectedActions= [];
    initialState.loginReducer.loggedInUser = true;
    initialState.homeScreenReducer.stepper.nextDisabled = true;
    initialState.homeScreenReducer.stepper.stepIndex = 2;
    const store = mockStore(initialState);
    store.dispatch(actions.goToNextStep());
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('goes to next step if project save location is set', () => {
    const expectedActions= [
      {
        type: 'GO_TO_STEP',
        stepIndex: 3,
      },
    ];
    initialState.projectDetailsReducer.projectSaveLocation = true;
    initialState.loginReducer.loggedInUser = true;
    initialState.homeScreenReducer.stepper.nextDisabled = true;
    initialState.homeScreenReducer.stepper.stepIndex = 2;
    const store = mockStore(initialState);
    store.dispatch(actions.goToNextStep());
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('blocks going to step past end', () => {
    const expectedActions = [];
    initialState.loginReducer.loggedInUser = true;
    initialState.homeScreenReducer.stepper.nextDisabled = true;
    initialState.homeScreenReducer.stepper.stepIndex = 3;
    const store = mockStore(initialState);
    store.dispatch(actions.goToNextStep());
    expect(store.getActions()).toEqual(expectedActions);
  });
});

describe('actions.dimScreen', () => {
  test('Create action to show the Dimmed Screen', () => {
    const expectedAction = {
      type: consts.SHOW_DIMMED_SCREEN,
      bool: true,
    };
    expect(actions.dimScreen(true)).toEqual(expectedAction);
    expect(actions.dimScreen()).toEqual(expectedAction);
  });
  test('Create action to not show the Dimmed Screen', () => {
    const expectedAction = {
      type: consts.SHOW_DIMMED_SCREEN,
      bool: false,
    };
    expect(actions.dimScreen(false)).toEqual(expectedAction);
  });
});
