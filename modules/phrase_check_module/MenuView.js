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
    this.state = {
      checkObject: api.getDataFromCheckStore('PhraseChecker')
    };

    this.updateMenuItem = this.updateMenuItem.bind(this);
  }

  componentWillMount() {
    api.registerEventListener('changedCheckStatus', this.updateMenuItem);
    this.setState({
      checkObject: api.getDataFromCheckStore('PhraseChecker')
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
