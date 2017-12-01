/* eslint-env jest */
jest.unmock('fs-extra');
import path from 'path-extra';
import fs from 'fs-extra';
//helpers
import * as loadOnline from '../src/js/helpers/LoadOnlineHelpers';
require('jest');
jest.unmock('simple-git');

describe('LoadOnlineHelpers.importOnlineProjectFromUrl', function () {

    let returnedErrorMessage;
    let returnedUrl;
    let returnedSavePath;

    beforeEach(() => {
        // clear out test projects
        ['bhadrawahi_tit', 'noprojecthere'].forEach((file) => {
            const savePath = path.join(path.homedir(), 'translationCore', 'projects', file);
            fs.removeSync(savePath); // clear out
        });

        returnedErrorMessage = "INVALID";
        returnedUrl = "INVALID";
        returnedSavePath = "INVALID";
    });

    test('LoadOnlineHelpers.importOnlineProjectFromUrl should succeed on valid URL', () => {
        return new Promise((resolve) => {
            const URL = 'https://git.door43.org/klappy/bhadrawahi_tit';
            const expectedURL = 'https://git.door43.org/klappy/bhadrawahi_tit.git';
            const expectedErrorStr = null;
            const gitErrorMessage = null;
            const {mock_git, mock_dispatch, mock_handleImportResults} = mockImport(gitErrorMessage);
            loadOnline.importOnlineProjectFromUrl(URL, mock_dispatch, mock_handleImportResults, mock_git);

            fs.removeSync(returnedSavePath);
            expect(returnedErrorMessage).toEqual(expectedErrorStr);
            expect(returnedUrl).toEqual(expectedURL);
            expect(returnedSavePath).not.toBeNull();
            resolve();
        });
    });

    test('LoadOnlineHelpers.importOnlineProjectFromUrl null link should show error', () => {
        return new Promise((resolve) => {
            const expectedURL = null;
            const expectedErrorStr = "No link specified";
            const gitErrorMessage = null;
            const {mock_git, mock_dispatch, mock_handleImportResults} = mockImport(gitErrorMessage);
            loadOnline.importOnlineProjectFromUrl(expectedURL, mock_dispatch, mock_handleImportResults, mock_git);

            expect(returnedErrorMessage).toEqual(expectedErrorStr);
            expect(returnedUrl).toBeNull();
            expect(returnedSavePath).toBeNull();
            resolve();
        });
    });

    test('LoadOnlineHelpers.importOnlineProjectFromUrl should handle missing .git', () => {
        return new Promise((resolve) => {
            const URL = 'https://git.door43.org/klappy/bhadrawahi_tit';
            const expectedURL = 'https://git.door43.org/klappy/bhadrawahi_tit.git';
            const expectedErrorStr = null;
            const gitErrorMessage = null;
            const {mock_git, mock_dispatch, mock_handleImportResults} = mockImport(gitErrorMessage);
            loadOnline.importOnlineProjectFromUrl(URL, mock_dispatch, mock_handleImportResults, mock_git);

            fs.removeSync(returnedSavePath);
            expect(returnedErrorMessage).toEqual(expectedErrorStr);
            expect(returnedUrl).toEqual(expectedURL);
            expect(returnedSavePath).not.toBeNull();
            resolve();
        });
    });

    test('LoadOnlineHelpers.importOnlineProjectFromUrl with access error should show error', () => {
        return new Promise((resolve) => {
            const expectedURL = 'https://git.door43.org/Danjuma_Alfred_H/sw_tit_text_ulb.git';
            const expectedErrorStr = "Unable to connect to the server. Please check your Internet connection.";
            const gitErrorMessage = "Cloning into 'xxx'...\nfatal: unable to access\n";
            const {mock_git, mock_dispatch, mock_handleImportResults} = mockImport(gitErrorMessage);
            loadOnline.importOnlineProjectFromUrl(expectedURL, mock_dispatch, mock_handleImportResults, mock_git);

            expect(returnedErrorMessage.toString().includes(expectedErrorStr)).toBe(true);
            resolve();
        });
    });

    test('LoadOnlineHelpers.importOnlineProjectFromUrl with disconnect should show error', () => {
        return new Promise((resolve) => {
            const expectedURL = 'https://git.door43.org/Danjuma_Alfred_H/sw_tit_text_ulb.git';
            const expectedErrorStr = "Unable to connect to the server. Please check your Internet connection.";
            const gitErrorMessage = "Cloning into 'xxx'...\nfatal: The remote end hung up\n";
            const {mock_git, mock_dispatch, mock_handleImportResults} = mockImport(gitErrorMessage);
            loadOnline.importOnlineProjectFromUrl(expectedURL, mock_dispatch, mock_handleImportResults, mock_git);

            expect(returnedErrorMessage.toString().includes(expectedErrorStr)).toBe(true);
            resolve();
        });
    });

    test('LoadOnlineHelpers.importOnlineProjectFromUrl failed to load should show error', () => {
        return new Promise((resolve) => {
            const expectedURL = 'https://git.door43.org/Danjuma_Alfred_H/sw_tit_text_ulb.git';
            const expectedErrorStr = "Unable to connect to the server. Please check your Internet connection.";
            const gitErrorMessage = "Cloning into 'xxx'...\nfatal: Failed to load\n";
            const {mock_git, mock_dispatch, mock_handleImportResults} = mockImport(gitErrorMessage);
            loadOnline.importOnlineProjectFromUrl(expectedURL, mock_dispatch, mock_handleImportResults, mock_git);

            expect(returnedErrorMessage.toString().includes(expectedErrorStr)).toBe(true);
            resolve();
        });
    });

    test('LoadOnlineHelpers.importOnlineProjectFromUrl with missing source should show error', () => {
        return new Promise((resolve) => {
            const expectedURL = 'https://git.door43.org/Danjuma_Alfred_H/sw_tit_text_ulb.git';
            const expectedErrorStr = "Project not found";
            const gitErrorMessage = "Cloning into 'xxx'...\nfatal: repository '" + expectedURL + "' not found\n";
            const {mock_git, mock_dispatch, mock_handleImportResults} = mockImport(gitErrorMessage);
            loadOnline.importOnlineProjectFromUrl(expectedURL, mock_dispatch, mock_handleImportResults, mock_git);

            expect(returnedErrorMessage.toString().includes(expectedErrorStr)).toBe(true);
            resolve();
        });
    });

    //
    // helpers
    //

    function mockImport(gitErrorMessage) {
        const mock_git = jest.fn();
        mock_git.mockReturnValue({
            mirror: function (url, path, callback) {
                if (callback) {
                    callback(gitErrorMessage);
                }
            }
        });
        const mock_dispatch = jest.fn();
        mock_dispatch.mockReturnValue(true);
        const mock_handleImportResults = jest.fn((dispatch, url, savePath, errMessage) => {
            returnedErrorMessage = errMessage;
            returnedUrl = url;
            returnedSavePath = savePath;
        });
        return {mock_git, mock_dispatch, mock_handleImportResults};
    }

});
