const api = window.ModuleApi;

const React = require('react');
const Well = require('react-bootstrap/lib/Well.js');

const MenuItem = require('./MenuItem');


class NavigationMenu extends React.Component {
  constructor() {
    super();
    this.updateCheckObject = this.updateCheckObject.bind(this);
    this.state = {
      checkObject: this.getCheckObject()
    };
  }

  componentWillMount() {
    api.registerEventListener('phraseDataLoaded', this.updateCheckObject);
  }

  componentWillUnmount() {
    api.removeEventListener('phraseDataLoaded', this.updateCheckObject);
  }
  
  updateCheckObject() {
    this.setState({
      checkObject: this.getCheckObject()
    })
  }
  
  getCheckObject() {
    // TODO: get checkType using api.getDataFromCommon()
    return api.getDataFromCheckStore("PhraseCheck");
  }

  render() {
    var menuList;
    if (!this.state.checkObject || !this.state.checkObject["groups"]) {
      return <div></div>;
    }
    menuList = this.state.checkObject["groups"].map(function(group, groupIndex) {
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
