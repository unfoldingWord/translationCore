/* eslint-env jest */

import * as ToolCardHelpers from "../src/js/helpers/ToolCardHelpers";

describe('Test ToolCardHelpers.getToolCardLaunchStatus() for correct launch status',()=>{
  const translate = (key) => key;

  test('Should return the status that the book is supported for translationWords', () => {
    //given
    const bookId = 'rom';
    const developerMode = false;

    //when
    const status = ToolCardHelpers.isToolSupported(bookId, developerMode);

    //then
    expect(status).toEqual(true);
  });

  test('In developerMode, should return a GL needs to be selected for translationWords', () => {
    //given
    const langId = null;
    const bookId = 'rom';
    const developerMode = true;
    const expectedStatus = 'tools.please_select_gl';

    //when
    const status = ToolCardHelpers.getToolCardLaunchStatus(langId, bookId, developerMode, translate);

    //then
    expect(status).toEqual(expectedStatus);
  });

  test('Even with a langId, should return the status that the book is not supported for translationWords', () => {
    //given
    const bookId = 'rom';
    const developerMode = false;
    const expectedStatus = true;

    //when
    const status = ToolCardHelpers.isToolSupported(bookId, developerMode);

    //then
    expect(status).toEqual(expectedStatus);
  });

  test('In developerMode, it should return null for an unsupported book for translationWords', () => {
    //given
    const langId = 'en';
    const bookId = 'rom';
    const developerMode = true;
    const expectedStatus = null;

    //when
    const status = ToolCardHelpers.getToolCardLaunchStatus(langId, bookId, developerMode, translate);

    //then
    expect(status).toEqual(expectedStatus);
  });

  test('Should return a GL needs to be selected for wordAlignment', () => {
    //given
    const langId = null;
    const bookId = 'rom';
    const developerMode = false;
    const expectedStatus = 'tools.please_select_gl';

    //when
    const status = ToolCardHelpers.getToolCardLaunchStatus(langId, bookId, developerMode, translate);

    //then
    expect(status).toEqual(expectedStatus);
  });

  test('Even in developerMode, should return a GL needs to be selected for wordAlignment', () => {
    //given
    const langId = null;
    const bookId = 'rom';
    const developerMode = true;
    const expectedStatus = 'tools.please_select_gl';

    //when
    const status = ToolCardHelpers.getToolCardLaunchStatus(langId, bookId, developerMode, translate);

    //then
    expect(status).toEqual(expectedStatus);
  });

  test('Should return null status for wordAlignment and a language', () => {
    //given
    const langId = 'en';
    const bookId = 'rom';
    const developerMode = false;
    const expectedStatus = null;

    //when
    const status = ToolCardHelpers.getToolCardLaunchStatus(langId, bookId, developerMode, developerMode, translate);

    //then
    expect(status).toEqual(expectedStatus);
  });

  test('Should return book not supported status for wordAlignment with an OT book', () => {
    //given
    const bookId = 'psa';
    const developerMode = false;
    const expectedStatus = false;

    //when
    const status = ToolCardHelpers.isToolSupported(bookId, developerMode);

    //then
    expect(status).toEqual(expectedStatus);
  });

  test('Should return null status for translationWords tool, a language and bookId of "tit"', () => {
    //given
    const langId = 'en';
    const bookId = 'tit';
    const developerMode = false;
    const expectedStatus = null;

    //when
    const status = ToolCardHelpers.getToolCardLaunchStatus(langId, bookId, developerMode, translate);

    //then
    expect(status).toEqual(expectedStatus);
  });
});

