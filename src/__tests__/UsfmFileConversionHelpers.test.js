import React from 'react';
import fs from 'fs-extra';
import path from 'path-extra';
import usfm from 'usfm-js';
// helpers
import * as UsfmHelpers from '../js/helpers/usfmHelpers';
import {
  getUsfmForVerseContent,
  verifyIsValidUsfmFile,
  generateManifestForUsfm,
  cleanAlignmentMarkersFromString,
  moveUsfmFileFromSourceToImports,
  generateTargetLanguageBibleFromUsfm,
} from '../js/helpers/FileConversionHelpers/UsfmFileConversionHelpers';
// constants
import { USER_RESOURCES_PATH, IMPORTS_PATH } from '../js/common/constants';
jest.mock('fs-extra');
const testResourcePath = path.join(__dirname, 'fixtures/resources');
const usfmFilePath = path.join('path', 'to', 'project', 'eph.usfm');
const invalidUsfmRejectionMessage = (
  <div>
    The project you selected ({usfmFilePath}) is an invalid usfm project. <br />
    Please verify the project you selected is a valid usfm file.
  </div>
);
const generateUsfmRejectionMessage = (
  <div>
    Something went wrong when generating a manifest for ({usfmFilePath}).
  </div>
);
const moveUsfmRejectionMessage = (
  <div>
    Something went wrong when importing your project.
  </div>
);
const validUsfmString = `
\\id TIT N/A cdh_Chambeali_ltr Mon Sep 11 2017 16:44:56 GMT-0700 (PDT) tc
\\h Titus
\\mt Titus
\\s5
\\c 1
\\p
\\v 1 तिन्हा जो तांई चुणेया जे से बेकसुर हो। अत्ते इक ई लाड़ी वाळे होणे चहिंदे। तिन्हेरे बच्चे विस्वासी होणे चहिंदे अत्ते बेलगाम अत्ते बागी ना हो।
\\v 2 किजो कि धार्मिक गल्लां सिखाणे वाळे परमेश्वर रा कम्म करणे तांई बेकसुर होणा चहिंदा; से ना ता जिद्दी, चिड़चिड़ा, अत्ते ना शराब पीणे वाळा हो, ना मार-कुटाई करणे वाळा, अत्ते ना ई गलत कम्मां री कमाई रा लालची हो,
\\v 3 अपण परोणे री इज्जत सत्कार करणे वाळा हो, भलाई चाह्णे वाळा हो, समझदार, सही-गलत री समझ हो, भक्त अत्ते अपणे पर तिस जो काबू हो।
\\v 4 से उस विस्वास करणे लायक वचन पर मजबूत रेह् जिसेरी उस जो सिक्सा मिल्ले री है, ताकि से विरोध करणे वाळेयां रा मूंह् बंद करी सके।
\\v 5 एह् इधेरे तांई जरूरी है किजोकि बड़े मह्णु खिलाफ होई करी बेकार री गल्लां बणाई करी दूज्जेयां जो भटकाई दिंदे। मैं खास कर तिन्हा जो बोलेया करदा है जिन्हेरा खतना होई गेरा है।
\\v 6 तिन्हेरा मूंह् ता बंद ई कित्तेया जाणा चहिंदा। किजो कि जे गल्लां नी सिखाणे वाळी हिन् , तिन्हा जो सिखाई करी घर रे घर तोड़ी दिंदे, किजो कि से गलत रस्तेयां पर चली करी पैसे कमाणे तांई इदेया करदे हिन्।
\\v 7 इक क्रेते रे रेह्णे वाळे ने अपणे मह्णुआं रे बारे खुद बोलेया, “क्रेते रे मह्णु हमेसा झूठ बोलदे, से जंगली जानवर हिन, आलसी ते भूखान्ग हिन्।”
\\v 8 एह् गल्ल सच्च है, इधेरे तांई तिन्हा जो खरा करी समझा ताकि तिन्हेरा विस्वास पक्का होई जाये।
\\v 9 अत्ते से यहूदियां री पुराणी कहाणियां पर अत्ते उन्हा मह्णुआं रे हुक्मां पर, जे सच्चाई का भटकी गेरे हिन, कोई ध्यान मत दो।
\\v 10 सुच्चे मह्णुआं तांई सब चीजा सुच्ची हिन् , अपण भिट्ठा अत्ते जिन्हा बिच विस्वास नी है, उन्हा तांई किच्छ बी सुच्चा नी है, बल्कि उन्हेरी अक्कल अत्ते सही-गलत री समझ दोनो भिट्ठी हिन्।
\\v 11 से परमेश्वर जो जानणे रा दावा करदे। अपण तिन्हेरे कम्म दिखांदे कि से तिस जो जाणदे ई नी। से नफरत करणे अत्ते हुक्मां जो तोड़ने वाळे हिन् अत्ते कुसी बी खरे कम्म करणे रे लायक नी हिन्।
\\v 12 अपण तू इदेह्ई गल्लां बोल्लेया कर जेह्ड़ी खरी सिक्सा जोग्गी होन्।
\\v 13 मतलब कि बुड्ड़े मह्णु सचेत ते गम्भीर ते सबर वाळे होन, ते तिन्हेरा भरोस्सा ते प्यार ते सबर पक्का हो।
\\v 14 इह्याँ ई बुह्ड्ड़ी जनानियाँ रा चाल-चलन खरे मह्णुआं साह्ई हो; से इल्जाम लाणे वाळी ते पियक्कड़ नां होन, अपण खरी गल्लां सखाणे वाळी होन।
\\v 15 ताकि से जुआन जनानियाँ जो सचेत करदी रैह्न कि अपणे लाड़े ते निके-निकेयाँ कने प्यार रखन;
\\v 16 ते सबर वाळी, पतिवरता, ते घरे रा कमकाज करणे वाळी, भली, ते अपणे-अपणे लाड़े रे अधीन रैह्णे वाळियाँ होन, ताकि परमेश्वर रे वचन री नीन्दा नां हो।
\\c 2
\\p
`;

