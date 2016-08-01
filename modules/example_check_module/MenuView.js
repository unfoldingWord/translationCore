//MenuView.js//

//Api consts
const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;

//bootstrap imports
const Well = ReactBootstrap.Well;

//dev imports
const MenuItem = require('./menu/MenuItem.js');

//other consts
const extensionRegex = new RegExp('\\.\\w+\\s*$');
const NAMESPACE = 'ExampleChecker';

class MenuView extends React.Component {
  constructor() {
    super();
    this.state = {
      checkObject: api.getDataFromCheckStore(NAMESPACE)
    };

    this.updateMenuItem = this.updateMenuItem.bind(this);
  }

  componentWillMount() {
    api.registerEventListener('changedCheckStatus', this.updateMenuItem);
    this.setState({
      checkObject: api.getDataFromCheckStore(NAMESPACE)
    });
  }

  componentWillUnmount() {
    api.removeEventListener('changedCheckStatus', this.updateMenuItem);
  }

  updateMenuItem(params) {
    var menuItem = this.refs[params.groupIndex.toString() + ' ' + params.checkIndex.toString()];
    menuItem.changeCheckStatus(params.checkStatus);
  }

  render() {
    var _this = this;
    var menuList;
    if (this.state.checkObject) {
      menuList = this.state.checkObject["groups"].map(function(group, groupIndex) {
        var groupHeader = (
          <div>{group.group}</div>
        );
        var checkMenuItems = group.checks.map(function(check, checkIndex) {
          return (
            <div key={checkIndex}>
              <MenuItem
                book={_this.state.checkObject.book}
                check={check}
                groupIndex={groupIndex}
                checkIndex={checkIndex}
                ref={groupIndex.toString() + ' ' + checkIndex.toString()} />
            </div>
          );
        });
        return (
          <div key={groupIndex} style={{paddingBottom: '15px'}}>
            {groupHeader}
            {checkMenuItems}
          </div>
        );
      });
      return (
      <div className='fill-height'>
        <center><h3>Checks</h3></center>
        <Well className='fill-height' style={{overflow: 'scroll', whiteSpace: 'nowrap'}}>
          <div>
            {menuList}
          </div>
        </Well>
      </div>
    )
    }
  }
}


/**
* Compares two string alphabetically
* @param {string} first - string to be compared against
* @param {string} second - string to be compared with
*/
function stringCompare(first, second) {
  if (first < second) {
    return -1;
  }
  else if (first > second) {
    return 1;
  }
else {
    return 0;
  }
}

/**
* @description - Binary search of the list. I couldn't find this in the native methods of an array so
* I wrote it
* @param {array} list - array of items to be searched
* @param {function} boolFunction - returns # < 0, # > 0. or 0 depending on which path the
* search should take
* @param {int} first - beginnging of the current partition of the list
* @param {int} second - end of the current partition of the list
*/
function search(list, boolFunction, first = 0, last = -1) {
  if (last == -1) {
    last = list.length;
  }
  if (first > last) {
    return;
  }
  var mid = Math.floor(((first - last) * 0.5)) + last;
  var result = boolFunction(list[mid]);
  if (result < 0) {
    return search(list, boolFunction, first, mid - 1);
  }
  else if (result > 0) {
    return search(list, boolFunction, mid + 1, last);
  }
else {
    return list[mid];
  }
}

module.exports = MenuView;
