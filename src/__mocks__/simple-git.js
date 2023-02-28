/* eslint-disable no-undef */
const git = jest.fn();

git.status = jest.fn(cb => {
  cb();
});
git.init = jest.fn((bare, options, cb) => {
  cb && cb();
});
git.pull = jest.fn((remote, branch, cb) => {
  cb();
});
git.push = jest.fn((remote, branch, cb) => {
  cb();
});
git.addConfig = jest.fn((key, value, cb) => {
  cb && cb();
});
git.commit = jest.fn((message, cb) => {
  cb();
});
git.clone = jest.fn((url, path, args, cb) => {
  cb(null);
});
git.add = jest.fn((files, cb) => {
  cb();
});
git.revparse = jest.fn((options, cb) => {
  cb();
});
git.addRemote = jest.fn((name, repo, cb) => {
  cb();
});
git.branchLocal = jest.fn((cb) => {
  cb(null, { current: 'master' });
});
git.branch = jest.fn((options, cb) => {
  cb(null, { current: 'master' });
});
git.getRemotes = jest.fn((verbose, cb) => {
  cb(false, []);
});
git.checkout = jest.fn((branch, options, cb) => {
  cb();
});
git.mirror = jest.fn((url, path, cb) => {
  if (url === 'https://git.door43.org/you_have_bad_connection.git') {
    return cb('Cloning into \'xxx\'...\nfatal: The remote end hung up\n');
  } else {
    fs.__setMockFS({ [path]: {} });
  }
});
git.remote = jest.fn((options, cb) => {
  cb();
});
git._run = jest.fn((options, cb) => {
  cb();
});

export const mocks = git;
export default jest.fn(() => git);
