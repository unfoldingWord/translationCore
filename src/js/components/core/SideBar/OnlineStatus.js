
const api = window.ModuleApi;
const React = api.React;
const RB = api.ReactBootstrap;
const {Button, ButtonGroup, Glyphicon} = RB;
const style = require("./Style");

class OnlineStatus extends React.Component{
  constructor(){
    super();
    this.state ={
      online: window.navigator.onLine
    };

    this.setOnline = this.setOnline.bind(this);
    this.setOffline = this.setOffline.bind(this);
  }
  componentWillMount(){
    window.addEventListener("offline", this.setOffline);
    window.addEventListener("online", this.setOnline);
  }
  componentWillUnmount(){
    window.removeEventListener("offline", this.setOffline);
    window.removeEventListener("online", this.setOnline);
  }

  setOnline() {
    this.setState({online: true});
  }

  setOffline() {
    this.setState({online: false});
  }

  render(){
    const statusColor = this.state.online ? style.glyphiconOnline : style.glyphiconOffline;

    return(
      <div>
        <li style={style.li}>
          <Glyphicon glyph="signal" style={statusColor}/></li>
      </div>
      );
  }
}


module.exports = OnlineStatus;
