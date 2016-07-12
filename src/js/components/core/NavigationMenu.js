const React = require('react');
const update = require('react-addons-update');
const Well = require('react-bootstrap/lib/Well.js');

const CheckStore = require('../../stores/CheckStore');
const MenuItem = require('./MenuItem');

class NavigationMenu extends React.Component {
  constructor() {
    super();
    this.retrieveGroups = this.retrieveGroups.bind(this);
    this.state = {
      groups: CheckStore.getAllGroups()
    };
  }

  retrieveGroups() {
    this.setState({
      groups: CheckStore.getAllGroups()
    });
  }

  componentWillMount() {
    CheckStore.addChangeListener(this.retrieveGroups);
  }

  componentWillUnmount() {
    CheckStore.removeChangeListener(this.retrieveGroups);
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
          <div style={{overflowY: 'scroll', height: '80vh', overflowX: 'none'}}>
            {menuList}
          </div>
        </Well>
      </div>
    )
  }
}

module.exports = NavigationMenu;