describe('UsfmFileConversionHelpers', () => {
  afterEach(() => {
    fs.__resetMockFS();
  });

  describe('verifyIsValidUsfmFile()', () => {
    test('promise rejects with an error if invalid arguments are passed to the function.', () => {
      fs.__setMockFS({ [usfmFilePath]: 'Not a valid usfm string' });
      expect.assertions(1);
      return expect(verifyIsValidUsfmFile(usfmFilePath)).rejects.toEqual(invalidUsfmRejectionMessage);
    });

    test('promise resolves with the usfm file.', () => {
      fs.__setMockFS({ [usfmFilePath]: validUsfmString });
      expect.assertions(1);
      return expect(verifyIsValidUsfmFile(usfmFilePath)).resolves.toEqual(validUsfmString);
    });
  });

  describe('generateManifestForUsfm()', () => {
    test('promise rejects with an error if invalid arguments are passed to the function.', () => {
      expect.assertions(1);
      return expect(
        generateManifestForUsfm(null, usfmFilePath, 'project_folder_name'),
      ).rejects.toEqual(generateUsfmRejectionMessage);
    });

    test('resolves with the project manifest file', async () => {
      const manifestPath = path.join(IMPORTS_PATH, 'project_folder_name', 'manifest.json');

      expect.assertions(2);
      const results = await generateManifestForUsfm(validUsfmString, usfmFilePath, 'project_folder_name');
      // normalize JSONs since dates in manifest are converted to strings.
      const normalized = JSON.parse(JSON.stringify(results));
      expect(normalized).toEqual(fs.readJsonSync(manifestPath));
      expect(fs.existsSync(manifestPath)).toBeTruthy();
    });
  });

  describe('moveUsfmFileFromSourceToImports()', () => {
    test('rejects with an error if invalid arguments are passed to the function', () => {
      expect.assertions(1);
      return expect(
        moveUsfmFileFromSourceToImports(null, {}, 'project_folder_name'),
      ).rejects.toEqual(moveUsfmRejectionMessage);
    });

    test('resolves by moving an usfm file to imports folder and name it using project id', async () => {
      fs.__setMockFS({ [usfmFilePath]: validUsfmString });

      let mockManifest = { project: { id: 'eph' } };
      const newUsfmProjectImportsPath = path.join(IMPORTS_PATH, 'project_folder_name', 'eph.usfm');
      expect.assertions(1);
      await moveUsfmFileFromSourceToImports(path.join('path', 'to', 'project', 'eph.usfm'), mockManifest, 'project_folder_name');
      expect(fs.existsSync(newUsfmProjectImportsPath)).toBeTruthy();
    });
  });

  describe('generateTargetLanguageBibleFromUsfm()', () => {
    test('valid USFM should succeed', async () => {
      // given
      fs.__setMockFS({});
      let mockManifest = {
        project: { id: 'eph' },
        target_language: { id: 'en' },
      };
      const newUsfmProjectImportsPath = path.join(IMPORTS_PATH, 'project_folder_name', 'eph');
      const parsedUsfm = UsfmHelpers.getParsedUSFM(validUsfmString);

      //when
      await generateTargetLanguageBibleFromUsfm(parsedUsfm, mockManifest, 'project_folder_name');

      //then
      expect(fs.existsSync(newUsfmProjectImportsPath)).toBeTruthy();

      const chapter1_data = fs.readJSONSync(path.join(newUsfmProjectImportsPath, '1.json'));
      expect(Object.keys(chapter1_data).length - 1).toEqual(16);

      const chapter2_data = fs.readJSONSync(path.join(newUsfmProjectImportsPath, '2.json'));
      expect(Object.keys(chapter2_data).length - 1).toEqual(0);

      // verify header info is preserved
      const header_data = fs.readJSONSync(path.join(newUsfmProjectImportsPath, 'headers.json'));
      validateUsfmTag(header_data, 'id');
      validateUsfmTag(header_data, 'h');
      validateUsfmTag(header_data, 'mt');
      validateUsfmTag(header_data, 's5');
    });

    test('aligned USFM should succeed', async () => {
      // given
      fs.__setMockFS({});
      let mockManifest = {
        project: { id: 'eph' },
        target_language: { id: 'en' },
      };
      const newUsfmProjectImportsPath = path.join(IMPORTS_PATH, 'project_folder_name', 'eph');
      const testDataPath = path.join('src', '__tests__', 'fixtures', 'project', 'alignmentUsfmImport', '59-HEB.usfm');
      const validUsfmString = fs.__actual.readFileSync(testDataPath).toString();
      const parsedUsfm = UsfmHelpers.getParsedUSFM(validUsfmString);

      //when
      await generateTargetLanguageBibleFromUsfm(parsedUsfm, mockManifest, 'project_folder_name');

      //then
      expect(fs.existsSync(newUsfmProjectImportsPath)).toBeTruthy();

      const chapter1_data = fs.readJSONSync(path.join(newUsfmProjectImportsPath, '1.json'));

      expect(Object.keys(chapter1_data).length - 1).toEqual(13);
      expect(chapter1_data[1]).toEqual('Long ago God spoke to our ancestors through the prophets at many times and in many ways. ');
      // test apostrophe
      expect(chapter1_data[3]).toEqual('He is the brightness of God\'s glory, the exact representation of his being. He even holds everything together by the word of his power. After he had made cleansing for sins, he sat down at the right hand of the Majesty on high. ');
      // test quotes
      expect(chapter1_data[5]).toEqual('For to which of the angels did God ever say, "You are my son, today I have become your father"? Or to which of the angels did God ever say, "I will be a father to him, and he will be a son to me"? ');
    });

    test('aligned USFM and punctuation should succeed', async () => {
      // given
      fs.__setMockFS({});
      let mockManifest = {
        project: { id: 'act' },
        target_language: { id: 'en' },
      };
      const newUsfmProjectImportsPath = path.join(IMPORTS_PATH, 'project_folder_name', 'act');
      const testDataPath = path.join('src', '__tests__', 'fixtures/project/acts1_aligned/acts1.usfm');
      const validUsfmString = fs.__actual.readFileSync(testDataPath).toString();
      const parsedUsfm = UsfmHelpers.getParsedUSFM(validUsfmString);

      //when
      await generateTargetLanguageBibleFromUsfm(parsedUsfm, mockManifest, 'project_folder_name');

      //then
      expect(fs.existsSync(newUsfmProjectImportsPath)).toBeTruthy();

      const chapter1_data = fs.readJSONSync(path.join(newUsfmProjectImportsPath, '1.json'));

      expect(Object.keys(chapter1_data).length).toEqual(26);
      expect(chapter1_data[1]).toEqual('The former book I wrote, Theophilus, concerning all that Jesus began both to do and to teach, ');
      // test apostrophe
      expect(chapter1_data[4]).toEqual('When he was meeting together with them, he commanded them not to leave Jerusalem, but to wait for the promise of the Father, about which, he said, \\qt-s |who="Jesus"\\*"You heard from me');
      // test quotes
      expect(chapter1_data[5]).toEqual('that John indeed baptized with water, but you shall be baptized in the Holy Spirit after not many days."\\qt-e\\*\n\\s5');
    });

    test('spanned milestones should succeed', async () => {
      // given
      fs.__setMockFS({});
      let mockManifest = {
        project: { id: 'act' },
        target_language: { id: 'en' },
      };
      const copyFiles = ['el-x-koine/bibles/ugnt/v0.2_Door43-Catalog/act'];
      fs.__loadFilesIntoMockFs(copyFiles, testResourcePath, USER_RESOURCES_PATH);
      const newUsfmProjectImportsPath = path.join(IMPORTS_PATH, 'project_folder_name', 'act');
      const testDataPath = path.join('src', '__tests__', 'fixtures', 'project', 'alignmentUsfmImport', 'acts_1_milestone.usfm');
      const validUsfmString = fs.__actual.readFileSync(testDataPath).toString();
      const parsedUsfm = UsfmHelpers.getParsedUSFM(validUsfmString);
      const expectedVerses = 6;

      //when
      await generateTargetLanguageBibleFromUsfm(parsedUsfm, mockManifest, 'project_folder_name');

      //then
      expect(fs.existsSync(newUsfmProjectImportsPath)).toBeTruthy();

      const chapter1_data = fs.readJSONSync(path.join(newUsfmProjectImportsPath, '1.json'));
      const chapter1_alignments = fs.readJSONSync(path.join(newUsfmProjectImportsPath, '../.apps/translationCore/alignmentData/act/1.json'));

      // make sure we got nested alignment
      expect(Object.keys(chapter1_alignments).length).toEqual(expectedVerses);
      const vs4 = chapter1_alignments[4];
      let alignment = vs4.alignments[vs4.alignments.length - 1];
      expect(alignment.bottomWords.length).toEqual(1);
      expect(alignment.bottomWords[0].word).toEqual('You');

      expect(Object.keys(chapter1_data).length).toEqual(expectedVerses);
      expect(chapter1_data[1]).toEqual('The former book I wrote, Theophilus, concerning all that Jesus began both to do and to teach, ');
      // test \s5
      expect(chapter1_data[3]).toEqual('After his suffering, he also presented himself alive to them with many convincing proofs. For forty days he appeared to them, and he spoke things concerning the kingdom of God.\\s5 ');
      // test \qt-s
      expect(chapter1_data[4]).toEqual('When he was meeting together with them, he commanded them not to leave Jerusalem, but to wait for the promise of the Father, about which, he said,\\qt-s |who="Jesus"\\*"You heard from me');
      // test \qt-e
      expect(chapter1_data[5]).toEqual('that John indeed baptized with water, but you shall be baptized in the Holy Spirit after not many days."\\qt-e\\*\n\\s5\n\\p');
    });

    test('aligned USFM and UGNT with milestones should succeed', async () => {
      // given
      fs.__setMockFS({});
      let mockManifest = {
        project: { id: 'tit' },
        target_language: { id: 'en' },
      };
      const newUsfmProjectImportsPath = path.join(IMPORTS_PATH, 'project_folder_name', 'tit');
      const testDataPath = path.join('src', '__tests__', 'fixtures', 'project', 'alignmentUsfmImport', '57-TIT.usfm');
      const validUsfmString = fs.__actual.readFileSync(testDataPath).toString();
      const resourcePath = path.join(__dirname, 'fixtures/resources');
      const copyFiles = ['el-x-koine/bibles/ugnt'];
      fs.__loadFilesIntoMockFs(copyFiles, resourcePath, USER_RESOURCES_PATH);
      const parsedUsfm = UsfmHelpers.getParsedUSFM(validUsfmString);

      //when
      await generateTargetLanguageBibleFromUsfm(parsedUsfm, mockManifest, 'project_folder_name');

      //then
      expect(fs.existsSync(newUsfmProjectImportsPath)).toBeTruthy();

      const chapter1_data = fs.readJSONSync(path.join(newUsfmProjectImportsPath, '1.json'));
      expect(Object.keys(chapter1_data).length).toEqual(16);
      expect(chapter1_data[1]).toEqual('Pablo, un siervo de Dios y apóstol de Jesucristo, por la fe del pueblo escogido de Dios y el conocimiento de la verdad que concuerda con la piedad. TEST');

      // test alignments
      const wordAlignmentDataPath = path.join(IMPORTS_PATH, 'project_folder_name', '.apps', 'translationCore', 'alignmentData', 'tit');
      const chapter1_alignment = fs.readJSONSync(path.join(wordAlignmentDataPath, '1.json'));
      expect(Object.keys(chapter1_alignment).length).toEqual(16);

      const verse1_alignment = chapter1_alignment[1];
      expect(verse1_alignment.alignments.length).toEqual(14);

      const firstAlignment = verse1_alignment.alignments[0];
      expect(firstAlignment.topWords[0].word).toEqual('Παῦλος');
      expect(firstAlignment.bottomWords[0].word).toEqual('Pablo');
    });

    test('partial-aligned USFM and UGNT with milestones should succeed', async () => {
      // given
      fs.__setMockFS({});
      let mockManifest = {
        project: { id: 'tit' },
        target_language: { id: 'en' },
      };
      const newUsfmProjectImportsPath = path.join(IMPORTS_PATH, 'project_folder_name', 'tit');
      const testDataPath = path.join('src', '__tests__', 'fixtures', 'project', 'alignmentUsfmImport', '57-TIT.partial.usfm');
      const validUsfmString = fs.__actual.readFileSync(testDataPath).toString();
      const resourcePath = path.join(__dirname, 'fixtures/resources');
      const copyFiles = ['el-x-koine/bibles/ugnt'];
      fs.__loadFilesIntoMockFs(copyFiles, resourcePath, USER_RESOURCES_PATH);
      const parsedUsfm = UsfmHelpers.getParsedUSFM(validUsfmString);

      //when
      await generateTargetLanguageBibleFromUsfm(parsedUsfm, mockManifest, 'project_folder_name');

      //then
      expect(fs.existsSync(newUsfmProjectImportsPath)).toBeTruthy();

      const chapter1_data = fs.readJSONSync(path.join(newUsfmProjectImportsPath, '1.json'));
      expect(Object.keys(chapter1_data).length).toEqual(16);
      expect(chapter1_data[1]).toEqual('Paul, a servant of God and an apostle of Jesus Christ, for the faith of God\'s chosen people and the knowledge of the truth that agrees with godliness, ');

      // test alignments
      const wordAlignmentDataPath = path.join(IMPORTS_PATH, 'project_folder_name', '.apps', 'translationCore', 'alignmentData', 'tit');
      const chapter1_alignment = fs.readJSONSync(path.join(wordAlignmentDataPath, '1.json'));
      expect(Object.keys(chapter1_alignment).length).toEqual(16);

      const verse1_alignment = chapter1_alignment[1];
      expect(verse1_alignment.alignments.length).toEqual(17);
      expect(verse1_alignment.wordBank.length).toEqual(18);

      const firstAlignment = verse1_alignment.alignments[0];
      expect(firstAlignment.topWords[0].word).toEqual('Παῦλος');
      expect(firstAlignment.bottomWords[0].word).toEqual('Paul');

      // expect blank alignments
      const verse2_alignment = chapter1_alignment[2];
      expect(verse2_alignment.alignments.length).toEqual(12);
      expect(verse2_alignment.alignments[0].topWords.length).toEqual(1);
      expect(verse2_alignment.alignments[0].bottomWords.length).toEqual(0);
      expect(verse2_alignment.wordBank.length).toEqual(20);

      // expect empty verse
      const verse3_alignment = chapter1_alignment[3];
      expect(verse3_alignment.alignments.length).toEqual(18);
      expect(verse3_alignment.alignments[0].topWords.length).toEqual(1);
      expect(verse3_alignment.alignments[0].bottomWords.length).toEqual(0);
      expect(verse3_alignment.wordBank.length).toEqual(0);

      // expect empty verse
      const verse14_alignment = chapter1_alignment[14];
      expect(verse14_alignment.alignments.length).toEqual(10);
      expect(verse14_alignment.alignments[0].topWords.length).toEqual(1);
      expect(verse14_alignment.alignments[0].bottomWords.length).toEqual(0);
      expect(verse14_alignment.wordBank.length).toEqual(0);

      // expect blank alignments
      const verse16_alignment = chapter1_alignment[16];
      expect(verse16_alignment.alignments.length).toEqual(17);
      expect(verse16_alignment.alignments[0].topWords.length).toEqual(1);
      expect(verse16_alignment.alignments[0].bottomWords.length).toEqual(0);
      expect(verse16_alignment.wordBank.length).toEqual(23);

      const chapter2_alignment = fs.existsSync(path.join(wordAlignmentDataPath, '2.json'));
      expect(chapter2_alignment).toBeFalsy();

      const chapter3_alignment = fs.existsSync(path.join(wordAlignmentDataPath, '3.json'));
      expect(chapter3_alignment).toBeFalsy();
    });
  });

  describe('verifyIsValidUsfmFile()', () => {
    test('promise rejects with an error if invalid arguments are passed to the function.', () => {
      fs.__setMockFS({ [usfmFilePath]: 'Not a valid usfm string' });
      expect.assertions(1);
      return expect(verifyIsValidUsfmFile(usfmFilePath)).rejects.toEqual(invalidUsfmRejectionMessage);
    });

    test('promise resolves with the usfm file.', () => {
      fs.__setMockFS({ [usfmFilePath]: validUsfmString });
      expect.assertions(1);
      return expect(verifyIsValidUsfmFile(usfmFilePath)).resolves.toEqual(validUsfmString);
    });
  });

  describe('getUsfmForVerseContent()', () => {
    const testResourcePath_ = path.join(__dirname, 'fixtures');

    test('acts-1-20 should succeed', () => {
      // given
      const testFile = path.join(testResourcePath_, 'usfm3/acts-1-20.usfm');
      const usfmData = fs.__actual.readFileSync(testFile, 'utf8').toString();
      const json = usfm.toJSON(usfmData, { chunk: true, convertToInt: ['occurrence', 'occurrences'] });
      const verseNum = 20;
      const verseParts = json.verses[verseNum];
      const expectedBibleVerse = '"For it is written in the Book of Psalms,\\q \'Let his field be made desolate,\\q  and do not let even one person live there\';\\q \'And let someone else take his position of leadership.\'\\m\n\n\\s5';
      const expectedCleanedVerse = '"For it is written in the Book of Psalms, \'Let his field be made desolate,  and do not let even one person live there\'; \'And let someone else take his position of leadership.\'\n\n';

      // when
      const bibleVerse = getUsfmForVerseContent(verseParts).trim();
      const cleaned = usfm.removeMarker(bibleVerse); // remove USFM markers
      // const object = wordaligner.unmerge(verseParts, bibleVerse);

      // then
      expect(bibleVerse).toEqual(expectedBibleVerse);
      expect(cleaned).toEqual(expectedCleanedVerse);
    });

    test('mat-4-6 should succeed', () => {
      // given
      const testFile = path.join(testResourcePath_, 'usfm3/mat-4-6.usfm');
      const usfmData = fs.__actual.readFileSync(testFile, 'utf8').toString();
      const json = usfm.toJSON(usfmData, { chunk: true, convertToInt: ['occurrence', 'occurrences'] });
      const verseNum = 6;
      const verseParts = json.verses[verseNum];
      const expectedBibleVerse = 'and said to him,"If you are the Son of God, throw yourself down, for it is written,\\q \'He will command his angels to take care of you,\'\\m and,\n\\q \'They will lift you up in their hands,\\q  so that you will not hit your foot against a stone.\'"\\m';
      const expectedCleanedVerse = 'and said to him,"If you are the Son of God, throw yourself down, for it is written, \'He will command his angels to take care of you,\' and,\n\'They will lift you up in their hands,  so that you will not hit your foot against a stone.\'"';

      // when
      const bibleVerse = getUsfmForVerseContent(verseParts).trim();
      const cleaned = usfm.removeMarker(bibleVerse); // remove USFM markers
      // const object = wordaligner.unmerge(verseParts, bibleVerse);

      // then
      expect(bibleVerse).toEqual(expectedBibleVerse);
      expect(cleaned).toEqual(expectedCleanedVerse);
    });
  });
});

