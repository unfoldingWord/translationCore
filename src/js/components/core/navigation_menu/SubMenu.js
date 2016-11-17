// SubMenu.js//
//api imports
const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;


class SubMenu extends React.Component {
  constructor(){
    super();
    this.state = {
      currentGroupName: null,
    }
  }

  getCurrentGroupName(){
    var currentGroupName = api.getCurrentGroupName();
    this.setState({currentGroupName: currentGroupName});
  }

  generateSubMenuButtons(){
    let subMenuItemsArray = this.props.subMenuItemsArray;
    let subMenuItems = [];
    for(var i in subMenuItemsArray){
      subMenuItems.push(
        <tr key={i}
            style={{display: "block", padding: "10px 10px 10px 15px", cursor: "pointer", borderBottom: "1px solid #333333", color: "#FFF", width: "100vw"}}>
          {subMenuItemsArray[i].chapter + ":" + subMenuItemsArray[i].verse}
        </tr>
      );
    }
    return subMenuItems;
  }

  render() {
    return (
      <table>
        <tbody>
          {this.generateSubMenuButtons()}
        </tbody>
      </table>
    );
  }
}

module.exports = SubMenu;
