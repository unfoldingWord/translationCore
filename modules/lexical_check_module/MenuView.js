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
    this.currentGroupIndex = checkData.currentGroupIndex;
    this.currentCheckIndex = checkData.currentCheckIndex;
    this.updateMenuItem = this.updateMenuItem.bind(this);
    this.goToNext = this.goToNext.bind(this);
    this.goToPrevious = this.goToPrevious.bind(this);
    this.goToCheck = this.goToCheck.bind(this);
  }

  componentWillMount() {
    api.registerEventListener('changedCheckStatus', this.updateMenuItem);
    api.registerEventListener('goToCheck', this.goToCheck);
    api.registerEventListener('goToNext', this.goToNext);
    api.registerEventListener('goToPrevious', this.goToPrevious);
    this.setState({
      checkObject: api.getDataFromCheckStore('LexicalChecker')
    });
  }

  componentWillUnmount() {
    api.removeEventListener('changedCheckStatus', this.updateMenuItem);
    api.removeEventListener('goToCheck', this.goToCheck);
    api.removeEventListener('goToNext', this.goToNext);
    api.removeEventListener('goToPrevious', this.goToPrevious);
  }

  componentDidMount() {
    this.refs[`${this.currentGroupIndex} ${this.currentCheckIndex}`].setActive(true);
  }
    
  goToNext() {
    this.unselectOldMenuItem();
    // if we need to move to the next group
    if (this.currentCheckIndex >= this.state.checkObject.groups[this.currentGroupIndex].checks.length - 1) {
      // if we're not on the last group
      if (this.currentGroupIndex < this.state.checkObject.groups.length - 1) {
        this.currentGroupIndex++;
        this.currentCheckIndex = 0;
      }
    }
    else { // if we still have more in the group
      this.currentCheckIndex++;
    }
    this.selectNewMenuItem();
  }
  
  goToPrevious() {
    this.unselectOldMenuItem();
    // if we need to move to the previous group
    if (this.currentCheckIndex <= 0) {
      // if we're not on the first group
      if (this.currentGroupIndex > 0) {
        this.currentGroupIndex--;
        this.currentCheckIndex = this.state.checkObject.groups[this.currentGroupIndex].checks.length - 1;
      }
    }
    else { // if we still have more in the group
      this.currentCheckIndex--;
    }
    this.selectNewMenuItem();
  }
  
  goToCheck(params) {
    this.unselectOldMenuItem();
    this.currentGroupIndex = params.groupIndex;
    this.currentCheckIndex = params.checkIndex;
    this.selectNewMenuItem();
  }
  
  unselectOldMenuItem() {
    this.refs[`${this.currentGroupIndex} ${this.currentCheckIndex}`].setActive(false);
  }
  
  selectNewMenuItem() {
    this.refs[`${this.currentGroupIndex} ${this.currentCheckIndex}`].setActive(true);
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
      <div className='fill-height'>
        <Well className='fill-height' style={{overflowY: 'scroll', maxHeight: '750px', marginTop: "5px"}}>
          <div>
            <center><h3>Checks</h3></center>
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
