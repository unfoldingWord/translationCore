/* eslint-env jest */
import React from 'react';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import CheckSoftwareUpdatesDialog, {
  STATUS_LOADING, STATUS_OK,
  STATUS_UPDATE, STATUS_ERROR,
} from '../js/components/dialogComponents/SoftwareUpdateDialog';
import { getUpdateAsset } from '../js/containers/SoftwareUpdateDialog/SoftwareUpdateDialogContainer';

describe('Get update asset', () => {
  it('release is older', () => {
    const response = {
      tag_name: '0.0.1',
      assets: [{ name: 'translationCore-linux-x64-0.0.1.zip' }],
    };
    const expectedUpdate = {
      'installed_version': '1.0.0',
      'latest_version': '0.0.1',
      'name': 'translationCore-linux-x64-0.0.1.zip',
    };
    const { update } = getUpdateAsset(response, '1.0.0', 'x64', 'linux');
    expect(update).toEqual(expectedUpdate);
  });

  it('cannot find an asset for the system', () => {
    const response = {
      tag_name: '2.0.0',
      assets: [{ name: 'translationCore-linux-x64-2.0.0.zip' }],
    };
    const expectedUpdate = null;
    const expectedUpToDate = false;
    const { update, upToDate } = getUpdateAsset(response, '1.0.0', 'x64', 'darwin');
    expect(update).toEqual(expectedUpdate);
    expect(upToDate).toEqual(expectedUpToDate);
  });

  it('finds an update', () => {
    const response = {
      extra_info: 'foo',
      tag_name: '2.0.0',
      assets: [{
        extra_info: 'bar',
        name: 'translationCore-linux-x64-2.0.0.zip',
      }],
    };
    const expectedUpdate = {
      extra_info: 'bar',
      installed_version: '1.0.0',
      name: 'translationCore-linux-x64-2.0.0.zip',
      latest_version: '2.0.0',
    };
    const expectedUpToDate = false;
    const { update, upToDate } = getUpdateAsset(response, '1.0.0', 'x64', 'linux');
    expect(update).toEqual(expectedUpdate);
    expect(upToDate).toEqual(expectedUpToDate);
  });

  it('finds an x32 update', () => {
    const response = {
      extra_info: 'foo',
      tag_name: '2.0.0',
      assets: [{
        extra_info: 'bar',
        name: 'translationCore-win-x32-2.0.0.exe',
      }],
    };
    const expectedUpdate = {
      extra_info: 'bar',
      installed_version: '1.0.0',
      name: 'translationCore-win-x32-2.0.0.exe',
      latest_version: '2.0.0',
    };
    const expectedUpToDate = false;
    const { update, upToDate } = getUpdateAsset(response, '1.0.0', 'x32', 'win32');
    expect(update).toEqual(expectedUpdate);
    expect(upToDate).toEqual(expectedUpToDate);
  });

  it('finds an ia32 update', () => {
    const response = {
      extra_info: 'foo',
      tag_name: '2.0.0',
      assets: [{
        extra_info: 'bar',
        name: 'translationCore-win-x32-2.0.0.exe',
      }],
    };
    const expectedUpdate = {
      extra_info: 'bar',
      installed_version: '1.0.0',
      name: 'translationCore-win-x32-2.0.0.exe',
      latest_version: '2.0.0',
    };
    const expectedUpToDate = false;
    const { update, upToDate } = getUpdateAsset(response, '1.0.0', 'ia32', 'win32');
    expect(update).toEqual(expectedUpdate);
    expect(upToDate).toEqual(expectedUpToDate);
  });

  it('finds a MacOS arm64 fallback update', () => {
    const response = {
      extra_info: 'foo',
      tag_name: '2.0.0',
      assets: [{
        extra_info: 'bar',
        name: 'translationCore-macos-x64-2.0.0.exe',
      }],
    };
    const expectedUpdate = {
      extra_info: 'bar',
      installed_version: '1.0.0',
      name: 'translationCore-macos-x64-2.0.0.exe',
      latest_version: '2.0.0',
    };
    const expectedUpToDate = false;
    const { update, upToDate } = getUpdateAsset(response, '1.0.0', 'arm64', 'darwin');
    expect(update).toEqual(expectedUpdate);
    expect(upToDate).toEqual(expectedUpToDate);
  });

  it('finds a MacOS arm64 update', () => {
    const tagName = '2.0.0';
    const response = {
      extra_info: 'foo',
      tag_name: tagName,
      assets: [{
        extra_info: 'bar',
        name: 'translationCore-macos-arm64-2.0.0.exe',
      }],
    };
    const expectedUpdate = {
      extra_info: 'bar',
      installed_version: '1.0.0',
      name: 'translationCore-macos-arm64-2.0.0.exe',
      latest_version: '2.0.0',
    };
    const expectedTagName = tagName;
    const expectedIsLiteRelease = false;
    const expectedUpToDate = false;
    const {
      update,
      upToDate,
      tagName: tagName_,
      isLiteRelease,
    } = getUpdateAsset(response, '1.0.0', 'arm64', 'darwin');
    expect(update).toEqual(expectedUpdate);
    expect(upToDate).toEqual(expectedUpToDate);
    expect(tagName_).toEqual(expectedTagName);
    expect(isLiteRelease).toEqual(expectedIsLiteRelease);
  });

  it('detects lite release', () => {
    const tagName = '2.0.0-Lite';
    const response = {
      extra_info: 'foo',
      tag_name: tagName,
      assets: [{
        extra_info: 'bar',
        name: 'translationCore-macos-arm64-2.0.0.exe',
      }],
    };
    const expectedUpdate = {
      extra_info: 'bar',
      installed_version: '1.0.0',
      name: 'translationCore-macos-arm64-2.0.0.exe',
      latest_version: tagName,
    };
    const expectedTagName = tagName;
    const expectedIsLiteRelease = true;
    const expectedUpToDate = false;
    const {
      update,
      upToDate,
      tagName: tagName_,
      isLiteRelease,
    } = getUpdateAsset(response, '1.0.0', 'arm64', 'darwin');
    expect(update).toEqual(expectedUpdate);
    expect(upToDate).toEqual(expectedUpToDate);
    expect(tagName_).toEqual(expectedTagName);
    expect(isLiteRelease).toEqual(expectedIsLiteRelease);
  });
});

