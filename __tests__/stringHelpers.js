/* eslint-env jest */
// helpers
import {tokenize} from '../src/js/helpers/stringHelpers';

describe('Tokenizer', function() {
  it('tokenize() should return empty array for empty string', function() {
    let tokens = tokenize('');
    expect(tokens.length).toEqual(0);
  });
  it('tokenize() should return empty array for " " string', function() {
    let tokens = tokenize(' ');
    expect(tokens.length).toEqual(0);
  });
  it('tokenize() should return ["asdf"] array for "asdf" string', function() {
    let string = 'asdf';
    let tokens = tokenize(string);
    expect(tokens.length).toEqual(1);
    expect(tokens[0]).toEqual('asdf');
  });
  it('tokenize() should return ["asdf", "qwerty"] array for "asdf qwerty" string', function() {
    let string = 'asdf qwerty';
    let tokens = tokenize(string);
    expect(tokens.length).toEqual(2);
    expect(tokens[0]).toEqual('asdf');
    expect(tokens[1]).toEqual('qwerty');
  });
  it('tokenize() should return ["asdf", "qwerty"] array for "asdf, qwerty." string', function() {
    let string = 'asdf, qwerty.';
    let tokens = tokenize(string);
    expect(tokens.length).toEqual(2);
    expect(tokens[0]).toEqual('asdf');
    expect(tokens[1]).toEqual('qwerty');
  });
});
