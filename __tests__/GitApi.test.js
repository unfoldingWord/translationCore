import GitApi from '../src/js/helpers/GitApi.js';

jest.mock('simple-git');

/**
 * These methods simply pass the callback into simple-git
 * so the response can bubble up.
 */
describe('simple bubble up methods', () => {
    let mocks, cb, git;
    beforeEach(() => {
        mocks = require('simple-git').mocks;
        cb = jest.fn();
        git = GitApi('./null');
        jest.clearAllMocks();
    });

    it('bubbles up init', () => {
        git.init(cb);
        expect(mocks.init).toBeCalledWith(false, cb);
        expect(cb).toBeCalled();
    });

    it('bubbles up pull', () => {
        git.pull('remote', 'branch', cb);
        expect(mocks.pull).toBeCalledWith('remote', 'branch', cb);
        expect(cb).toBeCalled();
    });

    it('bubbles up push', () => {
        git.push('remote', 'branch', cb);
        expect(mocks.push).toBeCalledWith('remote', 'branch', cb);
        expect(cb).toBeCalled();
    });

    it('bubbles up status', () => {
        git.status(cb);
        expect(mocks.status).toBeCalledWith(cb);
        expect(cb).toBeCalled();
    });

    it('bubbles up add', () => {
        git.add(cb);
        expect(mocks.add).toBeCalledWith('./*', cb);
        expect(cb).toBeCalled();
    });

    it('bubbles up revparse', () => {
        git.revparse('options', cb);
        expect(mocks.revparse).toBeCalledWith('options', cb);
        expect(cb).toBeCalled();
    });

    it('bubbles up remote', () => {
        git.remote('options', cb);
        expect(mocks.remote).toBeCalledWith('options', cb);
        expect(cb).toBeCalled();
    });

    it('bubbles up run', () => {
        git.run('options', cb);
        expect(mocks._run).toBeCalledWith('options', cb);
        expect(cb).toBeCalled();
    });
});


describe('commit', () => {
    let mocks, cb, git;

    beforeEach(() => {
        mocks = require('simple-git').mocks;
        git = GitApi('./null');
        cb = jest.fn();
        jest.clearAllMocks();
    });

    test('favoring name and email', () => {
        const user = {
            name: 'name',
            username: 'username',
            email: 'email'
        };
        git.commit(user, 'message', cb);
        expect(mocks.addConfig.mock.calls[0]).toContain('user.name', user.name);
        expect(mocks.addConfig.mock.calls[1]).toContain('user.email', user.email);
        expect(mocks.commit).toBeCalledWith('message', cb);
        expect(cb).toBeCalled();
    });

    test('favoring username', () => {
        const user = {
            username: 'username'
        };
        git.commit(user, 'message', cb);
        expect(mocks.addConfig.mock.calls[0]).toContain('user.name', user.username);
        expect(mocks.addConfig.mock.calls[1]).toContain('user.email', 'Unknown');
        expect(mocks.commit).toBeCalledWith('message', cb);
        expect(cb).toBeCalled();
    });

    test('without a user', () => {
        git.commit(null, 'message', cb);
        expect(mocks.addConfig.mock.calls[0]).toContain('user.name', 'translationCore User');
        expect(mocks.addConfig.mock.calls[1]).toContain('user.email', 'Unknown');
        expect(mocks.commit).toBeCalledWith('message', cb);
        expect(cb).toBeCalled();
    });
});

