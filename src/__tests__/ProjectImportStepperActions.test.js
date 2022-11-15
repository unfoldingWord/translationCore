/* eslint-env jest */
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import consts from '../js/actions/ActionTypes';
import * as ProjectImportStepperActions from '../js/actions/ProjectImportStepperActions';
// Mock store set up
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
// constants
const PROJECT_INFORMATION_CHECK_NAMESPACE = 'projectInformationCheck';
const MISSING_VERSES_NAMESPACE = 'missingVersesCheck';

jest.mock('../js/actions/MyProjects/ProjectLoadingActions', () => ({ displayTools: () => ({ type: 'DISPLAY_TOOLS' }) }));


describe('ProjectImportStepperActions.initiateProjectValidationStepper', () => {
  it('should create a target language bible when no steps have been flagged as needed', () => {
    const mockStoreData = {
      projectDetailsReducer: {},
      projectValidationReducer: { projectValidationStepsArray: [] },
    };
    const expectedActions = [];
    const store = mockStore(mockStoreData);
    store.dispatch(ProjectImportStepperActions.initiateProjectValidationStepper());
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('should not create a target language bible because not all steps are complete', () => {
    const expectedActions = [
      {
        type: 'GO_TO_PROJECT_VALIDATION_STEP',
        stepIndex: 3,
      },
    ];
    const mockStoreData = {
      projectDetailsReducer: {},
      projectValidationReducer: {
        projectValidationStepsArray: [
          {
            buttonName: 'Missing Verses',
            index: 3,
            namespace: 'missingVersesCheck',
          },
        ],
      },
    };
    let store = mockStore(mockStoreData);
    store.dispatch(ProjectImportStepperActions.initiateProjectValidationStepper());
    expect(store.getActions()).toEqual(expectedActions);
  });
});

describe('ProjectImportStepperActions.updateStepperIndex', () => {
  it('should create a target language bible after all steps are complete', () => {
    const expectedActions = [
      {
        type: consts.TOGGLE_PROJECT_VALIDATION_STEPPER,
        showProjectValidationStepper: false,
      },
    ];
    const mockStoreData = {
      projectDetailsReducer: {},
      projectValidationReducer: { projectValidationStepsArray: [] },
    };
    let store = mockStore(mockStoreData);
    store.dispatch(ProjectImportStepperActions.updateStepperIndex());
    expect(store.getActions()).toEqual(expectedActions);
  });
});


describe('ProjectImportStepperActions.addProjectValidationStep', () => {
  it('should add a step to the stepper', () => {
    const expectedActions = [
      {
        type: consts.ADD_PROJECT_VALIDATION_STEP,
        namespace: PROJECT_INFORMATION_CHECK_NAMESPACE,
        buttonName: 'project_information',
        index: 1,
      },
    ];
    let store = mockStore({});
    store.dispatch(ProjectImportStepperActions.addProjectValidationStep(PROJECT_INFORMATION_CHECK_NAMESPACE));
    expect(store.getActions()).toEqual(expectedActions);
  });
});


describe('ProjectImportStepperActions.removeProjectValidationStep', () => {
  it('should remove a step from the stepper', () => {
    const expectedActions = [
      {
        type: consts.REMOVE_PROJECT_VALIDATION_STEP,
        projectValidationStepsArray: [],
      },
    ];
    const mockStoreData = {
      projectValidationReducer: {
        projectValidationStepsArray: [
          {
            buttonName: 'Missing Verses',
            index: 3,
            namespace: MISSING_VERSES_NAMESPACE,
          },
        ],
      },
    };
    let store = mockStore(mockStoreData);
    store.dispatch(ProjectImportStepperActions.removeProjectValidationStep(MISSING_VERSES_NAMESPACE));
    expect(store.getActions()).toEqual(expectedActions);
  });
});

describe('ProjectImportStepperActions.confirmContinueOrCancelImportValidation', () => {
  test('should cancel the import stepper process', () => {
    const expectedActions = [
      {
        type: 'OPEN_OPTION_DIALOG',
        alertMessage: 'projects.cancel_import_alert',
        callback: expect.any(Function),
        button1Text: 'buttons.continue_import_button',
        button2Text: 'buttons.cancel_import_button',
        buttonLinkText: null,
        callback2: null,
        notCloseableAlert: false,
      },
    ];
    const store = mockStore({ projectDetailsReducer: { projectSaveLocation: '' } });
    store.dispatch(ProjectImportStepperActions.confirmContinueOrCancelImportValidation());
    expect(store.getActions()).toEqual(expectedActions);
  });
});

