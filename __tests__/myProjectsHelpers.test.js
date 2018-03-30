/* eslint-disable no-console */
/* eslint-env jest */
jest.unmock('fs-extra');
import ncp from 'ncp';
import path from 'path';
import fs from 'fs';
import rimraf from 'rimraf';
import * as myProjectsHelpers from '../src/js/helpers/myProjectsHelpers';

const cleanOutput = () => {
    const files = fs.readdirSync(path.join(__dirname, 'output'));
    for (let f of files) {
        if (f === '.keep') continue;
        rimraf.sync(path.join(__dirname, 'output', f));
    }
};

afterEach(() => {
    cleanOutput();
});

describe('myProjectsHelpers.getProjectsFromFS', () => {
    let out;
    beforeAll(() => {
        return new Promise((resolve, reject) => {
            cleanOutput();
            let src = path.join(__dirname, 'fixtures/project/missingVerses');
            out = path.join(__dirname, 'output/my_projects_fs');
            ncp(src, out, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    });
    test('should get all working projects in a test home directory', () => {
        let projects = myProjectsHelpers.getProjectsFromFS('', out);
        expect(projects).toHaveLength(2);
    });
});

describe('myProjectsHelpers.getProjectsFromFS 2', () => {
    let out;
    beforeAll(() => {
        return new Promise((resolve, reject) => {
            cleanOutput();
            let src = path.join(__dirname, 'fixtures/project/projectVerification');
            out = path.join(__dirname, 'output/my_projects_fs');
            ncp(src, out, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    });
    test('should get all projects in a test home directory with a manifest.json or usfm', () => {
        let projects = myProjectsHelpers.getProjectsFromFS('', out);
        expect(projects).toHaveLength(5);
        expect(projects).toContainEqual(expect.objectContaining({
            projectName: "duplicate_books",
            bookName: "Mark"
        }));
        expect(projects).toContainEqual(expect.objectContaining({
            projectName: "invalid_books",
            bookAbbr: undefined
        }));
        expect(projects).toContainEqual(expect.objectContaining({
            projectName: "multibook_project_2",
            bookName: 'Revelation'
        }));
        expect(projects).toContainEqual(expect.objectContaining({
            projectName: "obs_project_2",
            bookAbbr: 'obs'
        }));
    });
});
