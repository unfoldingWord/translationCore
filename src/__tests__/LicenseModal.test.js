/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { getBuild } from 'tc-electron-env';
import LicenseModal from '../js/components/home/license/LicenseModal';
import { APP_VERSION } from '../js/common/constants';

describe('LicenseModal component renders correctly', () => {
  test('LicenseModal Component render should match snapshot', () => {
    const closeLicenseModal = jest.fn();
    const modal = shallow(<LicenseModal
      version={`${APP_VERSION} (${getBuild()})`}
      actions={{ closeLicenseModal: closeLicenseModal }}
      showLicenseModal={false}
      translate={k=>k}
    />).dive();

    expect(modal).toMatchSnapshot();
  });
});
