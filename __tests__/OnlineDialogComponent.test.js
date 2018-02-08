/* eslint-env jest */
import renderer from 'react-test-renderer';
import OnlineDialog from '../src/js/components/dialogComponents/OnlineDialog';
jest.mock('material-ui/Checkbox');

// Tests for OnlineDialog React Component
describe('OnlineDialog Componenet', () => {
  test('Should render a component that matches snapshot', () => {
    const checkBoxAction = jest.fn();
    const tree = renderer.create(
        OnlineDialog(checkBoxAction)
    );
    expect(tree).toMatchSnapshot();
  });
});