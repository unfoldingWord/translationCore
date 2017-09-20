/* eslint-env jest */

import {generateManifest} from '../src/js/helpers/manifestHelpers';

const sampleData = {
  repo: 'https://github.com/unfoldingWord-dev/translationCore/',
};

const sampleTS = {
  target_language: 'Greek',
  type: 'Translation',
  source_translations: 'Hebrew',
  translators: ['royalsix'],
  checkers: [{}],
  project_id: 'ceb_luk_io',
  project: {
    id: 'mrk'
  },
  otherData: 'fsdkljjfdskl'
};

test('populate should populate a TC manifest, even if no data or ts manifest is specified', () => {
    const generatedManifest = generateManifest();
    expect(!!generatedManifest).toBeTruthy();
    expect(typeof generatedManifest).toEqual('object');
    expect(typeof generatedManifest.time_created).toEqual('string');
});
test('populate should populate a TC manifest, if only user and repo argument specified', () => {
      const generatedManifest = generateManifest(sampleData.repo);
      expect(!!generatedManifest).toBeTruthy();
      expect(typeof generatedManifest).toEqual('object');
      expect(typeof generatedManifest.repo).toEqual('string');
      expect(generatedManifest.checkers.constructor).toEqual(Array);
});
test('populate should populate a TC manifest, with both arguments specified', () => {
      const generatedManifest = generateManifest(sampleData.repo, sampleTS);
      expect(!!generatedManifest).toBeTruthy();
      expect(typeof generatedManifest).toEqual('object');
      expect(typeof generatedManifest.repo).toEqual('string');
      expect(generatedManifest.checkers.constructor).toEqual(Array);
      expect(typeof generatedManifest.checkers[0]).toEqual('object');
      expect(generatedManifest.translators[0]).toEqual('royalsix');
      expect(generatedManifest.project.name).toEqual('Mark');
});

