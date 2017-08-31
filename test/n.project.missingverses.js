import { describe, it } from 'mocha';
import { expect } from 'chai';
import fs from 'fs-extra';
//helpers
import * as MissingVersesHelpers from '../src/js/helpers/MissingVersesHelpers';
//projects
const noMissingVersesProjectPath = window.__base + 'test/fixtures/project/missingVerses/no_missing_verses';
const someMissingVersesProjectPath = window.__base + 'test/fixtures/project/missingVerses/some_missing_verses';

describe('MissingVersesHelpers.findMissingVerses', () => {
  it('should find missing verses in the project', function (done) {
    let missingVerses = MissingVersesHelpers.findMissingVerses(someMissingVersesProjectPath, 'php')
    expect(missingVerses).to.deep.equal({ '1': [ 28, 29, 30 ], '3': [ 21 ] })
    done()
  })
  it('should not find missing verses in the project', function (done) {
    let missingVerses = MissingVersesHelpers.findMissingVerses(noMissingVersesProjectPath, 'tit')
    expect(missingVerses).to.be.empty
    done()
  })
})