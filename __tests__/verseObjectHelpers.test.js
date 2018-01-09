import * as VerseObjectHelpers from '../src/js/helpers/VerseObjectHelpers';

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
    const string = "hello, world. hello world";
    const json = VerseObjectHelpers.verseObjectsFromString(string);
    const expected = [
      {
        tag: "w",
        type: "word",
        text: "hello",
        occurrence: 1,
        occurrences: 2
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
        occurrences: 2
      },
      {
        type: "text",
        text: "."
      },
      {
        tag: "w",
        type: "word",
        text: "hello",
        occurrence: 2,
        occurrences: 2
      },
      {
        tag: "w",
        type: "word",
        text: "world",
        occurrence: 2,
        occurrences: 2
      }
    ];
    expect(json).toEqual(expected);
  });

  it('handles embeded markers like footnotes', () => {

  });
});
