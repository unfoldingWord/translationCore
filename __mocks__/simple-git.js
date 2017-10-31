const git = jest.fn();

git.status = jest.fn(cb => {
    cb();
});
git.init = jest.fn((bare, cb) => {
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
git.listRemote = jest.fn((options, cb) => {
    cb();
});
git.checkout = jest.fn((branch, cb) => {
    cb();
});

export const mocks = git;
export default jest.fn(() => git);
