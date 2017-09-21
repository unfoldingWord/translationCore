/* eslint-env jest */

import consts from '../src/js/actions/ActionTypes';
import * as BodyUIActions from '../src/js/actions/BodyUIActions';

describe('BodyUIActions.toggleHomeView', () => {
    test('Create action to open home view', () => {
        const expectedAction = {
            type: consts.TOGGLE_HOME_VIEW,
            boolean: true
        };
        expect(BodyUIActions.toggleHomeView(true)).toEqual(expectedAction);
    });

    test('Create action to close home view', () => {
        const expectedAction = {
            type: consts.TOGGLE_HOME_VIEW,
            boolean: false
        };
        expect(BodyUIActions.toggleHomeView(false)).toEqual(expectedAction);
    });
});

describe('BodyUIActions.changeHomeInstructions', () => {
    test('Change instructions', () => {
        const expectedAction = {
            type: consts.CHANGE_HOME_INSTRUCTIONS,
            instructions: "instructions"
        };
        expect(BodyUIActions.changeHomeInstructions("instructions")).toEqual(expectedAction);
    });
});