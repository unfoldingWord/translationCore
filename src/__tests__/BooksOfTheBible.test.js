import * as BooksOfTheBible from '../js/common/BooksOfTheBible';

describe('test getlistOfBibleBooks()', () => {
  test('should have all books', () => {
    const results = BooksOfTheBible.getAllBibleBooks();
    const keys = Object.keys(results);
    expect(keys.length).toEqual(66);
  });
});
