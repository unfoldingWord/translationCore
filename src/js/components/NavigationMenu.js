const React = require('react');
const update = require('react-addons-update');
const Well = require('react-bootstrap/lib/Well.js');

const CheckStore = require('../stores/CheckStore');
const MenuItem = require('./core/MenuItem');

class NavigationMenu extends React.Component {
  constructor() {
    super();
    this.retrieveChecks = this.retrieveChecks.bind(this);
    this.state = {
      checks: CheckStore.getAllChecks()
    };
  }

  retrieveChecks() {
    this.setState({
      checks: CheckStore.getAllChecks()
    });
  }

  componentWillMount() {
    CheckStore.addChangeListener(this.retrieveChecks);
  }

  componentWillUnmount() {
    CheckStore.removeChangeListener(this.retrieveChecks);
  }

  render() {
    var menuItems = this.state.checks.map(function(check, index){
      return (
        <div key={index}>
          <MenuItem
            check={check}
            checkIndex={index}
            isCurrentCheck={index == CheckStore.getCheckIndex()}
          />
        </div>
      );
    });
    return (
      <div>
        <Well>
          {menuItems}
        </Well>
      </div>
    )
  }
}

module.exports = NavigationMenu;
