import { reducerTest } from 'redux-jest';
import reducer, * as fromToolsReducer from '../toolsReducer';
import types from '../../actions/ActionTypes';

describe('tools reducer', () => {
  it('should return the initial state', () => {
    const stateBefore = {
      'selectedTool': null,
      'tools': { 'byName': {}, 'byObject': [] },
    };
    expect(reducer(undefined, {})).toEqual(stateBefore);
  });

  describe('add tool', () => {
    const stateBefore = {
      'selectedTool': null,
      'tools': { 'byName': {}, 'byObject': [] },
    };
    const action = {
      type: types.ADD_TOOL,
      name: 'mytool',
      tool: { key: 'value' },
    };
    const stateAfter = {
      'selectedTool': null,
      'tools': {
        'byName': { mytool: 0 },
        'byObject': [
          { key: 'value' },
        ],
      },
    };
    reducerTest('adds a tool', reducer, stateBefore, action, stateAfter);
  });

  describe('add second tool', () => {
    const stateBefore = {
      'selectedTool': null,
      'tools': {
        'byName': { mytool: 0 },
        'byObject': [
          { key: 'value' },
        ],
      },
    };
    const action = {
      type: types.ADD_TOOL,
      name: 'secondtool',
      tool: { key: 'secondvalue' },
    };
    const stateAfter = {
      'selectedTool': null,
      'tools': {
        'byName': {
          mytool: 0,
          secondtool: 1,
        },
        'byObject': [
          { key: 'value' },
          { key: 'secondvalue' },
        ],
      },
    };
    reducerTest('adds a second tool', reducer, stateBefore, action, stateAfter);
  });

  describe('open tool', () => {
    const stateBefore = {
      'selectedTool': null,
      'tools': {
        'byName': { mytool: 0 },
        'byObject': [
          { key: 'value' },
        ],
      },
    };
    const action = {
      type: types.OPEN_TOOL,
      name: 'mytool',
    };
    const stateAfter = {
      'selectedTool': 'mytool',
      'tools': {
        'byName': { mytool: 0 },
        'byObject': [
          { key: 'value' },
        ],
      },
    };
    reducerTest('opens a tool', reducer, stateBefore, action, stateAfter);
  });

  describe('close tool', () => {
    const stateBefore = {
      'selectedTool': null,
      'tools': {
        'byName': { mytool: 0 },
        'byObject': [
          { key: 'value' },
        ],
      },
    };
    const action = { type: types.CLOSE_TOOL };
    const stateAfter = {
      'selectedTool': null,
      'tools': {
        'byName': { mytool: 0 },
        'byObject': [
          { key: 'value' },
        ],
      },
    };
    reducerTest('closes the tool', reducer, stateBefore, action, stateAfter);
  });
});

describe('selectors', () => {
  describe('get tools', () => {
    it('should return no tools', () => {
      const state = {
        selectedTool: null,
        tools: {
          byName: {},
          byObject: [],
        },
      };
      const expectedResult = [];
      const result = fromToolsReducer.getTools(state);
      expect(result).toEqual(expectedResult);
    });

    it('should return tools', () => {
      const state = {
        selectedTool: null,
        tools: {
          byName: {},
          byObject: [{ name: 'one' }, { name: 'two' }],
        },
      };
      const expectedResult = [{ name: 'one' }, { name: 'two' }];
      const result = fromToolsReducer.getTools(state);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('get selected tool name', () => {
    it('returns the selected tool name', () => {
      const state = { selectedTool: 'one' };
      const expectedResult = 'one';
      const result = fromToolsReducer.getCurrentToolName(state);
      expect(result).toEqual(expectedResult);
    });

    it('does return the selected tool name', () => {
      const state = { selectedTool: null };
      const expectedResult = false;
      const result = fromToolsReducer.getCurrentToolName(state);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('get selected tool container', () => {
    it('returns the selected tool container', () => {
      const state = {
        selectedTool: 'one',
        tools: {
          byName: { one: 0 },
          byObject: [{ container: 'container' }],
        },
      };
      const expectedResult = 'container';
      const result = fromToolsReducer.getSelectedToolContainer(state);
      expect(result).toEqual(expectedResult);
    });

    it('does return the selected tool container', () => {
      const state = {
        selectedTool: null,
        tools: {
          byName: { one: 0 },
          byObject: [{ container: 'container' }],
        },
      };
      const expectedResult = null;
      const result = fromToolsReducer.getSelectedToolContainer(state);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('get selected tool api', () => {
    it('returns the selected tool api', () => {
      const state = {
        selectedTool: 'one',
        tools: {
          byName: { one: 0 },
          byObject: [{ api: 'api' }],
        },
      };
      const expectedResult = 'api';
      const result = fromToolsReducer.getSelectedToolApi(state);
      expect(result).toEqual(expectedResult);
    });

    it('does return the selected tool container', () => {
      const state = {
        selectedTool: null,
        tools: {
          byName: { one: 0 },
          byObject: [{ api: 'api' }],
        },
      };
      const expectedResult = null;
      const result = fromToolsReducer.getSelectedToolApi(state);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('get selected tool title', () => {
    it('returns the selected tool title', () => {
      const state = {
        selectedTool: 'one',
        tools: {
          byName: { one: 0 },
          byObject: [{ title: 'the title' }],
        },
      };
      const expectedResult = 'the title';
      const result = fromToolsReducer.getSelectedToolTitle(state);
      expect(result).toEqual(expectedResult);
    });

    it('does return the selected tool title', () => {
      const state = { selectedTool: null };
      const expectedResult = '';
      const result = fromToolsReducer.getSelectedToolTitle(state);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('get tool', () => {
    it('returns the tool', () => {
      const state = {
        tools: {
          byName: { one: 0 },
          byObject: [{ title: 'the title' }],
        },
      };
      const expectedResult = { title: 'the title' };
      const result = fromToolsReducer.getTool(state, 'one');
      expect(result).toEqual(expectedResult);
    });

    it('does return the tool', () => {
      const state = {
        tools: {
          byName: {},
          byObject: [],
        },
      };
      const expectedResult = null;
      const result = fromToolsReducer.getTool(state, 'one');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('get supporting tool apis', () => {
    it('returns the apis', () => {
      const state = {
        selectedTool: 'two',
        tools: {
          byName: {
            one: 0, two: 1, three: 2,
          },
          byObject: [
            { name: 'one', api: 'first' },
            { name: 'two', api: 'second' },
            { name: 'three', api: 'third' }],
        },
      };
      const expectedResult = { 'one': 'first', 'three': 'third' };
      const result = fromToolsReducer.getSupportingToolApis(state);
      expect(result).toEqual(expectedResult);
    });

    it('does return the apis', () => {
      const state = {
        selectedTool: null,
        tools: {
          byName: {},
          byObject: [],
        },
      };
      const expectedResult = {};
      const result = fromToolsReducer.getSupportingToolApis(state);
      expect(result).toEqual(expectedResult);
    });
  });
});
