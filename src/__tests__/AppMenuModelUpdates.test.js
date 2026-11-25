/* eslint-env jest */
import React from 'react';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import AppMenu from '../js/containers/AppMenu';
import { isLocalServerAvailable } from '../js/actions/ModelUpdatesActions';

const translate = key => key;

/**
 * @param {object} status - what localServer.getStatus() resolves to
 * @param {object} [features]
 * @return {object} a window.AiAPIs stand-in
 */
const makeAiApis = (status, features = {}) => ({
  features: {
    messages: true, localServer: true, modelUpdates: true, ...features,
  },
  models: { checkForUpdates: jest.fn() },
  localServer: { getStatus: jest.fn(() => (status instanceof Error ? Promise.reject(status) : Promise.resolve(status))) },
});

const flushPromises = () => new Promise(resolve => setImmediate(resolve));

const hasModelUpdateItem = wrapper =>
  wrapper.find('MenuItem').someWhere(item => item.prop('primaryText') === 'updates.check_for_model_updates');

beforeAll(() => {
  configure({ adapter: new Adapter() });
});

afterEach(() => {
  delete window.AiAPIs;
});

describe('isLocalServerAvailable', () => {
  test('true when the local server reports available', async () => {
    window.AiAPIs = makeAiApis({ available: true });
    await expect(isLocalServerAvailable()).resolves.toBe(true);
  });

  test('false when the local server is not available (e.g. Windows ia32)', async () => {
    window.AiAPIs = makeAiApis({ available: false });
    await expect(isLocalServerAvailable()).resolves.toBe(false);
  });

  test('false when the status call fails', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    window.AiAPIs = makeAiApis(new Error('no handler'));
    await expect(isLocalServerAvailable()).resolves.toBe(false);
    console.warn.mockRestore();
  });

  test('false for a bridge without model updates or a local server', async () => {
    window.AiAPIs = makeAiApis({ available: true }, { modelUpdates: false });
    await expect(isLocalServerAvailable()).resolves.toBe(false);
    window.AiAPIs = makeAiApis({ available: true }, { localServer: false });
    await expect(isLocalServerAvailable()).resolves.toBe(false);
    delete window.AiAPIs;
    await expect(isLocalServerAvailable()).resolves.toBe(false);
  });
});

describe('AppMenu model updates item', () => {
  test('shown when the local server is available', async () => {
    window.AiAPIs = makeAiApis({ available: true });
    const wrapper = shallow(<AppMenu translate={translate}/>);
    expect(hasModelUpdateItem(wrapper)).toBe(false); // not until the status is known
    await flushPromises();
    wrapper.update();
    expect(hasModelUpdateItem(wrapper)).toBe(true);
  });

  test('hidden when the local server is not available', async () => {
    window.AiAPIs = makeAiApis({ available: false });
    const wrapper = shallow(<AppMenu translate={translate}/>);
    await flushPromises();
    wrapper.update();
    expect(hasModelUpdateItem(wrapper)).toBe(false);
    expect(wrapper.find('MenuItem').length).toBe(4);
  });
});
