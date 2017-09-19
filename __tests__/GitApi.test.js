/* eslint-env jest */

import GitApi from '../src/js/helpers/GitApi.js';
import fs from 'fs-extra';


describe('GitApi.status', () => {
    test('status should give an error when not in an existing directory ', () => {
        return new Promise((resolve) => {
            GitApi('../invalidFolder').status(function (err, data) {
                expect(err).not.toBeNull();
                expect(data).not.toBeTruthy();
                resolve();
            });
        });
    });

    test('status should give an error when not in a git repo', () => {
        fs.removeSync('../testDir');
        fs.removeSync('../testRepo');
        fs.ensureDirSync('../testDir');
        fs.writeFileSync('../testDir/test.txt', 'sup');
        return new Promise((resolve) => {
            GitApi('../testDir').status(function (err, data) {
                expect(err).not.toBeNull();
                expect(data).not.toBeTruthy();
                resolve();
            });
        });
    });

    test('status should give the status of the current repo', () => {
        return new Promise((resolve) => {
            GitApi().status(function (err, data) {
                expect(err).toBeNull();
                expect(typeof data).toEqual('object');
                expect(typeof data.current).toEqual('string');
                resolve();
            });
        });
    });
});


describe('GitApi.checkout', () => {
    test('checkout should give an error when not in an existing directory ', () => {
        return new Promise((resolve) => {
            GitApi('../invalidFolder').checkout('test', function(err) {
                expect(err).not.toBeNull();
                resolve();
            });
        });
    });

    test('checkout should give an error when no branch is given ', () => {
        return new Promise((resolve) => {
            GitApi('../invalidFolder').checkout(null, function(err) {
                expect(err).not.toBeNull();
                expect(err).toEqual("No branch");
                resolve();
            });
        });
    });

    test('checkout should give an error when not in a git repo', () => {
        return new Promise((resolve) => {
            GitApi('../testDir').checkout('master', function(err) {
                expect(err).not.toBeNull();
                resolve();
            });
        });
    });
});

describe('GitApi.mirror', () => {
  test('mirror should give an error when not in an existing directory ', () => {
    return new Promise((resolve) => {
        GitApi('../invalidFolder').mirror('test', '../invalidFolder', function(err) {
            expect(err).not.toBeNull();
            resolve();
        });
    });
  });

  test('mirror should give an error when no data is given ', () => {
      return new Promise((resolve) => {
          GitApi('../invalidFolder').mirror(null, null, function(err) {
              expect(err).not.toBeNull();
              expect(err).toEqual("Missing URL or save path");
              resolve();
          });
      });
  });

  test('mirror should clone a git repo into a directory', () => {
      return new Promise((resolve) => {
          GitApi('../testDir').mirror('https://git.door43.org/klappy/blank.git', '../testRepo', function(err) {
              expect(err).toBeNull();
              resolve();
          });
      });
  });
});

describe('GitApi.add', () => {
  test('add should give an error when not in an existing directory ', () => {
    return new Promise((resolve) => {
        GitApi('../invalidFolder').add(function(err) {
            expect(err).not.toBeNull();
            resolve();
        });
    });
  });

  test('add should give an error when not in a git repo', () => {
      return new Promise((resolve) => {
          fs.ensureDirSync('../testDir');
          GitApi('../testDir').add(function(err) {
              expect(err).not.toBeNull();
              resolve();
          });
      });
  });

  test('add should add files of the current repo', () => {
      return new Promise((resolve) => {
          GitApi().add(function(err) {
              expect(err).toBeNull();
              resolve();
          });
      });
  });
});

describe('GitApi.init', () => {
  test('init should give an error when not in an existing directory ', () => {
      return new Promise((resolve) => {
          GitApi('../invalidFolder').init(function(err) {
              expect(err).not.toBeNull();
              resolve();
          });
      });
  });

  test('init should initialize a git repo with no issue', () => {
      return new Promise((resolve) => {
          fs.ensureDirSync('../testDir');
          GitApi('../testDir').init(function(err) {
              expect(err).toBeNull();
              resolve();
          });
      });
  });
});

describe('GitApi.add', () => {
  test('add should add an untracked file to staging', () => {
      return new Promise((resolve) => {
          GitApi('../testDir').add(function(outerErr) {
              expect(outerErr).toBeNull();
              GitApi('../testDir').status(function(innerErr, data) {
                  expect(innerErr).toBeNull();
                  expect(data.created[0]).toEqual('test.txt');
                  resolve();
              });
          });
      });
  });
});

describe('GitApi.commit', () => {
  test('commit should commit staged files', () => {
      return new Promise((resolve) => {
          GitApi('../testDir').commit('user', 'test commit', function(outerErr, data) {
              expect(outerErr).toBeNull();
              expect(typeof data).toEqual('object');
              GitApi('../testDir').status(function(innerErr, data) {
                  expect(innerErr).toBeNull();
                  expect(data.created[0]).toBeUndefined();
                  resolve();
              });
          });
      });
  });
});

describe('GitApi.checkout', () => {
  test('checkout should checkout to master', () => {
      return new Promise((resolve) => {
          GitApi('../testDir').checkout('master', function(outerErr, data) {
              expect(outerErr).toBeNull();
              GitApi('../testDir').status(function(innerErr, data) {
                  expect(innerErr).toBeNull();
                  expect(data.current).toEqual('master');
                  resolve();
              });
          });
      });
  });
});
