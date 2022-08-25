import sourceContentUpdater, { apiHelpers } from 'tc-source-content-updater';
import path from 'path-extra';
import {generateTargetLanguageBibleFromUsfm} from "../js/helpers/FileConversionHelpers/UsfmFileConversionHelpers";

jest.unmock('fs-extra');
jest.unmock('adm-zip');

test('get latest resource', async () => {
  const SourceContentUpdater = new sourceContentUpdater();
  const resource = {
    languageId: 'en',
    resourceId: 'ult',
    owner: 'unfoldingWord',
  };

  if (!resource.version) {
    const owner = resource.owner;
    const retries = 5;
    const stage = resource.stage !== 'prod' ? 'preprod' : undefined;
    const resourceName = `${resource.languageId}_${resource.resourceId}`;
    const latest = await apiHelpers.getLatestRelease(owner, resourceName, retries, stage) ;
    const release = latest && latest.release;
    let version = release && release.tag_name;

    if (version) {
      resource.version = version;
    }
  }

  const userFolder = path.join('/Users/blm');
  const destinationPath = path.join(userFolder, 'translationCore/alignmentData', `${resource.owner}_${resource.languageId}_${resource.resourceId}`);

  await SourceContentUpdater.downloadAndProcessResource(resource, destinationPath);
  console.log('done');
  // /Users/blm/translationCore/alignmentData/unfoldingWord_en_ult/en/bibles/ult/v40_unfoldingWord
  // await generateTargetLanguageBibleFromUsfm(parsedUsfm, manifest, selectedProjectFilename);
  // for each book:
  //  need to merge json chapters into parsedUsfm.chapters
  //  and need empty parsedUsfm.headers
}, 50000);
