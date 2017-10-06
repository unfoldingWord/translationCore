/* eslint-env jest */
//helpers
import * as WordAlignmentHelpers from '../src/js/helpers/WordAlignmentHelpers';

describe('WordAlignmentHelpers.sortWordObjectsByString', () => {
  it('should return wordObjectsArray sorted and in order from string', function () {
    const string = 'qwerty asdf zxcv uiop jkl; bnm, qwerty asdf zxcv jkl; bnm,';
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
  it('should return wordObjectsArray sorted and in order from stringWordObjects', function () {
    const stringData = [
      { word: 'qwerty', occurrence: 1, occurrences: 2, stringData: 0 },
      { word: 'zxcv', occurrence: 1, occurrences: 2, stringData: 0 },
      { word: 'qwerty', occurrence: 2, occurrences: 2, stringData: 0 },
      { word: 'zxcv', occurrence: 2, occurrences: 2, stringData: 0 }
    ];
    const wordObjectArray = [
      { word: 'zxcv', occurrence: 2, occurrences: 2, wordObjectData: 1 },
      { word: 'qwerty', occurrence: 1, occurrences: 2, wordObjectData: 1 }
    ];
    const output = WordAlignmentHelpers.sortWordObjectsByString(wordObjectArray, stringData);
    const expected = [
      { word: 'qwerty', occurrence: 1, occurrences: 2, wordObjectData: 1 },
      { word: 'zxcv', occurrence: 2, occurrences: 2, wordObjectData: 1 }
    ];
    expect(output).toEqual(expected);
  });
});

describe('WordAlignmentHelpers.targetLanguageVerseFromAlignments', () => {
  it('should return wordObjectsArray in order of bottomWords for targetLanguage verse', function () {
    const string = 'an apostle of Jesus Christ';
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
    const wordBank = [
      { word: 'an', occurrence: 1, occurrences: 1 },
      { word: 'apostle', occurrence: 1, occurrences: 1 }
    ];
    const output = WordAlignmentHelpers.targetLanguageVerseFromAlignments(alignments, wordBank, string);
    const expected = [
      { word: 'an', occurrence: 1, occurrences: 1 },
      { word: 'apostle', occurrence: 1, occurrences: 1 },
      { word: "of", occurrence: 1, occurrences: 1,
        bhp: [
          { word: "Ἰησοῦ", strongs: "G24240", occurrence: 1, occurrences: 1 }
        ]
      },
      { word: "Jesus", occurrence: 1, occurrences: 1,
        bhp: [
          { word: "Ἰησοῦ", strongs: "G24240", occurrence: 1, occurrences: 1 }
        ]
      },
      { word: "Christ", occurrence: 1, occurrences: 1,
        bhp: [
          { word: "Χριστοῦ", strongs: "G55470", occurrence: 1, occurrences: 1 }
        ]
      }
    ];
    expect(output).toEqual(expected);
  });
  it('should return work with single bottom word aligned to two top words', function () {
    const string = 'de Jesucristo';
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
    const wordBank = [
      { word: 'de', occurrence: 1, occurrences: 1 }
    ];
    const output = WordAlignmentHelpers.targetLanguageVerseFromAlignments(alignments, wordBank, string);
    const expected = [
      { word: 'de', occurrence: 1, occurrences: 1 },
      {
        word: "Jesucristo", occurrence: 1, occurrences: 1,
        bhp: [
          { word: "Ἰησοῦ", strongs: "G24240", occurrence: 1, occurrences: 1 },
          { word: "Χριστοῦ", strongs: "G55470", occurrence: 1, occurrences: 1 }
        ]
      }
    ];
    expect(output).toEqual(expected);
  });
});


describe('WordAlignmentHelpers.alignmentsFromTargetLanguageVerse', () => {
  it('should return wordObjectsArray in order of bottomWords for targetLanguage verse', function () {
    const topWordVerseData = [
      { word: "Ἰησοῦ", strongs: "G24240" },
      { word: "Χριστοῦ", strongs: "G55470" }
    ];
    const wordObjects = [
      { word: "of", occurrence: 1, occurrences: 1,
        bhp: [
          { word: "Ἰησοῦ", strongs: "G24240", occurrence: 1, occurrences: 1 }
        ]
      },
      { word: "Jesus", occurrence: 1, occurrences: 1,
        bhp: [
          { word: "Ἰησοῦ", strongs: "G24240", occurrence: 1, occurrences: 1 }
        ]
      },
      { word: "Christ", occurrence: 1, occurrences: 1,
        bhp: [
          { word: "Χριστοῦ", strongs: "G55470", occurrence: 1, occurrences: 1 }
        ]
      }
    ];
    const output = WordAlignmentHelpers.alignmentsFromTargetLanguageVerse(wordObjects, topWordVerseData);
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
      },
      {
        topWords: [],
        bottomWords: []
      }
    ];
    expect(output).toEqual(expected);
  });
  it('should return work with single bottom word aligned to two top words', function () {
    const topWordVerseData = [
      { word: "Ἰησοῦ", strongs: "G24240" },
      { word: "Χριστοῦ", strongs: "G55470" }
    ];
    const wordObjects = [
      { word: "Jesucristo", occurrence: 1, occurrences: 1,
        bhp: [
          { word: "Ἰησοῦ", strongs: "G24240", occurrence: 1, occurrences: 1 },
          { word: "Χριστοῦ", strongs: "G55470", occurrence: 1, occurrences: 1 }
        ]
      }
    ];
    const output = WordAlignmentHelpers.alignmentsFromTargetLanguageVerse(wordObjects, topWordVerseData);
    const expected = [
      {
        topWords: [
          { word: 'Ἰησοῦ', occurrence: 1, occurrences: 1, strongs: "G24240" },
          { word: 'Χριστοῦ', occurrence: 1, occurrences: 1, strongs: "G55470" }
        ],
        bottomWords: [
          { word: 'Jesucristo', occurrence: 1, occurrences: 1 }
        ]
      },
      {
        topWords: [],
        bottomWords: []
      }
    ];
    expect(output).toEqual(expected);
  });
  it('should return work with single bottom word aligned to two top words', function () {
    const topWordVerseData = [
      { word: "Ἰησοῦ", strongs: "G24240" },
      { word: "Χριστοῦ", strongs: "G55470" },
      { word: "κατὰ", strongs: "G25960" }
    ];
    const wordObjects = [
      { word: "de", occurrence: 1, occurrences: 1 },
      { word: "Jesucristo", occurrence: 1, occurrences: 1,
        bhp: [
          { word: 'Ἰησοῦ', occurrence: 1, occurrences: 1, strongs: "G24240" },
          { word: 'Χριστοῦ', occurrence: 1, occurrences: 1, strongs: "G55470" }
        ]
      }
    ];
    const output = WordAlignmentHelpers.alignmentsFromTargetLanguageVerse(wordObjects, topWordVerseData);
    const expected = [
      {
        topWords: [
          { word: 'Ἰησοῦ', occurrence: 1, occurrences: 1, strongs: "G24240" },
          { word: 'Χριστοῦ', occurrence: 1, occurrences: 1, strongs: "G55470" }
        ],
        bottomWords: [
          { word: 'Jesucristo', occurrence: 1, occurrences: 1 }
        ]
      },
      {
        topWords: [
          { word: "κατὰ", strongs: "G25960", occurrence: 1, occurrences: 1 }
        ],
        bottomWords: []
      },
      {
        topWords: [],
        bottomWords: [
          { word: 'de', occurrence: 1, occurrences: 1 }
        ]
      }
    ];
    expect(output).toEqual(expected);
  });
});
