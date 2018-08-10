import fs from 'fs-extra';
import path from 'path-extra';
import ospath from 'ospath';
// helpers
import * as taArticleHelpers from '../src/js/helpers/translationHelps/taArticleHelpers';

jest.mock('fs-extra');

describe('Tests for taArticleHelpers', function() {
  beforeEach(() => {
    fs.__resetMockFS();
  });

  it('Test taArticleHelpers.setupTranslationAcademy() for en', () => {
    // given
    const lang = 'en';
    const version = 'v9';
    const actualExtractedPath = path.join(__dirname, 'fixtures/translationHelps/taExtractedFromCDN');
    const mockedExtractedPath = '/tmp/extracted';
    fs.__loadDirIntoMockFs(actualExtractedPath, mockedExtractedPath);
    const expectedTaOutputPath = path.join(ospath.home(), 'translationCore/resources/'+lang+'/translationHelps/translationAcademy', version);
    const expectedProjectList = ['checking', 'translate'];
    const expectedCheckingArticleListLength = 6;
    const expectedTranslateArticleListLength = 4;

    // when
    const taOutputPath = taArticleHelpers.processTranslationAcademy(path.join(mockedExtractedPath, lang+'_ta'), lang);
    const projectList = fs.readdirSync(taOutputPath);
    const checkingArticleList = fs.readdirSync(path.join(taOutputPath, 'checking'));
    const translateArticleList = fs.readdirSync(path.join(taOutputPath, 'translate'));
    const whatisFile = path.join(taOutputPath, 'translate', 'translate-whatis.md');
    const whatisArticle = fs.readFileSync(whatisFile, 'utf8');

    // then
    expect(taOutputPath).toEqual(expectedTaOutputPath);
    expect(fs.existsSync(whatisFile)).toBeTruthy();
    expect(projectList.sort()).toEqual(expectedProjectList);
    expect(checkingArticleList.length).toEqual(expectedCheckingArticleListLength);
    expect(checkingArticleList).toMatchSnapshot();
    expect(translateArticleList.length).toEqual(expectedTranslateArticleListLength);
    expect(translateArticleList).toMatchSnapshot();
    expect(whatisArticle).toMatchSnapshot();
  });
});
