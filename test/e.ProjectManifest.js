import {describe, it} from 'mocha';
import {assert} from 'chai';
import {generateManifest} from '../src/js/helpers/manifestHelpers';

const sampleData = {
  repo: 'https://github.com/unfoldingWord-dev/translationCore/',
  user: [{
    full_name: 'Ian Hoegen',
    token: 'fkdlakdl'
  }],
  checkLocations: [
    {
      name: 'translationRhymes',
      location: 'Some location'
    },
    {
      name: 'ExampleChecker',
      location: 'Somewhere'
    }
  ],
  invalidData: 'dklksdflds'
}

var sampleTS = {
  target_language: 'Greek',
  type: 'Translation',
  source_translations: 'Hebrew',
  translators: ['royalsix'],
  project_id: 'ceb_luk_io',
  project: {
    id: 'mrk'
  },
  otherData: 'fsdkljjfdskl'
}

describe('ProjectManifest.populate', function() {
  it('populate should populate a TC manifest, even if no data or ts manifest is specified', function() {
    var generatedManifest = generateManifest();
    assert.isTrue(!!generatedManifest);
    assert.isObject(generatedManifest);
    assert.isString(generatedManifest.time_created)
  });
  it('populate should populate a TC manifest, if only a data argument specified', function() {
    var generatedManifest = generateManifest(sampleData);
    assert.isTrue(!!generatedManifest);
    assert.isObject(generatedManifest);
    assert.isArray(generatedManifest.tools);
    assert.isString(generatedManifest.tools[0]);
    assert.isString(generatedManifest.repo);
    assert.isArray(generatedManifest.checkers);
    assert.isObject(generatedManifest.checkers[0]);
    assert.isString(generatedManifest.checkers[0].token);
    assert.isUndefined(generatedManifest.invalidData);
  });
  it('populate should populate a TC manifest, with both arguments specified', function() {
    var generatedManifest = generateManifest(sampleData, sampleTS);
    assert.isTrue(!!generatedManifest);
    assert.isObject(generatedManifest);
    assert.isArray(generatedManifest.tools);
    assert.isString(generatedManifest.tools[0]);
    assert.isString(generatedManifest.repo);
    assert.isArray(generatedManifest.checkers);
    assert.isObject(generatedManifest.checkers[0]);
    assert.equal(generatedManifest.translators[0], 'royalsix');
    assert.equal(generatedManifest.project.name, 'Mark');
    assert.isString(generatedManifest.otherData);
  });
});
