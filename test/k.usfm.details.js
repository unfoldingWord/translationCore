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
const missingVerseMarkers = window.__base + 'test/fixtures/usfm/missing/many_missing_verses.usfm';
const missingChapterMarkers = window.__base + 'test/fixtures/usfm/missing/many_missing_chapters.usfm';
//invalid
const badIdTag = window.__base + 'test/fixtures/usfm/invalid/php_usfm_badId.txt';
//out of sequence
const outOfSequenceVerseMarkers = window.__base + 'test/fixtures/usfm/out_of_sequence/verse_markers.usfm';
const outOfSequenceChapterMarkers = window.__base + 'test/fixtures/usfm/out_of_sequence/chapter_markers.usfm';

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

  it('should handle missing verse markers', function (done) {
    // parse valid usfm file
    const usfmFile = missingVerseMarkers;
    const usfmRaw = usfmHelpers.loadUSFMFile(usfmFile);
    const usfm = usfmHelpers.getParsedUSFM(usfmRaw);
    expect(usfm[1][3]).to.not.exist;
    expect(usfm[1][4]).to.not.exist;
    expect(usfm[1][21]).to.equal('For to me to live is Christ, and to die is gain.');
    expect(30 - Object.keys(usfm[1]).length).to.equal(2);

    expect(usfm[2][5]).to.not.exist;
    expect(usfm[2][6]).to.not.exist;
    expect(usfm[2][10]).to.equal('So at the name of Jesus every knee should bow,');
    expect(30 - Object.keys(usfm[2]).length).to.equal(2);

    expect(usfm[3][5]).to.not.exist;
    expect(usfm[3][10]).to.not.exist;
    expect(usfm[3][11]).to.not.exist;
    expect(usfm[3][15]).to.not.exist;
    expect(usfm[3][16]).to.not.exist;
    expect(usfm[3][17]).to.equal('Brothers, join me and imitate me, and watch closely those who are walking by our example.');
    expect(21 - Object.keys(usfm[3]).length).to.equal(5);

    expect(usfm[4][1]).to.not.exist;
    expect(usfm[4][21]).to.not.exist;
    expect(usfm[4][22]).to.not.exist;
    expect(usfm[4][4]).to.equal('Rejoice in the Lord always; again I will say, rejoice.');
    expect(23 - Object.keys(usfm[4]).length).to.equal(3);

    done();
  });

  it('should handle out of sequence verse markers', function (done) {
    // parse valid usfm file
    const usfmFile = outOfSequenceVerseMarkers;
    const usfmRaw = usfmHelpers.loadUSFMFile(usfmFile);
    const usfm = usfmHelpers.getParsedUSFM(usfmRaw);
    expect(usfm[1]).to.exist;
    expect(Object.keys(usfm[1])).to.have.lengthOf(30);
    expect(usfm[1][21]).to.equal('For to me to live is Christ, and to die is gain.');

    expect(usfm[2]).to.exist;
    expect(Object.keys(usfm[2])).to.have.lengthOf(30);
    expect(usfm[2][10]).to.equal('So at the name of Jesus every knee should bow,');

    expect(usfm[3]).to.exist;
    expect(Object.keys(usfm[3])).to.have.lengthOf(21);
    expect(usfm[3][11]).to.equal('so somehow I may experience the resurrection from the dead.');

    expect(usfm[4]).to.exist;
    expect(Object.keys(usfm[4])).to.have.lengthOf(23);
    expect(usfm[4][4]).to.equal('Rejoice in the Lord always; again I will say, rejoice.');
    done();
  });

  it('should handle missing chapter markers', function (done) {
    // parse valid usfm file
    const usfmFile = missingChapterMarkers;
    const usfmRaw = usfmHelpers.loadUSFMFile(usfmFile);
    const usfm = usfmHelpers.getParsedUSFM(usfmRaw);
    expect(usfm[1]).to.not.exist;
    expect(usfm[2]).to.not.exist;

    expect(usfm[3]).to.exist;
    expect(Object.keys(usfm[3])).to.have.lengthOf(21);
    expect(usfm[3][11]).to.equal('so somehow I may experience the resurrection from the dead.');
    done();
  });

  it('should handle out of sequence chapter markers', function (done) {
    // parse valid usfm file
    const usfmFile = outOfSequenceChapterMarkers;
    const usfmRaw = usfmHelpers.loadUSFMFile(usfmFile);
    const usfm = usfmHelpers.getParsedUSFM(usfmRaw);

    expect(usfm[1]).to.exist;
    expect(Object.keys(usfm[1])).to.have.lengthOf(30);
    expect(usfm[1][21]).to.equal('For to me to live is Christ, and to die is gain.');

    expect(usfm[2]).to.exist;
    expect(Object.keys(usfm[2])).to.have.lengthOf(30);
    expect(usfm[2][10]).to.equal('So at the name of Jesus every knee should bow,');

    expect(usfm[3]).to.exist;
    expect(Object.keys(usfm[3])).to.have.lengthOf(21);
    expect(usfm[3][11]).to.equal('so somehow I may experience the resurrection from the dead.');

    expect(usfm[4]).to.exist;
    expect(Object.keys(usfm[4])).to.have.lengthOf(23);
    expect(usfm[4][4]).to.equal('Rejoice in the Lord always; again I will say, rejoice.');
    done();
  });
})
