// MenuHeaders.js//
//api imports
const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;
const Glyphicon = ReactBootstrap.Glyphicon;
const style = require('./Style');

class MenuHeaders extends React.Component {
  constructor(){
    super();
    this.state ={

    }
  }

  handleSelection(groupName){
    console.log(groupName);
  }

  render() {
    var groupsName = [];
    console.log(this.props.currentTool);
    if(this.props.currentTool){
      var groupsObjects = api.getDataFromCheckStore(this.props.currentTool, 'groups');
      for(var i in groupsObjects){
        groupsName.push(
          <tr key={i}
              onClick={this.handleSelection.bind(this, groupsObjects[i].group)}
              style={{display: "block", padding: "10px", cursor: "pointer", borderBottom: "1px solid #747474"}}>
            {groupsObjects[i].group}
          </tr>
        );
      }

    }
    console.log(groupsName);
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
