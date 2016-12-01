// MenuHeaders.js//
//api imports
const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;
const style = require('./Style');
const ProgressBar = require('react-progressbar.js');
const Circle = ProgressBar.Circle;

class MenuHeaders extends React.Component {
  constructor(){
    super();
    this.groupName = null;
    this.updateCurrentMenuHeader = this.updateCurrentMenuHeader.bind(this);
    this.newToolSelected = this.newToolSelected.bind(this);
    this.getGroupProgress = this.getGroupProgress.bind(this);
    this.updateSubMenuItemProgress = this.updateSubMenuItemProgress.bind(this);
  }

  componentWillMount(){
    api.registerEventListener('changeGroupName', this.updateCurrentMenuHeader);
    api.registerEventListener('changeCheckType', this.newToolSelected);
    api.registerEventListener('changedCheckStatus', this.updateSubMenuItemProgress);
  }

  componentWillUnmount(){
    api.removeEventListener('changeGroupName', this.updateCurrentMenuHeader);
    api.removeEventListener('changeCheckType', this.newToolSelected);
    api.removeEventListener('changedCheckStatus', this.updateSubMenuItemProgress);
  }

  handleSelection(groupName){
    api.setCurrentGroupName(groupName);
  }

  updateCurrentMenuHeader(params) {
    this.unselectOldMenuItem();
    this.groupName = params.groupName;
    this.selectNewMenuItem();
  }

  newToolSelected(){
    //switched Tool therefore generate New MenuHeader
    this.groupName = api.getCurrentGroupName();
    this.handleSelection(this.groupName);
    this.generateProgressForAllMenuHeaders();
  }

  unselectOldMenuItem() {
    if(this.groupName){
      var groupName = this.groupName;
      this.refs[`${groupName}`].setIsCurrentCheck(false);
    }
  }

  selectNewMenuItem() {
    if(this.groupName){
      var groupName = this.groupName;
      this.refs[`${groupName}`].setIsCurrentCheck(true);
    }
  }

  generateProgressForAllMenuHeaders(){
    let groups = api.getDataFromCheckStore(this.props.currentTool, 'groups');
    for(var group in groups){
      let groupName = groups[group].group;
      let progress = this.getGroupProgress(groups[group]);
      if(groupName){
        this.refs[`${groupName}`].setCurrentProgress(progress);
      }else{
        console.log("groupName is undefined");
      }
    }
  }

  updateSubMenuItemProgress(params){
    let groups = api.getDataFromCheckStore(this.props.currentTool, 'groups');
    let foundGroup = groups.find(arrayElement => arrayElement.group === this.groupName);
    let currentProgress = this.getGroupProgress(foundGroup);
    if(this.groupName){
      var groupName = this.groupName;
      this.refs[`${groupName}`].setCurrentProgress(currentProgress);
    }
  }

  getGroupProgress(groupObj){
    var numChecked = 0;
    var numUnchecked = 0;
    for(var i = 0; i < groupObj.checks.length; i++){
      if(groupObj.checks[i].checkStatus != "UNCHECKED"){
        numChecked++;
      }else{
        numUnchecked++;
      }
    }
    var total = numChecked+numUnchecked;
    return numChecked/total;
  }

  render() {
    var groupsName = [];
    if(this.props.currentTool){
      var groupsObjects = api.getDataFromCheckStore(this.props.currentTool, 'groups');
      for(var i in groupsObjects){
        groupsName.push(
          <MenuHeadersItems key={i}
              handleSelection={this.handleSelection.bind(this, groupsObjects[i].group)}
              value={groupsObjects[i].group}
              ref={groupsObjects[i].group.toString()}/>
        );
      }
    }
    return (
      <table style={{color: "#FFF"}}>
        <tbody>
        {groupsName}
        </tbody>
      </table>
    );
  }

}

class MenuHeadersItems extends React.Component {
  constructor(){
    super();
    this.state = {
      isCurrentItem: false,
      currentGroupprogress: null,
    }
  }

  groupNameClicked(){
    this.props.handleSelection();
    this.setIsCurrentCheck(true);
  }

  setIsCurrentCheck(status){
    this.setState({isCurrentItem: status});
  }
  setCurrentProgress(progress){
    this.setState({currentGroupprogress: progress});
  }


  render() {
    var itemStyle = this.state.isCurrentItem ? style.activeMenuHeader : style.menuHeader;

    return (
      <tr onClick={this.groupNameClicked.bind(this)}
          style={itemStyle}
          title="Click to select this reference">
        <th>
          <Circle
            progress={this.state.currentGroupprogress}
            options={{
              strokeWidth: 15,
              color: "#4ABBE6",
              trailColor: "#FFF",
              trailWidth: 15
            }}
            initialAnimate={false}
            containerStyle={{
              width: '20px',
              height: '20px',
              marginRight: '5px'
            }}
          />
        </th>
        <td>
          {this.props.value}
        </td>
      </tr>
    );
  }
}


module.exports = MenuHeaders;
