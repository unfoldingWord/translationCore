import fs from 'fs-extra';
import path from 'path-extra';
import * as saveMethods from '../src/js/localStorage/saveMethods';

describe('Tests for saveMethods', () => {
  it('should not save the manifest file since projectSaveLocation is empty', () => {
    const state = {
      projectDetailsReducer: {
        manifest: {
          id: 'id'
        }
      }
    };
    saveMethods.saveProjectManifest(state);
    const manifestPath = 'manifest.json';
    expect(fs.existsSync(manifestPath)).not.toBeTruthy();
  });

  it('should not save the manifest file since manifest is empty', () => {
    const state = {
      projectDetailsReducer: {
        manifest: {},
        projectSaveLocation: '/tmp',
      }
    };
    saveMethods.saveProjectManifest(state);
    const manifestPath = path.join(state.projectDetailsReducer.projectSaveLocation, 'manifest.json');
    expect(fs.existsSync(manifestPath)).not.toBeTruthy();
  });

  it('should save the manifest file', () => {
    const state = {
      projectDetailsReducer: {
        manifest: {
          id: 'id'
        },
        projectSaveLocation: '/tmp'
      }
    };
    saveMethods.saveProjectManifest(state);
    const manifestPath = path.join(state.projectDetailsReducer.projectSaveLocation, 'manifest.json');
    expect(fs.existsSync(manifestPath)).toBeTruthy();
    const json = fs.readJsonSync(manifestPath);
    expect(json).toEqual(state.projectDetailsReducer.manifest);
    fs.unlinkSync(manifestPath);
  });
});
