// MenuHeaders.js//
//api imports
const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;
const style = require('./Style');

class MenuHeaders extends React.Component {
  constructor(){
    super();
    this.state ={
    }
  }

  handleSelection(groupName){
    api.setCurrentGroupName(groupName);
  }

  render() {
    var groupsName = [];
    if(this.props.currentTool){
      var groupsObjects = api.getDataFromCheckStore(this.props.currentTool, 'groups');
      for(var i in groupsObjects){
        groupsName.push(
          <tr key={i}
              onClick={this.handleSelection.bind(this, groupsObjects[i].group)}
              style={style.MenuHeaders}
              title="Click to select this reference">
            {groupsObjects[i].group}
          </tr>
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

module.exports = MenuHeaders;
