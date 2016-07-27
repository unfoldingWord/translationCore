const React = require('react');
const Well = require('react-bootstrap/lib/Well.js');

// const MenuItem = require('./MenuItem');
const api = window.ModuleApi;

class NavigationMenu extends React.Component {
  constructor() {
    super();
    this.state = {
      checkObject: null
    };
    this.updateCheckObject = this.updateCheckObject.bind(this);
    // this.updateMenuItem = this.updateMenuItem.bind(this);
  }

  componentWillMount() {
    api.registerEventListener('changeCheckType', this.updateCheckObject);
  }

  componentWillUnmount() {
    api.removeEventListener('changeCheckType', this.updateCheckObject);
  }

  updateCheckObject(params) {
    var checkData = (params === undefined ? undefined : api.getMenu(params.currentCheckNamespace));
    this.setState({
      checkObject: checkData
    });
  }

  render() {
    if (!this.state.checkObject || this.state.checkObject == null) {
      return <Well style={{minHeight:"100%"}}>{' '}</Well>;
    }
    return (
      <this.state.checkObject />
    );
  }
}

module.exports = NavigationMenu;
