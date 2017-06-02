// TranlsationCore.js Test

import App from '../../out/js/pages/app';

const expectedState = 'expectedState';

const action = {
  type: 'type'
};
const mapDispatchToProps = (dispatch) => ({
  dispatchProp(action) {
    dispatch(action);
  }
});

const mapStateToProps = (state) => ({
  state
});

describe('example shallowWithStore', () => {
  describe('state', () => {
    it('works', () => {
      const ConnectedComponent = connect(mapStateToProps)(App);
      const component = shallow(<ConnectedComponent store={createMockStore(expectedState)}/>);
      expect(component.props().state).to.equal(expectedState);
    });
  });

  describe('dispatch', () => {
    it('works', () => {
      const store = createMockStore();
      const ConnectedComponent = connect(undefined, mapDispatchToProps)(App);
      const component = shallow(<ConnectedComponent store={store}/>);
      component.props().dispatchProp(action);
      expect(store.isActionDispatched(action)).to.be.true;
    });
  });
});
