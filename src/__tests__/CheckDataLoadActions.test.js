/* eslint-env jest */
//action consts
import fs from 'fs-extra';
import path from 'path-extra';
//actions
import * as CheckDataLoadActions from '../js/actions/CheckDataLoadActions';

jest.mock('../js/helpers/gatewayLanguageHelpers', () => ({
  getGatewayLanguageCodeAndQuote: () => ({
    gatewayLanguageCode: 'en',
    gatewayLanguageQuote: 'authority',
  }),
}));

const projectSaveLocation = path.join(__dirname, 'fixtures/project/checkDataProject');
const contextId = {
  'groupId': 'figs_metaphor',
  'occurrence': 1,
  'quote': 'that he put before them',
  'information': 'Paul speaks about good deeds as if they were objects that God could place in front of people. AT: "that God prepared for them to do" (See: [[:en:ta:vol1:translate:figs_metaphor]]) \n',
  'reference': {
    'bookId': 'tit',
    'chapter': 3,
    'verse': 8,
  },
  'tool': 'TranslationNotesChecker',
};

describe('CheckDataLoadActions.generateLoadPath', () => {
  beforeEach(()=>{
    fs.__loadDirIntoMockFs(projectSaveLocation, projectSaveLocation);
  });

  it('should generate the output directory for the comments data', () => {
    const checkDataName = 'comments';

    expect(CheckDataLoadActions.generateLoadPath(projectSaveLocation, contextId, checkDataName))
      .toEqual(path.join(`${projectSaveLocation}/.apps/translationCore/checkData/${checkDataName}/tit/3/8`));
  });

  it('runs CheckDataLoadActions.loadCheckData', () => {
    const checkDataName = 'verseEdits';
    let loadPath = CheckDataLoadActions.generateLoadPath(projectSaveLocation, contextId, checkDataName);
    let checkData = CheckDataLoadActions.loadCheckData(loadPath, contextId);

    expect(checkData).toEqual(expect.objectContaining({
      contextId: expect.objectContaining({
        groupId: 'figs_metaphor',
        quote: 'that he put before them',
        tool: 'TranslationNotesChecker',
      }),
    }));
  });
});