describe('removeMarker', () => {
  const testResourcePath_ = path.join(__dirname, 'fixtures');

  test('heb-12-27 should succeed', () => {
    // given
    const testFile = path.join(testResourcePath_, 'removeMarkers/heb-12-27.usfm');
    const usfmData = fs.__actual.readFileSync(testFile, 'utf8').toString();
    const expectedCleanedVerse = 'These words, "One more time," mean the removal of those things that can be shaken, that is, of the things that have been created, so that the things that cannot be shaken will remain.\n';

    // when
    const cleaned = usfm.removeMarker(usfmData); // remove USFM markers

    // then
    expect(cleaned).toEqual(expectedCleanedVerse);
  });

  test('heb-12-27 Greek should succeed', () => {
    // given
    const testFile = path.join(testResourcePath_, 'removeMarkers/heb-12-27.grc.json');
    const verseData = fs.__actual.readJSONSync(testFile);
    const usfmData = getUsfmFromJson(verseData);
    const expectedCleanedVerse = 'τὸ δὲ,\n“ἔτι ἅπαξ”, δηλοῖ τῶν σαλευομένων μετάθεσιν, ὡς πεποιημένων, ἵνα μείνῃ τὰ μὴ σαλευόμενα.\n\n';

    // when
    const cleaned = usfm.removeMarker(usfmData); // remove USFM markers

    // then
    expect(cleaned).toEqual(expectedCleanedVerse);
  });
});

