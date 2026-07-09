import fs from 'fs-extra';
import path from 'path-extra';
import {
  mergeLocalIntoRemoteClone, mergeManifests, unionCheckData,
} from '../js/helpers/ProjectSyncHelpers';
import { copyAlignmentData } from '../js/helpers/ProjectOverwriteHelpers';

jest.mock('fs-extra');
// spy on copyAlignmentData (its own remote-wins behavior is covered in ProjectOverwriteHelpers.test.js);
// here we only verify mergeLocalIntoRemoteClone delegates to it with the right directories.
jest.mock('../js/helpers/ProjectOverwriteHelpers', () => ({
  ...require.requireActual('../js/helpers/ProjectOverwriteHelpers'),
  copyAlignmentData: jest.fn(),
}));

const localPath = path.join('projects', 'en_tit');
const clonePath = path.join('imports', 'en_tit');
const manifest = {
  project: { id: 'tit', name: 'Titus' },
  checkers: ['alice'],
  translators: ['bob'],
};

describe('ProjectSyncHelpers.unionCheckData', () => {
  beforeEach(() => {
    fs.__resetMockFS();
  });

  it('copies files that are missing at the destination and keeps existing files', () => {
    // given
    const fromDir = path.join('from', 'checkData');
    const toDir = path.join('to', 'checkData');
    fs.outputJsonSync(path.join(fromDir, 'selections', 'tit', '1', '1', '2020-01-01.json'), { from: true });
    fs.outputJsonSync(path.join(fromDir, 'comments', 'tit', '1', '2', '2020-01-02.json'), { from: true });
    fs.outputJsonSync(path.join(toDir, 'selections', 'tit', '1', '1', '2020-01-01.json'), { to: true });

    // when
    unionCheckData(fromDir, toDir);

    // then
    // existing file is not overwritten
    expect(fs.readJsonSync(path.join(toDir, 'selections', 'tit', '1', '1', '2020-01-01.json'))).toEqual({ to: true });
    // missing file is copied
    expect(fs.readJsonSync(path.join(toDir, 'comments', 'tit', '1', '2', '2020-01-02.json'))).toEqual({ from: true });
  });

  it('does nothing when the source folder does not exist', () => {
    // given
    const toDir = path.join('to', 'checkData');
    fs.outputJsonSync(path.join(toDir, 'selections', 'x.json'), { to: true });

    // when
    unionCheckData(path.join('missing', 'checkData'), toDir);

    // then
    expect(fs.readJsonSync(path.join(toDir, 'selections', 'x.json'))).toEqual({ to: true });
  });
});

describe('ProjectSyncHelpers.mergeManifests', () => {
  beforeEach(() => {
    fs.__resetMockFS();
  });

  it('unions checkers and translators without duplicates', () => {
    // given
    fs.outputJsonSync(path.join(localPath, 'manifest.json'), {
      ...manifest, checkers: ['alice', 'carol'], translators: ['bob'],
    });
    fs.outputJsonSync(path.join(clonePath, 'manifest.json'), {
      ...manifest, checkers: ['alice', 'dave'], translators: ['eve'],
    });

    // when
    mergeManifests(localPath, clonePath);

    // then
    const merged = fs.readJsonSync(path.join(clonePath, 'manifest.json'));
    expect(merged.checkers).toEqual(['alice', 'carol', 'dave']);
    expect(merged.translators).toEqual(['bob', 'eve']);
  });
});

describe('ProjectSyncHelpers.mergeLocalIntoRemoteClone', () => {
  beforeEach(() => {
    fs.__resetMockFS();
    fs.outputJsonSync(path.join(localPath, 'manifest.json'), manifest);
    fs.outputJsonSync(path.join(clonePath, 'manifest.json'), manifest);
  });

  it('copies the local .apps folder when the clone has none, and keeps the clone .git', () => {
    // given
    fs.outputJsonSync(path.join(localPath, '.apps', 'translationCore', 'checkData', 'selections', 'tit', '1', '1', '2020-01-01.json'), { local: true });
    fs.outputFileSync(path.join(clonePath, '.git', 'HEAD'), 'ref: refs/heads/master');
    const dispatch = jest.fn();

    // when
    mergeLocalIntoRemoteClone(localPath, clonePath, 'user', dispatch);

    // then
    expect(fs.readJsonSync(path.join(clonePath, '.apps', 'translationCore', 'checkData', 'selections', 'tit', '1', '1', '2020-01-01.json'))).toEqual({ local: true });
    expect(fs.readFileSync(path.join(clonePath, '.git', 'HEAD'))).toEqual('ref: refs/heads/master'); // clone .git untouched
    expect(dispatch).toHaveBeenCalled(); // createVerseEditsForAllChangedVerses dispatched
  });

  it('keeps local check data as the base and unions in remote-only check data', () => {
    // given
    fs.outputJsonSync(path.join(localPath, '.apps', 'translationCore', 'checkData', 'selections', 'tit', '1', '1', 'local.json'), { local: true });
    fs.outputJsonSync(path.join(clonePath, '.apps', 'translationCore', 'checkData', 'selections', 'tit', '1', '2', 'remote.json'), { remote: true });
    const dispatch = jest.fn();

    // when
    mergeLocalIntoRemoteClone(localPath, clonePath, 'user', dispatch);

    // then
    const checkDataPath = path.join(clonePath, '.apps', 'translationCore', 'checkData', 'selections', 'tit', '1');
    expect(fs.readJsonSync(path.join(checkDataPath, '1', 'local.json'))).toEqual({ local: true }); // local kept
    expect(fs.readJsonSync(path.join(checkDataPath, '2', 'remote.json'))).toEqual({ remote: true }); // remote unioned in
    expect(fs.existsSync(path.join(clonePath, '.temp_apps'))).toBeFalsy(); // temp dir cleaned up
  });

  it('uses local .apps as the base and overlays the remote alignment dir via copyAlignmentData', () => {
    // given
    const localAlignments = { 1: { alignments: [{ bottomWords: ['local'] }] } };
    const remoteAlignments = { 1: { alignments: [{ bottomWords: ['remote'] }] } };
    fs.outputJsonSync(path.join(localPath, '.apps', 'translationCore', 'alignmentData', 'tit', '1.json'), localAlignments);
    fs.outputJsonSync(path.join(clonePath, '.apps', 'translationCore', 'alignmentData', 'tit', '1.json'), remoteAlignments);
    copyAlignmentData.mockClear();
    const dispatch = jest.fn();

    // when
    mergeLocalIntoRemoteClone(localPath, clonePath, 'user', dispatch);

    // then
    // local .apps becomes the base of the clone (the remote alignment file is replaced by local before overlay)
    expect(fs.readJsonSync(path.join(clonePath, '.apps', 'translationCore', 'alignmentData', 'tit', '1.json'))[1].alignments[0].bottomWords).toEqual(['local']);
    // the remote alignment directory (saved aside under .temp_apps) is overlaid onto the local base
    expect(copyAlignmentData).toHaveBeenCalledWith(
      path.join(clonePath, '.temp_apps', 'translationCore', 'alignmentData', 'tit'),
      path.join(clonePath, '.apps', 'translationCore', 'alignmentData', 'tit'),
    );
    expect(fs.existsSync(path.join(clonePath, '.temp_apps'))).toBeFalsy(); // temp dir cleaned up
  });
});
