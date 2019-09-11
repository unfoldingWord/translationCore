import { getToolGatewayLanguage } from '../projectDetailsReducer';

describe('selectors', () => {
  it(`it returns the tool's gateway language`, () => {
    const state = { manifest: { toolsSelectedGLs: { tool: 'de' } } };
    const result = getToolGatewayLanguage(state, 'tool');
    expect(result).toEqual('de');
  });

  it(`it returns the default gateway language`, () => {
    const state = { manifest: { toolsSelectedGLs: {} } };
    const result = getToolGatewayLanguage(state, 'tool');
    expect(result).toEqual('en');
  });
});
