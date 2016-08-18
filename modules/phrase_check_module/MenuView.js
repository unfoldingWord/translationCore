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
    let checkData = api.getDataFromCheckStore('PhraseChecker');
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
      checkObject: api.getDataFromCheckStore('PhraseChecker')
    });
  }

  componentWillUnmount() {
    api.removeEventListener('changedCheckStatus', this.updateMenuItem);
    api.registerEventListener('goToCheck', this.goToCheck);
    api.registerEventListener('goToNext', this.goToNext);
    api.registerEventListener('goToPrevious', this.goToPrevious);
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
        var sectionList = getSectionFileNamesToTitles();
        var header = sectionList[group.group + '.md'] || group.group;
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
        <center><h3>Checks</h3></center>
        <Well className='fill-height' style={{overflowY: 'scroll'}}>
          <div>
            {menuList}
          </div>
        </Well>
      </div>
    )
    }
  }
}

// Saves an object where the keys are TA section filenames and the values are titles.
// This will be called when TA is loaded
function getSectionFileNamesToTitles() {
  var sections = api.getDataFromCheckStore('TranslationAcademy', 'sectionList');
  var sectionFileNamesToTitles = {};
  for(var sectionFileName in sections) {
    var titleKeyAndValue = sections[sectionFileName]['file'].match(/title: .*/)[0];
    var title = titleKeyAndValue.substr(titleKeyAndValue.indexOf(':') + 1);
    sectionFileNamesToTitles[sectionFileName] = title;
  }
  return sectionFileNamesToTitles;
}

module.exports = MenuView;
