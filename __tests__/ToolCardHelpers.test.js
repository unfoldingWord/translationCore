/* eslint-env jest */

import * as ToolCardHelpers from "../src/js/helpers/ToolCardHelpers";

describe('Test ToolCardHelpers.getToolCardLaunchStatus() for correct launch status',()=>{
  const translate = (key) => key;

  test('Should return the status that the book is not supported', () => {
    //given
    const toolName = 'translationWords';
    const langId = null;
    const bookId = 'rom';
    const developerMode = false;
    const expectedStatus = 'home.tools.book_not_supported';

    //when
    const status = ToolCardHelpers.getToolCardLaunchStatus(toolName, langId, bookId, developerMode, translate);

    //then
    expect(status).toEqual(expectedStatus);
  });

  test('Even with a langId, should return the status that the book is not supported', () => {
    //given
    const toolName = 'translationWords';
    const langId = 'en';
    const bookId = 'rom';
    const developerMode = false;
    const expectedStatus = 'home.tools.book_not_supported';

    //when
    const status = ToolCardHelpers.getToolCardLaunchStatus(toolName, langId, bookId, developerMode, translate);

    //then
    expect(status).toEqual(expectedStatus);
  });

  test('Should return a GL needs to be selected for wordAlignment', () => {
    //given
    const toolName = 'wordAlignment';
    const langId = null;
    const bookId = 'rom';
    const developerMode = false;
    const expectedStatus = 'home.tools.gl_select';

    //when
    const status = ToolCardHelpers.getToolCardLaunchStatus(toolName, langId, bookId, developerMode, translate);

    //then
    expect(status).toEqual(expectedStatus);
  });

  test('Should return null status for wordAlignment and a language', () => {
    //given
    const toolName = 'wordAlignment';
    const langId = 'en';
    const bookId = 'rom';
    const developerMode = false;
    const expectedStatus = null;

    //when
    const status = ToolCardHelpers.getToolCardLaunchStatus(toolName, langId, bookId, developerMode, developerMode, translate);

    //then
    expect(status).toEqual(expectedStatus);
  });

  test('Should return null status for translationWords tool, a language and bookId of "tit"', () => {
    //given
    const toolName = 'translationWords';
    const langId = 'en';
    const bookId = 'tit';
    const developerMode = false;
    const expectedStatus = null;

    //when
    const status = ToolCardHelpers.getToolCardLaunchStatus(toolName, langId, bookId, developerMode, translate);

    //then
    expect(status).toEqual(expectedStatus);
  });
});

