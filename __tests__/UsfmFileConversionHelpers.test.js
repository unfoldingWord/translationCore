jest.mock('fs-extra');
import React from 'react';
import fs from 'fs-extra';
import path from 'path-extra';
// helpers
import * as UsfmFileConversionHelpers from "../src/js/helpers/FileConversionHelpers/UsfmFileConversionHelpers";
// constant
const IMPORTS_PATH = path.join(path.homedir(), 'translationCore', 'imports');
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

  test('UsfmFileConversionHelpers.verifyIsValidUsfmFile promise rejects with an error if invalid arguments are passed to the function.', () => {
    fs.__setMockFS({
      [usfmFilePath]: 'Not a valid usfm string'
    });
    expect.assertions(1);
    return expect(UsfmFileConversionHelpers.verifyIsValidUsfmFile(usfmFilePath)).rejects.toEqual(invalidUsfmRejectionMessage);
  });

  test('UsfmFileConversionHelpers.verifyIsValidUsfmFile promise resolves with the usfm file.', () => {
    fs.__setMockFS({
      [usfmFilePath]: validUsfmString
    });
    expect.assertions(1);
    return expect(UsfmFileConversionHelpers.verifyIsValidUsfmFile(usfmFilePath)).resolves.toEqual(validUsfmString);
  });

  test('UsfmFileConversionHelpers.generateManifestForUsfm promise rejects with an error if invalid arguments are passed to the function.', () => {
    expect.assertions(1);
    return expect(
      UsfmFileConversionHelpers.generateManifestForUsfm(null, usfmFilePath, 'project_folder_name')
    ).rejects.toEqual(generateUsfmRejectionMessage);
  });

  test('UsfmFileConversionHelpers.generateManifestForUsfm resolves with the project manifest file', async () => {
    const manifestPath = path.join(IMPORTS_PATH, 'project_folder_name', 'manifest.json');

    expect.assertions(2);
    const results = await UsfmFileConversionHelpers.generateManifestForUsfm(validUsfmString, usfmFilePath, 'project_folder_name');
    // normalize JSONs since dates in manifest are converted to strings.
    const normalized = JSON.parse(JSON.stringify(results));
    expect(normalized).toEqual(fs.readJsonSync(manifestPath));
    expect(fs.existsSync(manifestPath)).toBeTruthy();
  });

  test('UsfmFileConversionHelpers.moveUsfmFileFromSourceToImports rejects with an error if invalid arguments are passed to the function', () => {
    expect.assertions(1);
    return expect(
      UsfmFileConversionHelpers.moveUsfmFileFromSourceToImports(null, {}, 'project_folder_name')
    ).rejects.toEqual(moveUsfmRejectionMessage);
  });

  test('UsfmFileConversionHelpers.moveUsfmFileFromSourceToImports resolves by moving an usfm file to imports folder and name it using project id', async () => {
    fs.__setMockFS({
      [usfmFilePath]: validUsfmString
    });
    let mockManifest = {
      project: {
        id: 'eph'
      }
    };
    const newUsfmProjectImportsPath = path.join(IMPORTS_PATH, 'project_folder_name', 'eph.usfm');
    expect.assertions(1);
    await UsfmFileConversionHelpers.moveUsfmFileFromSourceToImports(path.join('path', 'to', 'project', 'eph.usfm'), mockManifest, 'project_folder_name');
    expect(fs.existsSync(newUsfmProjectImportsPath)).toBeTruthy();
  });
});
