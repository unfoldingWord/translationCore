const React = require('react');
const Well = require('react-bootstrap/lib/Well.js');

const MenuItem = require('./MenuItem');
const api = window.ModuleApi;

const extensionRegex = new RegExp('\\.\\w+\\s*$');

class NavigationMenu extends React.Component {
  constructor() {
    super();
    this.updateCheckObject = this.updateCheckObject.bind(this);
    this.state = {
      checkObject: this.getCheckObject()
    };
  }

  componentWillMount() {
    api.registerEventListener('changeCheckType', this.updateCheckObject);
  }

  componentWillUnmount() {
    api.removeEventListener('changeCheckType', this.updateCheckObject);
  }
  
  updateCheckObject(params) {
    var checkData = (params === undefined ? undefined : api.getDataFromCheckStore(params.currentCheckNamespace));
    this.setState({
      checkObject: checkData
    });
  }
  
  getCheckObject() {
    // TODO: get checkType using api.getDataFromCommon()
    return api.getDataFromCheckStore("PhraseCheck");
  }

  render() {
    var menuList;
    if (!this.state.checkObject || !this.state.checkObject["groups"]) {
      return <Well style={{minHeight:"100%"}}>{' '}</Well>;
    }
    menuList = this.state.checkObject["groups"].map(function(group, groupIndex) {
      var groupHeader = (
        <div>{group.group.replace(extensionRegex, '')}</div>
      );
      var checkMenuItems = group.checks.map(function(check, checkIndex) {
        return (
          <div key={checkIndex}>
            <MenuItem check={check} groupIndex={groupIndex} checkIndex={checkIndex} />
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
          <h3>Checks</h3>
          {menuList}
        </Well>
      </div>
    )
  }
}

module.exports = NavigationMenu;
