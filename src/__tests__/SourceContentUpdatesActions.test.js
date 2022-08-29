import path from 'path-extra';
import {
  getAlignmentsFromDownloadedBible,
  getSearchableAlignments,
} from '../js/helpers/searchHelper';

jest.unmock('fs-extra');
jest.unmock('adm-zip');

const resource_ = {
  languageId: 'en',
  resourceId: 'ult',
  owner: 'unfoldingWord',
};

const translationCoreFolder = path.join('/Users/blm/translationCore');

// test.skip('download alignments', async () => {
//   const resource = { ...resource_ };
//
//   await downloadBibles(resource);
// }, 50000);

test('index aligned Bibles', () => {
  const filtered = getSearchableAlignments(translationCoreFolder);
  console.log('filtered', filtered);
});

test('get alignments from latest resource', () => {
  const resource = { ...resource_ };
  const resourceFolder = path.join(translationCoreFolder, 'resources');

  getAlignmentsFromDownloadedBible(resourceFolder, resource);
}, 50000);

// helpers
