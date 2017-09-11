import { describe, it } from 'mocha';
import { expect } from 'chai';
import fs from 'fs-extra';
//helpers
import * as ManifestHelpers from '../src/js/helpers/manifestHelpers';
import * as LoadHelpers from '../src/js/helpers/LoadHelpers';

//projects
const noMergeConflictsProjectPath = window.__base + 'test/fixtures/project/mergeConflicts/no_merge_conflicts_project';
const normal_project_output = window.__base + 'test/fixtures/project/manifest/normal_project';

describe('ManifestHelpers.setUpManifest', () => {
  it('should create a default manifest from a normal ts project', function (done) {
    let oldManifest = LoadHelpers.loadFile(noMergeConflictsProjectPath, 'manifest.json');
    let manifest = ManifestHelpers.setUpManifest(normal_project_output, null, oldManifest, 'RoyalSix');
    expect(manifest.target_language).to.deep.equal({ "id": 'ha', "name": '(Hausa) هَوُسَ', direction: 'ltr' });
    expect(manifest.project).to.deep.equal({ id: 'tit', name: 'Titus' });
    expect(manifest.source_translations).to.deep.equal(
      [{
        language_id: 'en',
        resource_id: 'ulb',
        checking_level: '3',
        date_modified: 20170329,
        version: '9'
      }]);
    expect(manifest.tcInitialized).to.be.true;
    done()
  })
})


