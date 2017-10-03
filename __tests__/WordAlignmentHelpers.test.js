/* eslint-env jest */
//helpers
import * as WordAlignmentHelpers from '../src/js/helpers/WordAlignmentHelpers';

describe('WordAlignmentHelpers.sortWordObjectsByString', () => {
  const string = 'qwerty asdf zxcv uiop jkl; bnm, qwerty asdf zxcv jkl; bnm,';
  it('should return wordObjectsArray sorted and in order', function () {
    const wordObjectArray = [
      { word: 'zxcv', occurrence: 2, occurrences: 2 },
      { word: 'qwerty', occurrence: 2, occurrences: 2 },
      { word: 'qwerty', occurrence: 1, occurrences: 2 },
      { word: 'zxcv', occurrence: 1, occurrences: 2 }
    ];
    const output = WordAlignmentHelpers.sortWordObjectsByString(wordObjectArray, string);
    const expected = [
      { word: 'qwerty', occurrence: 1, occurrences: 2 },
      { word: 'zxcv', occurrence: 1, occurrences: 2 },
      { word: 'qwerty', occurrence: 2, occurrences: 2 },
      { word: 'zxcv', occurrence: 2, occurrences: 2 }
    ];
    expect(output).toEqual(expected);
  });
});

describe('WordAlignmentHelpers.targetLanguageVerseFromAlignments', () => {
  it('should return wordObjectsArray in order of bottomWords for targetLanguage verse', function () {
    const string = 'of Jesus Christ';
    const alignments = [
      {
        topWords: [
          { word: 'Ἰησοῦ', occurrence: 1, occurrences: 1, strongs: "G24240" }
        ],
        bottomWords: [
          { word: 'Jesus', occurrence: 1, occurrences: 1 },
          { word: 'of', occurrence: 1, occurrences: 1 }
        ]
      },
      {
        topWords: [
          { word: 'Χριστοῦ', occurrence: 1, occurrences: 1, strongs: "G55470" }
        ],
        bottomWords: [
          { word: 'Christ', occurrence: 1, occurrences: 1 }
        ]
      }
    ];
    const output = WordAlignmentHelpers.targetLanguageVerseFromAlignments(alignments, string);
    const expected = [
      {
        word: "of",
        occurrence: 1,
        occurrences: 1,
        bhp: [
          {
            word: "Ἰησοῦ",
            strongs: "G24240",
            occurrence: 1,
            occurrences: 1
          }
        ]
      },
      {
        word: "Jesus",
        occurrence: 1,
        occurrences: 1,
        bhp: [
          {
            word: "Ἰησοῦ",
            strongs: "G24240",
            occurrence: 1,
            occurrences: 1
          }
        ]
      },
      {
        word: "Christ",
        occurrence: 1,
        occurrences: 1,
        bhp: [
          {
            word: "Χριστοῦ",
            strongs: "G55470",
            occurrence: 1,
            occurrences: 1
          }
        ]
      }
    ];
    expect(output).toEqual(expected);
  });
  it('should return work with single bottom word aligned to two top words', function () {
    const string = 'Jesucristo';
    const alignments = [
      {
        topWords: [
          { word: 'Ἰησοῦ', occurrence: 1, occurrences: 1, strongs: "G24240" },
          { word: 'Χριστοῦ', occurrence: 1, occurrences: 1, strongs: "G55470" }
        ],
        bottomWords: [
          { word: 'Jesucristo', occurrence: 1, occurrences: 1 }
        ]
      }
    ];
    const output = WordAlignmentHelpers.targetLanguageVerseFromAlignments(alignments, string);
    const expected = [
      {
        word: "Jesucristo",
        occurrence: 1,
        occurrences: 1,
        bhp: [
          {
            word: "Ἰησοῦ",
            strongs: "G24240",
            occurrence: 1,
            occurrences: 1
          },
          {
            word: "Χριστοῦ",
            strongs: "G55470",
            occurrence: 1,
            occurrences: 1
          }
        ]
      }
    ];
    expect(output).toEqual(expected);
  });
});


describe('WordAlignmentHelpers.alignmentsFromTargetLanguageVerse', () => {
  it('should return wordObjectsArray in order of bottomWords for targetLanguage verse', function () {
    const topWordVerseData = [
      {
        word: "Ἰησοῦ",
        strongs: "G24240",
        occurrence: 1,
        occurrences: 1
      },
      {
        word: "Χριστοῦ",
        strongs: "G55470",
        occurrence: 1,
        occurrences: 1
      }
    ];
    const bottomWordVerseData = 'of Jesus Christ';
    const wordObjects = [
      {
        word: "Jesus",
        occurrence: 1,
        occurrences: 1,
        bhp: [
          {
            word: "Ἰησοῦ",
            strongs: "G24240",
            occurrence: 1,
            occurrences: 1
          }
        ]
      },
      {
        word: "of",
        occurrence: 1,
        occurrences: 1,
        bhp: [
          {
            word: "Ἰησοῦ",
            strongs: "G24240",
            occurrence: 1,
            occurrences: 1
          }
        ]
      },
      {
        word: "Christ",
        occurrence: 1,
        occurrences: 1,
        bhp: [
          {
            word: "Χριστοῦ",
            strongs: "G55470",
            occurrence: 1,
            occurrences: 1
          }
        ]
      }
    ];
    const output = WordAlignmentHelpers.alignmentsFromTargetLanguageVerse(wordObjects, topWordVerseData, bottomWordVerseData);
    const expected = [
      {
        topWords: [
          { word: 'Ἰησοῦ', occurrence: 1, occurrences: 1, strongs: "G24240" }
        ],
        bottomWords: [
          { word: 'of', occurrence: 1, occurrences: 1 },
          { word: 'Jesus', occurrence: 1, occurrences: 1 }
        ]
      },
      {
        topWords: [
          { word: 'Χριστοῦ', occurrence: 1, occurrences: 1, strongs: "G55470" }
        ],
        bottomWords: [
          { word: 'Christ', occurrence: 1, occurrences: 1 }
        ]
      }
    ];
    expect(output).toEqual(expected);
  });
  it('should return work with single bottom word aligned to two top words', function () {
    const topWordVerseData = [
      {
        word: "Ἰησοῦ",
        strongs: "G24240",
        occurrence: 1,
        occurrences: 1
      },
      {
        word: "Χριστοῦ",
        strongs: "G55470",
        occurrence: 1,
        occurrences: 1
      }
    ];
    const bottomWordVerseData = 'Jesucristo';
    const wordObjects = [
      {
        word: "Jesucristo",
        occurrence: 1,
        occurrences: 1,
        bhp: [
          {
            word: "Ἰησοῦ",
            strongs: "G24240",
            occurrence: 1,
            occurrences: 1
          },
          {
            word: "Χριστοῦ",
            strongs: "G55470",
            occurrence: 1,
            occurrences: 1
          }
        ]
      }
    ];
    const output = WordAlignmentHelpers.alignmentsFromTargetLanguageVerse(wordObjects, topWordVerseData, bottomWordVerseData);
    const expected = [
      {
        topWords: [
          { word: 'Ἰησοῦ', occurrence: 1, occurrences: 1, strongs: "G24240" },
          { word: 'Χριστοῦ', occurrence: 1, occurrences: 1, strongs: "G55470" }
        ],
        bottomWords: [
          { word: 'Jesucristo', occurrence: 1, occurrences: 1 }
        ]
      }
    ];
    expect(output).toEqual(expected);
  });
});
