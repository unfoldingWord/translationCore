/* eslint-env jest */
import { shallow } from 'enzyme';
import { getAttributions } from '../js/helpers/LicensesHelpers';

describe('LicensesHelpers function tests', () => {
  test('Tests LicensesHelpers.getAttributions', () => {
    const attributionData = {
      'packageB': {
        'repository': 'https://github.com/package/b',
        'license': 'MIT',
      },
      'packageA': {
        'repository': 'https://github.com/package/a',
        'license': 'CC BY SA 4.0',
      },
      'packageC': {
        'repository': 'https://github.com/package/c',
        'license': 'SIL Font License',
      },
    };

    const expectedOrder = ['packageA', 'packageB', 'packageC'];

    const attributions = getAttributions(attributionData);

    attributions.forEach((attribution, idx) => {
      const wrapper = shallow(attribution);
      expect(wrapper.html()).toMatchSnapshot();
      const link = wrapper.find('a');
      expect(link.text()).toEqual(expectedOrder[idx]);
      expect(link.prop('href')).toEqual(attributionData[expectedOrder[idx]].repository);
    });
  });
});
