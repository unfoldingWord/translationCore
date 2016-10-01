/**
 *@author: Manny Colon
 *@description: This component takes on props from PackageManagerView.js
 in order to display cards for each of the apps/packages found
 ******************************************************************************/
const api = window.ModuleApi;
const React = api.React;
const ReactDOM = require("react-dom");
const ReactBootstrap = api.ReactBootstrap;
const RB = api.ReactBootstrap;
//const {Glyphicon, FormGroup, FormControl, ControlLabel, InputGroup, Button} = RB;
const style = require("./Style");

class PackageCard extends React.Component{
  constructor() {
    super();
    this.state = {
    };
  }

  render(){
    return(
        <div style={style.cardLayout}>
            hello
        </div>
    );
  }
}
module.exports = PackageCard;
