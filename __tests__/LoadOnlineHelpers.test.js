/* eslint-env jest */

import path from 'path-extra';
import fs from 'fs-extra';
//helpers
import * as loadOnline from '../src/js/helpers/LoadOnlineHelpers';

const badSave = path.join(path.homedir(), 'translationCore', 'projects', 'id_-cfksl');

describe('loadOnline.openManifest', function () {
    test('loadOnline.openManifest should return an error if no link is specified', () => {
        return new Promise((resolve) => {
            loadOnline.openManifest(null, function (err, savePath, url) {
                expect(typeof err.text).toEqual('string');
                expect(savePath).toBeNull();
                expect(url).toBeNull();
                expect(err.text).toEqual('No link specified');
                resolve();
            });
        });
    });

    test('loadOnline.openManifest should fail on an invalid link.', () => {
        jest.setTimeout(5000);
        fs.removeSync(badSave);
        return new Promise((resolve) => {
            loadOnline.openManifest('https://git.door43.org/klappy/noprojecthere.git', function (err, savePath, url) {
                expect(savePath).toBeNull();
                expect(url).toBeNull();
                expect(typeof err.text).toEqual('string');
                resolve();
            });
        });
    });

    test('loadOnline.openManifest should not deny a non .git link.', () => {
        return new Promise((resolve) => {
            const expectedSavePath = path.join(path.homedir(), 'translationCore', 'projects', 'bhadrawahi_tit');
            const expectedURL = 'https://git.door43.org/klappy/bhadrawahi_tit';
            loadOnline.openManifest(expectedURL, function (err, savePath, url) {
                expect(savePath).toEqual(expectedSavePath);
                expect(url).toEqual(expectedURL + '.git');
                fs.removeSync(savePath);
                resolve();
            });
        });
    });

    test('loadOnline.openManifest should return the home directory and url', () => {
        return new Promise((resolve) => {
            const expectedSavePath = path.join(path.homedir(), 'translationCore', 'projects', 'bhadrawahi_tit');
            const expectedURL = 'https://git.door43.org/klappy/bhadrawahi_tit.git';
            loadOnline.openManifest(expectedURL, function (err, savePath, url) {
                expect(err).toBeNull();
                expect(savePath).toEqual(expectedSavePath);
                expect(url).toEqual(expectedURL);
                resolve();
            });
        });
    });
});