describe('CheckSoftwareUpdateDialog state', () => {
  beforeAll(() => {
    configure({ adapter: new Adapter() });
  });

  // TRICKY: we are unable to test button state with the 0.x material-ui library

  it('displays loading by default', () => {
    const mockClose = jest.fn();
    const mockSubmit = jest.fn();
    const dialog = shallow(
      <CheckSoftwareUpdatesDialog open={true}
        translate={k=>k}
        onSubmit={mockSubmit}
        onClose={mockClose}
        status={STATUS_LOADING}/>,
    );
    const message = dialog.find('#message');
    expect(message.text()).toEqual(expect.stringContaining('updates.checking_for_app'));
    // TODO: ensure only primary button is visible and disabled
  });

  it('displays up to date', () => {
    const mockClose = jest.fn();
    const mockSubmit = jest.fn();
    const dialog = shallow(
      <CheckSoftwareUpdatesDialog open={true}
        translate={k=>k}
        onSubmit={mockSubmit}
        onClose={mockClose}
        status={STATUS_OK}/>,
    );
    const message = dialog.find('#message');
    expect(message.text()).toEqual(expect.stringContaining('running_latest_version'));
    // TODO: ensure only primary button is visible and enabled
  });

  it('displays error', () => {
    const mockClose = jest.fn();
    const mockSubmit = jest.fn();
    const dialog = shallow(
      <CheckSoftwareUpdatesDialog open={true}
        translate={k=>k}
        onSubmit={mockSubmit}
        onClose={mockClose}
        status={STATUS_ERROR}/>,
    );
    const message = dialog.find('#message');
    expect(message.text()).toEqual(expect.stringContaining('updates.unable_to_check'));
    // TODO: ensure only primary button is visible and enabled
  });

  it('displays update available', () => {
    const mockClose = jest.fn();
    const mockSubmit = jest.fn();
    const update = {
      installed_version: '1.0.0',
      latest_version: '2.0.0',
      size: 100000,
    };
    const dialog = shallow(
      <CheckSoftwareUpdatesDialog open={true}
        translate={k=>k}
        update={update}
        onSubmit={mockSubmit}
        onClose={mockClose}
        status={STATUS_UPDATE}/>,
    );
    const message = dialog.find('#message');
    expect(message.text()).toEqual(expect.stringContaining('update_available'));
    // TODO: ensure secondary and primary button is visible and enabled
  });
});
