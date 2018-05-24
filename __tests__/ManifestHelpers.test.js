/* eslint-env jest */
/* eslint-disable no-console */
'use strict';

//helpers
import * as ManifestHelpers from '../src/js/helpers/manifestHelpers';


describe('ManifestHelpers.findResourceIdAndNickname', () => {
  const base_manifest = {
    project: {
      id: 'tit',
      name: 'Titus'
    }
  };

  test('if not present should not find resource id or nickname', () => {
    // given
    const manifest = JSON.parse(JSON.stringify(base_manifest)); // clone before modifying
    const expectedResourceId = undefined;
    const expectedNickName = undefined;

    // when
    ManifestHelpers.findResourceIdAndNickname(manifest);

    // then
    expect(manifest.project.resourceId).toEqual(expectedResourceId);
    expect(manifest.project.nickname).toEqual(expectedNickName);
  });

  test('if manifest empty should not find resource id or nickname or crash', () => {
    // given
    const manifest = {};
    const expectedResourceId = false;
    const expectedNickName = false;

    // when
    ManifestHelpers.findResourceIdAndNickname(manifest);

    // then
    expect(!!(manifest.project && manifest.project.resourceId)).toEqual(expectedResourceId);
    expect(!!(manifest.project && manifest.project.nickname)).toEqual(expectedNickName);
  });

  test('if present in dublin_core, should find resource id or nickname', () => {
    // given
    const manifest = JSON.parse(JSON.stringify(base_manifest)); // clone before modifying
    manifest.dublin_core = {
      identifier: 'ult',
      title: 'Unlocked Literal Translation'
    };
    const expectedResourceId = 'ult';
    const expectedNickName = 'Unlocked Literal Translation';

    // when
    ManifestHelpers.findResourceIdAndNickname(manifest);

    // then
    expect(manifest.project.resourceId).toEqual(expectedResourceId);
    expect(manifest.project.nickname).toEqual(expectedNickName);
  });

  test('if present in dublin_core, should not overwrite pre-existing resource id or nickname', () => {
    // given
    const manifest = JSON.parse(JSON.stringify(base_manifest)); // clone before modifying
    manifest.dublin_core = {
      identifier: 'ult',
      title: 'Unlocked Literal Translation'
    };
    manifest.project = {
      ...manifest.project,
      nickname: 'Unlocked Greek New Testament',
      resourceId: 'ugnt'
    }
    const expectedResourceId = 'ugnt';
    const expectedNickName = 'Unlocked Greek New Testament';

    // when
    ManifestHelpers.findResourceIdAndNickname(manifest);

    // then
    expect(manifest.project.resourceId).toEqual(expectedResourceId);
    expect(manifest.project.nickname).toEqual(expectedNickName);
  });

  test('if present in dublin_core and no project filed, should find resource id or nickname and not crash', () => {
    // given
    const manifest = {
      dublin_core: {
        identifier: 'ult',
        title: 'Unlocked Literal Translation'
      }
    };
    const expectedResourceId = 'ult';
    const expectedNickName = 'Unlocked Literal Translation';

    // when
    ManifestHelpers.findResourceIdAndNickname(manifest);

    // then
    expect(manifest.project.resourceId).toEqual(expectedResourceId);
    expect(manifest.project.nickname).toEqual(expectedNickName);
  });

  test('if present in resource, should find resource id or nickname', () => {
    // given
    const manifest = JSON.parse(JSON.stringify(base_manifest)); // clone before modifying
    manifest.resource = {
      slug: 'ult',
      name: 'Unlocked Literal Translation'
    };
    const expectedResourceId = 'ult';
    const expectedNickName = 'Unlocked Literal Translation';

    // when
    ManifestHelpers.findResourceIdAndNickname(manifest);

    // then
    expect(manifest.project.resourceId).toEqual(expectedResourceId);
    expect(manifest.project.nickname).toEqual(expectedNickName);
  });
});
