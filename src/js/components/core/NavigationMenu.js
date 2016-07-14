const React = require('react');
const update = require('react-addons-update');
const Well = require('react-bootstrap/lib/Well.js');

const CheckStore = require('../../stores/CheckStore');
const MenuItem = require('./MenuItem');

class NavigationMenu extends React.Component {
  constructor() {
    super();
    this.retrieveChecks = this.retrieveChecks.bind(this);
    this.state = {
      groups: CheckStore.getAllChecks()
    };
  }

  retrieveChecks() {
    this.setState({
      groups: CheckStore.getAllChecks()
    });
  }

  componentWillMount() {
    CheckStore.addChangeListener(this.retrieveChecks);
  }

  componentWillUnmount() {
    CheckStore.removeChangeListener(this.retrieveChecks);
  }

  render() {
    var menuList = this.state.groups.map(function(group, groupIndex) {
      var groupHeader = (
        <div>{group.group}</div>
      );
      var checkMenuItems = group.checks.map(function(check, checkIndex) {
        return (
          <div key={checkIndex}>
            <MenuItem
              check={check}
              groupIndex={groupIndex}
              checkIndex={checkIndex}
              isCurrentCheck={checkIndex == CheckStore.getCheckIndex()}
            />
          </div>
        );
      });
      return (
        <div key={groupIndex}>
          {groupHeader}
          {checkMenuItems}
        </div>
      );
    });
    return (
      <div>
        <Well>
          {menuList}
        </Well>
      </div>
    )
  }
}

module.exports = NavigationMenu;
