import { describe, it } from 'mocha';
import { expect } from 'chai';
import fs from 'fs-extra';
//helpers
import * as ManifestHelpers from '../src/js/helpers/manifestHelpers';
//projects
const noMissingVersesProjectPath = window.__base + 'test/fixtures/project/missingVerses/no_missing_verses';
const someMissingVersesProjectPath = window.__base + 'test/fixtures/project/missingVerses/some_missing_verses';

describe('ManifestHelpers.setUpManifest', () => {
  it('should create a default manifest for a project with no manifest', function (done) {
    let manifest = ManifestHelpers.setUpManifest(noMissingVersesProjectPath, null, null, 'RoyalSix');
    console.log(manifest);
    done()
  })
})