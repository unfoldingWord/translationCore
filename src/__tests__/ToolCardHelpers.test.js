/* eslint-env jest */
import * as ToolCardHelpers from '../js/helpers/ToolCardHelpers';

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

  test('Should return book supported status for wordAlignment with an OT book', () => {
    //given
    const bookId = 'psa';
    const developerMode = false;
    const expectedStatus = true;

    //when
    const status = ToolCardHelpers.isToolSupported(bookId, developerMode);

    //then
    expect(status).toEqual(expectedStatus);
  });

  test('Should return book supported status for wordAlignment with an NT book', () => {
    //given
    const bookId = 'rev';
    const developerMode = false;
    const expectedStatus = true;

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

  test('Parse tA article with description', () => {
    //given
    const rawText = `# Abstract Nouns #

    Abstract nouns are nouns that refer to attitudes, qualities, events, situations, or
    even to relationships among these ideas. These are things that cannot be seen or
    need a different way to express it. For example, "What is its <u>weight</u>?"
    could be expressed as "How much does it <u>weigh</u>?" or "How <u>heavy</u> is it?"

    ### Description

    Remember that nouns are words that refer to a person, place, thing, or idea.
    **Abstract Nouns** are the nouns that refer to ideas. These can be attitudes,
    peace, creation, goodness, contentment, justice, truth, freedom, `;


    //when
    const { title, intro } = ToolCardHelpers.parseArticleAbstract(rawText);
    const combined = title + intro;
    //then
    expect(combined).toMatchSnapshot();
  });

  test('Parse tA article with no intro', () => {
    //given
    const rawText = `# Abstract Nouns #

    ### Description

    Remember that nouns are words that refer to a person, place, thing, or idea.
    **Abstract Nouns** are the nouns that refer to ideas. These can be attitudes,
    peace, creation, goodness, contentment, justice, truth, freedom, `;


    //when
    const { title, intro } = ToolCardHelpers.parseArticleAbstract(rawText);
    const combined = title + intro;
    //then
    expect(combined).toMatchSnapshot();
  });

  test('Parse tA article with no intro and no description', () => {
    //given
    const rawText = `# Abstract Nouns #

    Remember that nouns are words that refer to a person, place, thing, or idea.
    **Abstract Nouns** are the nouns that refer to ideas. These can be attitudes,
    peace, creation, goodness, contentment, justice, truth, freedom, `;


    //when
    const { title, intro } = ToolCardHelpers.parseArticleAbstract(rawText);
    const combined = title + intro;
    //then
    expect(combined).toMatchSnapshot();
  });
});

