import {describe, it} from 'mocha';
import { expect } from 'chai';
//helpers
import * as usfmHelpers from '../src/js/helpers/usfmHelpers';

//valid
const tc_commas = window.__base + 'test/fixtures/usfm/valid/tc_commas.usfm';
const tc_spaces = window.__base + 'test/fixtures/usfm/valid/tc_spaces.usfm';
const autographaExport = window.__base + 'test/fixtures/usfm/valid/autographa.usfm';
const translationStudioExport = window.__base + 'test/fixtures/usfm/valid/id_tit_text_reg.usfm';
const justBookId = window.__base + 'test/fixtures/usfm/valid/php_usfm.usfm';
//missing
const missingIdTag = window.__base + 'test/fixtures/usfm/missing/php_usfm_NId.usfm';
//invalid
const badIdTag = window.__base + 'test/fixtures/usfm/invalid/php_usfm_badId.txt';

const usfmDetails = (usfmFile) => {
  const usfmRaw = usfmHelpers.loadUSFMFile(usfmFile);
  const usfm = usfmHelpers.getParsedUSFM(usfmRaw);
  const details = usfmHelpers.getUSFMDetails(usfm);
  return details;
}

describe('USFM Details', () => {
  it('should handle translationStudio usfm export', function (done) {
    // parse valid usfm file
    const usfmFile = translationStudioExport;
    const details = usfmDetails(usfmFile);
    expect(details.book.id).to.equal('tit');
    expect(details.book.name).to.equal('Titus');
    expect(details.language.id).to.not.exist;
    expect(details.language.name).to.not.exist;
    expect(details.language.direction).to.equal('ltr');
    done();
  });
  it('should handle Autographa usfm export', function (done) {
    // parse valid usfm file
    const usfmFile = autographaExport;
    const details = usfmDetails(usfmFile);
    expect(details.book.id).to.equal('tit');
    expect(details.book.name).to.equal('Titus');
    expect(details.language.id).to.not.exist;
    expect(details.language.name).to.not.exist;
    expect(details.language.direction).to.equal('ltr');
    done();
  });
  it('should handle translationCore usfm export - \id with commas', function (done) {
    // parse valid usfm file
    const usfmFile = tc_commas;
    const details = usfmDetails(usfmFile);
    expect(details.book.id).to.equal('tit');
    expect(details.book.name).to.equal('Titus');
    expect(details.language.id).to.equal('gux');
    expect(details.language.name).to.equal('Gourmanchéma');
    expect(details.language.direction).to.equal('ltr');
    done();
  });
  it('should handle translationCore usfm export - \id with spaces', function (done) {
    // parse valid usfm file
    const usfmFile = tc_spaces;
    const details = usfmDetails(usfmFile);
    expect(details.book.id).to.equal('tit');
    expect(details.book.name).to.equal('Titus');
    expect(details.language.id).to.equal('sw');
    expect(details.language.name).to.equal('Kiswahili');
    expect(details.language.direction).to.equal('ltr');
    done();
  });
  it('should handle missing \id tag', function (done) {
    // parse valid usfm file
    const usfmFile = missingIdTag;
    const details = usfmDetails(usfmFile);
    expect(details.book.id).to.not.exist;
    expect(details.book.name).to.not.exist;
    expect(details.language.id).to.not.exist;
    expect(details.language.name).to.not.exist;
    expect(details.language.direction).to.equal('ltr');
    done();
  });
it('should handle \id bookId', function (done) {
    // parse valid usfm file
    const usfmFile = justBookId;
    const details = usfmDetails(usfmFile);
    expect(details.book.id).to.equal('php');
    expect(details.book.name).to.equal('Philippians');
    expect(details.language.id).to.not.exist;
    expect(details.language.name).to.not.exist;
    expect(details.language.direction).to.equal('ltr');
    done();
  });
  it('should handle bad \id tag', function (done) {
    // parse valid usfm file
    const usfmFile = badIdTag;
    const details = usfmDetails(usfmFile);
    expect(details.book.id).to.equal('ph');
    expect(details.book.name).to.not.exist;
    expect(details.language.id).to.not.exist;
    expect(details.language.name).to.not.exist;
    expect(details.language.direction).to.equal('ltr');
    done();
  });
})
