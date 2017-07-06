import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as projectSelectionActions from '../src/js/actions/ProjectSelectionActions';
import consts from '../src/js/actions/ActionTypes';
import { expect, assert } from 'chai';
const path = require('path-extra');
const fs = require('fs-extra');
const loadOnline = require('../src/js/components/LoadOnline.js');
var workingProjectExpectedPath = path.join(path.homedir(), 'translationCore', 'id_-co_text_reg');
var missingVerseExpectedPath = path.join(path.homedir(), 'translationCore', 'bes_tit_text_reg');
var mergeConflictExpectedPath = path.join(path.homedir(), 'translationCore', 'ceb_2ti_text_ulb_L2');

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)
const store = mockStore({});

describe('Valid Project Actions', () => {
    it('should select a valid project', function () {
        return projectSelectionActions.isValidProject(workingProjectExpectedPath, null, 'RoyalSix', store.dispatch).then(function (projectObject) {
            expect(projectObject).to.have.all.keys(['manifest', 'projectPath']);
            expect(projectObject).to.deep.include({ projectPath: workingProjectExpectedPath });
        })
    })
    it('should return action on a project with missing verses', function (done) {
        projectSelectionActions.isValidProject(missingVerseExpectedPath, null, 'RoyalSix', store.dispatch)
        setTimeout(() => {
            expect(store.getActions()[0]).to.deep.include({
                type: 'OPEN_OPTION_DIALOG',
                alertMessage: 'Oops! Your project has blank verses! Please contact Help Desk (help@door43.org) for assistance with fixing this problem. If you proceed without fixing, some features may not work properly',
                button1Text: 'Continue Without Fixing',
                button2Text: 'Cancel'
            })
            done();
        }, 100)
    })
    it('fail on a project with git merge conflicts', function () {
        return projectSelectionActions.isValidProject(mergeConflictExpectedPath, null, 'RoyalSix', store.dispatch).then(function (result) {
            throw new Error('Promise was unexpectedly fulfilled. Result: ' + result);
        })
            .catch(function (err) {
                expect(err).to.equal("Oops! The project you are trying to load has a merge conflict and cannot be opened in this version of translationCore! Please contact Help Desk (help@door43.org) for assistance.")
            })
    })
})