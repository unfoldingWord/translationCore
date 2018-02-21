import * as VerseObjectHelpers from '../src/js/helpers/VerseObjectHelpers';
jest.unmock('fs-extra');
import fs from 'fs-extra';
import path from 'path-extra';

describe("verseObjectsFromString", () => {

  it('handles words without punctuation', () => {
    const string = "hello world";
    const json = VerseObjectHelpers.verseObjectsFromString(string);
    const expected = [
      {
        tag: "w",
        type: "word",
        text: "hello",
        occurrence: 1,
        occurrences: 1
      },
      {
        tag: "w",
        type: "word",
        text: "world",
        occurrence: 1,
        occurrences: 1
      }
    ];
    expect(json).toEqual(expected);
  });

  it('handles words with punctuation', () => {
    const string = "hello, world.";
    const json = VerseObjectHelpers.verseObjectsFromString(string);
    const expected = [
      {
        tag: "w",
        type: "word",
        text: "hello",
        occurrence: 1,
        occurrences: 1
      },
      {
        type: "text",
        text: ","
      },
      {
        tag: "w",
        type: "word",
        text: "world",
        occurrence: 1,
        occurrences: 1
      },
      {
        type: "text",
        text: "."
      }
    ];
    expect(json).toEqual(expected);
  });

  it('handles multiple occurrences of words and punctuation', () => {
    const string = "son of David, son of Abraham.";
    const json = VerseObjectHelpers.verseObjectsFromString(string);
    const expected = [
      {
        tag: "w",
        type: "word",
        text: "son",
        occurrence: 1,
        occurrences: 2
      },
      {
        tag: "w",
        type: "word",
        text: "of",
        occurrence: 1,
        occurrences: 2
      },
      {
        tag: "w",
        type: "word",
        text: "David",
        occurrence: 1,
        occurrences: 1
      },
      {
        type: "text",
        text: ","
      },
      {
        tag: "w",
        type: "word",
        text: "son",
        occurrence: 2,
        occurrences: 2
      },
      {
        tag: "w",
        type: "word",
        text: "of",
        occurrence: 2,
        occurrences: 2
      },
      {
        tag: "w",
        type: "word",
        text: "Abraham",
        occurrence: 1,
        occurrences: 1
      },
      {
        type: "text",
        text: "."
      }
    ];
    expect(json).toEqual(expected);
  });

  it('handles embeded markers like footnotes', () => {
    const string = "son of David, son of Abraham. \\f Footnotes shouldn't be rendered as text but as content in their own object.\\f*";
    const json = VerseObjectHelpers.verseObjectsFromString(string);
    const expected = [
      {
        tag: "w",
        type: "word",
        text: "son",
        occurrence: 1,
        occurrences: 2
      },
      {
        tag: "w",
        type: "word",
        text: "of",
        occurrence: 1,
        occurrences: 2
      },
      {
        tag: "w",
        type: "word",
        text: "David",
        occurrence: 1,
        occurrences: 1
      },
      {
        type: "text",
        text: ","
      },
      {
        tag: "w",
        type: "word",
        text: "son",
        occurrence: 2,
        occurrences: 2
      },
      {
        tag: "w",
        type: "word",
        text: "of",
        occurrence: 2,
        occurrences: 2
      },
      {
        tag: "w",
        type: "word",
        text: "Abraham",
        occurrence: 1,
        occurrences: 1
      },
      {
        type: "text",
        text: "."
      },
      {
        "tag": "f",
        "type": "footnote",
        "content": "Footnotes shouldn't be rendered as text but as content in their own object."
      }
    ];
    expect(json).toEqual(expected);
  });
});

describe("getWordListFromVerseObjectArray", () => {

  it('handles arrays with nested milestones and text', () => {
    // given
    const testFile = path.join('__tests__', 'fixtures', 'verseObjects', 'matt1-1.json');
    const testData = fs.readJSONSync(testFile);
    const expected = "βίβλος γενέσεως ἰησοῦ χριστοῦ υἱοῦ δαυεὶδ υἱοῦ ἀβραάμ";

    // when
    const results = VerseObjectHelpers.getWordListFromVerseObjectArray(testData);

    // then
    const verseWords = VerseObjectHelpers.mergeVerseData(results);
    expect(verseWords).toEqual(expected);
  });
});

