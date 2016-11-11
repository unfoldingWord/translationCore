const React = require('react');
const Well = require('react-bootstrap/lib/Well.js');

// const MenuItem = require('./MenuItem');
const api = window.ModuleApi;

class NavigationMenu extends React.Component {
  constructor() {
    super();
    this.state = {
      checkMenu: null
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
      checkMenu: checkData
    });
  }

  render() {
    if (!this.state.checkMenu) {
      return <Well style={{minHeight:"100%", background: "#c6c4c4", borderRadius: "0px", border: "none"}}>{' '}</Well>;
    }
    return (
      <this.state.checkMenu />
    );
  }
}

module.exports = NavigationMenu;
