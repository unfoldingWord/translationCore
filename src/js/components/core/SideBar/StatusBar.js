const api = window.ModuleApi;
const React = api.React;
const style = require("./Style");
const OnlineStatus = require("./OnlineStatus");

class StatusBar extends React.Component{
  constructor(){
    super();
    this.state ={
    };
  }

  render(){
    return(
      <div style={style.StatusBar}>
          <OnlineStatus />
      </div>
      );
  }
}


module.exports = StatusBar;
