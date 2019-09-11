import reducer from '../alerts';
import types from '../../actions/ActionTypes';

describe('alerts reducer', () => {
  it('returns the initial state', () => {
    expect(reducer(undefined, {})).toEqual({
      ignored: [],
      props: [],
    });
  });

  it('opens an alert', () => {
    const action = {
      type: types.OPEN_ALERT,
      message: 'hello world',
      id: 'hello-alert',
      confirmText: 'ok',
    };
    const stateAfter = {
      ignored: [],
      props: [{
        children: 'hello world',
        id: 'hello-alert',
        confirmText: 'ok',
      }],
    };
    expect(reducer(undefined, action)).toEqual(stateAfter);
  });

  it('opens an ignored alert without ignore handler', () => {
    const stateBefore = {
      ignored: ['hello-alert'],
      props: [],
    };
    const action = {
      type: types.OPEN_ALERT,
      message: 'hello world',
      id: 'hello-alert',
      confirmText: 'ok',
    };
    const stateAfter = {
      ignored: ['hello-alert'],
      props: [{
        children: 'hello world',
        id: 'hello-alert',
        confirmText: 'ok',
      }],
    };
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('does not open an ignored alert with ignore handler', () => {
    const stateBefore = {
      ignored: ['hello-alert'],
      props: [],
    };
    const action = {
      type: types.OPEN_ALERT,
      message: 'hello world',
      id: 'hello-alert',
      confirmText: 'ok',
      onIgnore: () => {},
    };
    const stateAfter = {
      ignored: ['hello-alert'],
      props: [],
    };
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('opens an alert twice', () => {
    const action = {
      type: types.OPEN_ALERT,
      message: 'hello world',
      id: 'hello-alert',
      confirmText: 'ok',
    };
    const stateAfter = {
      ignored: [],
      props: [{
        children: 'hello world',
        id: 'hello-alert',
        confirmText: 'ok',
      }],
    };
    expect(reducer(undefined, action)).toEqual(stateAfter);
    expect(reducer(undefined, action)).toEqual(stateAfter);
  });

  it('closes an alert', () => {
    const stateBefore = {
      ignored: [],
      props: [{
        children: 'hello world',
        id: 'hello-alert',
        confirmText: 'ok',
      }],
    };
    const action = {
      type: types.CLOSE_ALERT,
      message: 'hello world',
      id: 'hello-alert',
      confirmText: 'ok',
    };
    const stateAfter = {
      ignored: [],
      props: [],
    };
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });

  it('ignores an alert', () => {
    const action = {
      type: types.IGNORE_ALERT,
      id: 'hello-alert',
      ignore: true,
    };
    const stateAfter = {
      ignored: ['hello-alert'],
      props: [],
    };
    expect(reducer(undefined, action)).toEqual(stateAfter);
  });

  it('stops ignoring an alert', () => {
    const stateBefore = {
      ignored: ['hello-alert'],
      props: [],
    };
    const action = {
      type: types.IGNORE_ALERT,
      id: 'hello-alert',
      ignore: false,
    };
    const stateAfter = {
      ignored: [],
      props: [],
    };
    expect(reducer(stateBefore, action)).toEqual(stateAfter);
  });
});
