import fs from 'fs-extra';
import path from 'path-extra';
import ospath from 'ospath';
import * as twHelpers from '../src/js/helpers/twHelpers';
import * as ResourcesHelpers from '../src/js/helpers/ResourcesHelpers';

describe('Test tW Helpers', function() {
  const lang = 'grc';
  const bible = 'ugnt';
  const ugntRealPath = path.join(__dirname, 'fixtures/resources/grc/bibles/ugnt');
  const ugntMockPath = path.join(ospath.home(), 'translationCore/resources', lang, 'bibles', bible);
  const twBasePath = path.join(ospath.home(), 'translationCore/resources', lang, 'translationHelps', 'translationWords');

  beforeEach(() => {
    fs.__resetMockFS();
    fs.__loadDirIntoMockFs(ugntRealPath, ugntMockPath);
  });

  afterEach(() => {
    fs.__resetMockFS();
  });

  it('Test that milestones are properly constructed using inchrist for phm', () => {
    // given
    const expectedTwPath = path.join(twBasePath, path.basename(ResourcesHelpers.getLatestVersionInPath(ugntMockPath)));

    // when
    const generatedTwPath = twHelpers.generateTw(lang, bible);
    const jsonFile = path.join(generatedTwPath, 'kt', 'groups', 'phm', 'inchrist.json');

    // then
    expect(generatedTwPath).toEqual(expectedTwPath);
    expect(fs.existsSync(jsonFile)).toBeTruthy();
    const data = JSON.parse(fs.readFileSync(jsonFile));
    expect(data).toMatchSnapshot();
    const expectedItems = 5;
    expect(data.length).toEqual(expectedItems);
  });

  it('Test that occurrence of God is correct in Titus 1:1', () => {
    // given
    const expectedTwPath = path.join(twBasePath, path.basename(ResourcesHelpers.getLatestVersionInPath(ugntMockPath)));

    // when
    const generatedTwPath = twHelpers.generateTw(lang, bible);


    // then
    expect(generatedTwPath).toEqual(expectedTwPath);
    const jsonFile = path.join(generatedTwPath, 'kt', 'groups', 'tit', 'god.json');
    expect(fs.existsSync(jsonFile)).toBeTruthy();
    const data = JSON.parse(fs.readFileSync(jsonFile));
    const expectedOccurrence = 2;
    expect(data[1].contextId.occurrence).toEqual(expectedOccurrence);
  });
});