describe('cleanAlignmentMarkersFromString', () => {
  test('without alignment markers should succeed', () => {
    // given
    const verse = 'Paul, a servant of God and an apostle of Jesus Christ, for the faith of God\'s chosen people and the knowledge of the truth that agrees with godliness';
    const expected = verse;

    // when
    const cleaned = cleanAlignmentMarkersFromString(verse);

    // then
    expect(cleaned).toEqual(expected);
  });

  test('with word markers should succeed', () => {
    // given
    let verse = 'Paul, a servant of God and an apostle of Jesus Christ, for the faith of God\'s chosen people and the knowledge of the truth that agrees with godliness';
    const expected = verse;
    verse = wrapWithUSFM(verse, ' ', '\\w ', '\\w*');

    // when
    const cleaned = cleanAlignmentMarkersFromString(verse);

    // then
    expect(cleaned).toEqual(expected);
  });

  test('with alignments should succeed', () => {
    // given
    let verse = 'Paul, a servant of God and an apostle of Jesus Christ, for the faith of God\'s chosen people and the knowledge of the truth that agrees with godliness';
    const expected = verse;
    verse = wrapWithUSFM(verse, ' ', '\\zaln-s |\n', '\n\\zaln-e\\*');

    // when
    const cleaned = cleanAlignmentMarkersFromString(verse);

    // then
    expect(cleaned).toEqual(expected);
  });
});

//
// helpers
//

function wrapWithUSFM(text, splitAt, beginMarker, endMarker) {
  const parts = text.split(splitAt);
  const wrapped = beginMarker + parts.join(endMarker + splitAt + beginMarker) + endMarker;
  return wrapped;
}

function validateUsfmTag(header_data, tag) {
  const data = UsfmHelpers.getHeaderTag(header_data, tag);
  let match = '\\' + tag;

  if (data) {
    match += ' ' + data;
  }

  const index = validUsfmString.indexOf(match);
  const found = (index >= 0);
  expect(found).toBeTruthy();
}

export const getUsfmFromJson = (verseData) => {
  const outputData = {
    'chapters': {},
    'headers': [],
    'verses': { '1': verseData },
  };
  const USFM = usfm.toUSFM(outputData, { chunk: true });
  let split = USFM.split('\\v 1 ');

  if (split.length <= 1) {
    split = USFM.split('\\v 1');
  }
  return split.length > 1 ? split[1] : '';
};