describe('mirror', () => {
    let mocks, cb, git;

    beforeEach(() => {
        mocks = require('simple-git').mocks;
        git = GitApi('./null');
        cb = jest.fn();
        jest.clearAllMocks();
    });

    test('with a valid url', () => {
        git.mirror('url', 'path', cb);
        expect(mocks.clone).toBeCalledWith('url', 'path', ['--recursive'], expect.any(Function));
        expect(cb).toBeCalled();
    });

    test('with a bad url', () => {
        git.mirror(null, 'path', cb);
        expect(mocks.clone).not.toBeCalled();
        expect(cb).toBeCalledWith('Missing URL or save path');
    });

    test('with a bad path', () => {
        git.mirror('url', null, cb);
        expect(mocks.clone).not.toBeCalled();
        expect(cb).toBeCalledWith('Missing URL or save path');
    });

    test('without errors', () => {
        git.mirror('url', 'path', cb);
        expect(mocks.clone).toBeCalled();
        expect(cb).toBeCalledWith(null);
    });

    test('with errors', () => {
        mocks.clone.mockImplementationOnce((url, path, args, callback) => callback('error'));
        git.mirror('url', 'path', cb);
        expect(mocks.clone).toBeCalled();
        expect(cb).toBeCalledWith('error');
    });
});

describe('update', () => {
    let mocks, cb, git;

    beforeEach(() => {
        mocks = require('simple-git').mocks;
        git = GitApi('./null');
        cb = jest.fn();
        jest.clearAllMocks();
    });

    test('first update', () => {
        git.update('remote', 'branch', true, cb);
        expect(mocks.push).toBeCalledWith('remote', 'branch', expect.any(Function));
        expect(cb).toBeCalled();
    });

    test('first update with errors', () => {
        git.update('remote', 'branch', true, cb);
        expect(mocks.push).toBeCalledWith('remote', 'branch', expect.any(Function));
        expect(cb).toBeCalled();
    });

    test('second update', () => {
        git.update('remote', 'branch', false, cb);
        expect(mocks.pull).toBeCalledWith('remote', 'branch', expect.any(Function));
        expect(mocks.push).toBeCalledWith('remote', 'branch', expect.any(Function));
        expect(cb).toBeCalled();
    });

    test('second update with errors', () => {
        git.update('remote', 'branch', false, cb);
        expect(mocks.pull).toBeCalledWith('remote', 'branch', expect.any(Function));
        expect(mocks.push).toBeCalledWith('remote', 'branch', expect.any(Function));
        expect(cb).toBeCalled();
    });
});

describe('save', () => {
    let mocks, cb, git;

    beforeEach(() => {
        mocks = require('simple-git').mocks;
        git = GitApi('./null');
        cb = jest.fn();
        jest.clearAllMocks();
    });

    test('no errors', () => {
        git.save(null, 'message', 'path', cb);
        expect(mocks.init).toBeCalled();
        expect(mocks.add).toBeCalled();
        expect(mocks.commit).toBeCalled();
        expect(cb).toBeCalledWith(null);
    });

    test('with add errors', () => {
        mocks.add.mockImplementationOnce((files, callback) => callback('error'));
        git.save(null, 'message', 'path', cb);
        expect(mocks.init).toBeCalled();
        expect(mocks.add).toBeCalled();
        expect(mocks.commit).toBeCalled();
        expect(cb).toBeCalledWith('error');
    });

    test('with commit errors', () => {
        mocks.commit.mockImplementationOnce((message, callback) => callback('error'));
        git.save(null, 'message', 'path', cb);
        expect(mocks.init).toBeCalled();
        expect(mocks.add).toBeCalled();
        expect(mocks.commit).toBeCalled();
        expect(cb).toBeCalledWith('error');
    });
});

describe('checkout', () => {
    let mocks, cb, git;

    beforeEach(() => {
        mocks = require('simple-git').mocks;
        git = GitApi('./null');
        cb = jest.fn();
        jest.clearAllMocks();
    });

    test('with branch', () => {
        git.checkout('branch', cb);
        expect(mocks.checkout).toBeCalledWith('branch', cb);
        expect(cb).toBeCalled();
    });

    test('without branch', () => {
        git.checkout(null, cb);
        expect(mocks.checkout).not.toBeCalled();
        expect(cb).toBeCalledWith('No branch');
    });
});