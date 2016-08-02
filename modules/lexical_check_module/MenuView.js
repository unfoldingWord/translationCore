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

class MenuView extends React.Component {
  constructor() {
    super();
    let checkData = api.getDataFromCheckStore('LexicalChecker');
    this.state = {
      checkObject: checkData
    };
    this.curGroupIndex = checkData.currentGroupIndex;
    this.curVerseIndex = checkData.currentCheckIndex;
    this.updateMenuItem = this.updateMenuItem.bind(this);
    this.updateActive = this.updateActive.bind(this);
  }

  componentWillMount() {
    api.registerEventListener('changedCheckStatus', this.updateMenuItem);
    api.registerEventListener('goToCheck', this.updateActive);
    api.registerEventListener('goToNext', this.updateActive);
    this.setState({
      checkObject: api.getDataFromCheckStore('LexicalChecker')
    });
  }

  componentWillUnmount() {
    api.removeEventListener('changedCheckStatus', this.updateMenuItem);
    api.removeEventListener('goToCheck', this.updateActive);
    api.removeEventListener('goToNext', this.updateActive);
  }

  componentDidMount() {
    this.refs[`${this.curGroupIndex} ${this.curVerseIndex}`].setActive(true);
  }

  updateActive(params) {
    this.refs[`${this.curGroupIndex} ${this.curVerseIndex}`].setActive(false);
    // goToNext handler
    if (params === undefined) {
      // if we need to move to the next group
      if (this.curVerseIndex >= this.state.checkObject.groups[this.curGroupIndex].checks.length - 1) {
        // if we need to wrap all the way back around
        if (this.curGroupIndex >= this.state.checkObject.groups.length - 1) {
          return;
        }
        else {
          this.curGroupIndex++;
          this.curVerseIndex = 0;
        }
      }
      else { // if we still have more in the group
        this.curVerseIndex++;
      }
      this.refs[`${this.curGroupIndex} ${this.curVerseIndex}`].setActive(true);
    }
    else { // goToCheck handler
      this.curGroupIndex = params.groupIndex;
      this.curVerseIndex = params.checkIndex;
    }

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
        //This will get us the proper header
        var header = search(api.getDataFromCheckStore('LexicalChecker', 'wordList'),
          function(item) {
            return stringCompare(group.group, item.name);
          });
        if (header) {
          header = header.header;
        }
        else {
          header = group.group;
        }
        var groupHeader = (
          <div>{header.replace(extensionRegex, '')}</div>
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
          <div key={groupIndex}>
            {groupHeader}
            {checkMenuItems}
          </div>
        );
      });
      return (
<<<<<<< HEAD
        <div className='fill-height'>
          <Well className='fill-height' style={{overflowY: 'scroll'}}>
            <div>
              <h3>Checks</h3>
              {menuList}
            </div>
          </Well>
        </div>
      )
    }
    else {
      return (<div></div>);
=======
      <div className='fill-height'>
        <center><h3>Checks</h3></center>
        <Well className='fill-height' style={{overflowY: 'scroll'}}>
          <div>
            {menuList}
          </div>
        </Well>
      </div>
    )
>>>>>>> develop
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
