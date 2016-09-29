
const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;
const RB = api.ReactBootstrap;
const {Glyphicon, FormGroup, FormControl, ControlLabel, InputGroup, Button} = RB;
const style = require("./Style");

class PackageManagerView extends React.Component{
  constructor() {
    super();
    this.state = {
    };
  }

  render(){
    return(
      <div style={{Style.layout}}>

      </div>
    );
  }

}
module.exports = ReactDOM.render(<PackageManagerView />, document.getElementById('package_manager'));
