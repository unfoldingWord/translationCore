import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import path from 'path-extra';
import fs from 'fs-extra';
// actions
import * as MissingVersesActions from '../js/actions/MissingVersesActions';
// helpers
import * as MissingVersesHelpers from '../js/helpers/ProjectValidation/MissingVersesHelpers';
// constants
import { USER_RESOURCES_PATH, IMPORTS_PATH } from '../js/common/constants';
jest.mock('fs-extra');
jest.mock('../js/actions/ProjectImportStepperActions', () => ({
  removeProjectValidationStep: () => ((dispatch, getState) => {}),
  updateStepperIndex: () => ((dispatch, getState) => {}),
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const importProjectName = 'gal_hsl';

describe('MissingVersesActions.onlineImport()', () => {
  let ch4_json, ch5_json, manifest_json, initialState;
  const bookName = 'gal';
  const importProjectPath = path.join(IMPORTS_PATH, importProjectName);
  const importBookPath = path.join(importProjectPath, bookName);
  const bibleIndexLocation = path.join(USER_RESOURCES_PATH, 'en', 'bibles', 'ult', 'v11', 'index.json');
  const index_json = require('./fixtures/resources/en/bibles/ult/v11/index.json');

  beforeEach(() => {
    ch4_json = { '1':':-(' };
    ch5_json = {
      '1':'Ai domin mu dawama ƴanttatu ne Almasihu ya ƴantadda mu. Kenan ku tsaya da kyau, kada ku sanya kanku ƙarƙashi ƙangin bauta.','2':'Ni Bulus ina gaya maku: dukan wanda ya amince aka yi masa kaciya, to Almasihu baya zama da anfani gare sa ba.','3':'Ina nanatawa cewa dukan wanda ya amince aka yi masa kaciya, to ya zamar masa wajibi ya kiyaye dukan shari\'a.','4':'Dukan ku da kuke neman barataswa ta hanyar kaciya, ba ku da sauran taraya da Almasihu, kun wofinta alherin Almasihu.','5':'A cikin Ruhu ta hanyar bangaskiya mu ke da begen barataswa da kayi alkawali.','6':'Cikin Almasihu ba kaciya ko rashin kaciya ne keda mahimanci ba amma rayuwar bangaskiya ta hanyar ƙauna.','7':'Kun fara da kyau, wa ya sa kuka dena rayuwar cikin gaskiya?','8':'Wanan ra\'ayi dai ba daga wanda ya kira ku bane.','9':'Ai yisti kaɗan ya isa ya tada curin gurasa.','10':'Na yi imanin da ba za ku cigaba da irin wanan rayuwa ba. Amma shi wanda ke rikitadda ku zaya karɓi sakamakon ɓanar sa, ko wanene shi.','11':'Ƴanuwa, in har yanzu ina goyonbayan kaciya, ina dalilin da ya sa ake tsanatamani? Kena kokowar da giciyen Almasihu ke sawa a cikina ta zama a wofi.','12':'Su masu tada hankalinku, ina fatan su maida kansu babani.','13':'Gama ƴan uwa Allah ya kira mu zuwa ga ƴanci, amma kadda ƴancin ku ya kasance ƙofar lalata, maimakon haka ku bauta wa juna a cikin ƙauna.','14':'Gama dukan shari\'a tana dunƙule a cikin wanan dokar: <<ka ƙaunaci maƙaubcin ka kamar kankan>>.','15':'Amma idan kuna cakunan juna, kuna kuwa cin juna, ku yi hankali kada ku hallaka juna.','16':'Ku yi tafiya cikin ruhu, ta haka ba zaku aikata halin mutuntaka ba,','17':'gama halin mutuntataka yana gaba da na ruhu, haka ma ayukan ruhu suna gaba da aykan jiki. Su duka biyu suna adawa da juna, har ma ku rasa sanin abinda ku ke buƙata.','18':'Amma idan Ruhu ne ke bishe ku, to baku ƙalƙashi shari\'a.','19':'Ai ayukan jiki a sarari suke, sune : fasiƙanci, lalata, sha\'aw,','20':'bautar gumaka, sihiri, gaba, jayaya, kishi, fushi, hamanya, tsatsagu,','21':'hasada, kwaɗayi, buguwa, shashanci da kuma sauran abubuwa irin su, Ina faɗa maku kamar yadda na rigaya na faɗa maku, dukan masu aikata irin wanan rayuwa, basu da rabo a cikin mulkin Allah..','22':'Amma ƴaƴan Ruhu Ƙauna ce, farinciciki, salama, hankuri, kirki, nagarta, bangaskiya,','23':'nasiha, kamunkai; shari\'a bata gaba da irin waɗanan halayan.','24':'Amma su wanɗanda ke na Almasihu Yesu sun giciye jiki da mugayen halayen sa.','25':'kada mu yi fahariya, kada mu cakuni juna, kaka mu yi ƙyashin juna.','26':'Idan cikin Ruhu mu ke rayuwa, to bari mu yi tafiya a cikin Ruhu,',
    };
    manifest_json = {
      'generator':{ 'build':108,'name':'ts-android' },'target_language':{
        'direction':'ltr','id':'hsl','name':'Hausa Sign Language',
      },'project':{ 'id':'gal','name':'Galatians' },'source_translations':{
        'checking_level':3,'date_modified':20151120,'version':'2.0.0-beta15','language_id':'en','resource_id':'ust',
      },'checkers':[],'time_created':'2017-12-21T19:07:03.828Z','tools':[],'repo':'','tcInitialized':true,'finished_frames':['05-01','05-05','05-09','05-11','05-16','05-19','05-25','05-22','05-03','05-13'],'package_version':3,'project_id':'gal','finished_chunks':['05-01','05-05','05-09','05-11','05-16','05-19','05-25','05-22','05-03','05-13'],'tc_version':1,'license':'CC BY-SA 4.0',
    };

    // reset mock filesystem data
    fs.__resetMockFS();
    // Set up mocked out filePath and data in mock filesystem before each test
    fs.__setMockFS({});
    fs.outputJsonSync(bibleIndexLocation, index_json);
    fs.outputJsonSync(path.join(importProjectPath, 'manifest.json'), manifest_json);
    fs.outputJsonSync(path.join(importBookPath, 'manifest.json'), manifest_json);
    fs.outputJsonSync(path.join(importBookPath, '4.json'), ch4_json);
    fs.outputJsonSync(path.join(importBookPath, '5.json'), ch5_json);

    initialState = {
      projectDetailsReducer: {
        projectSaveLocation: importProjectPath,
        manifest: manifest_json,
      },
    };
  });

  it('on import error, should delete project', async () => {
    // given
    const store = mockStore(initialState);

    // when
    await store.dispatch(MissingVersesActions.finalize());

    // then
    validateVersesInBible(bookName, importBookPath);
  });
});

//
// helpers
//

function validateVersesInBible(bookName, importBookPath) {
  const expectedBookVerses = MissingVersesHelpers.getExpectedBookVerses(bookName);
  const chapters = parseInt(expectedBookVerses['chapters'], 10);

  for (let chapter = 1; chapter <= chapters; chapter++) {
    const chapterPath = path.join(importBookPath, chapter + '.json');
    expect(fs.existsSync(chapterPath)).toBeTruthy();
    const chapterJson = fs.readJSONSync(chapterPath);
    const verses = parseInt(expectedBookVerses[chapter.toString()]);

    for (let verseNum = 1; verseNum <= verses; verseNum++) {
      const verse = chapterJson[verseNum];
      const verseDefined = !!verse || (verse === '');

      if (!verseDefined) {
        console.log('Chapter ' + chapter + ', verse ' + verseNum + ' not defined');
        expect(verseDefined).toBeTruthy();
      }
    }
  }
}

