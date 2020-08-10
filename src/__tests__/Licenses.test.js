/* eslint-env jest */
import React from 'react';
import { mount } from 'enzyme';
import Licenses from '../js/components/home/license/Licenses';
import attributionData from '../js/components/home/license/attributionData.json';
import {
  ignorePackages, staticFonts, packageRename,
} from '../../scripts/attributions/attributionHelpers';

describe('Licenses component renders correctly', () => {
  let html;

  beforeAll(()=> {
    html = mount(<Licenses
      translate={k=>k}
    />).html();
  });

  test('Licenses Component render should contain all the names in attributionData.json', () => {
    for (let name in attributionData.packages) {
      expect(html).toContain(name);
    }
  });

  test('Licenses Component render should contain all the fonts in staticFonts', () => {
    for (let name in staticFonts) {
      expect(html).toContain(name);
    }
  });

  test('Licenses Component render should contain none of the packages in ignoredPackages', () => {
    ignorePackages.forEach(name => {
      expect(html).not.toContain(name);
    });
  });

  test('Licenses Component render should contain the new names in renamePackages', () => {
    for (let name in packageRename) {
      expect(html).not.toContain(name);
      expect(html).toContain(packageRename[name].name);
    }
  });
});
