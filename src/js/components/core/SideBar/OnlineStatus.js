
const api = window.ModuleApi;
const React = api.React;
const RB = api.ReactBootstrap;
const {Glyphicon} = RB;
const style = require("./Style");

class OnlineStatus extends React.Component{
  constructor(){
    super();
    this.state ={
      online: window.navigator.onLine,
      showToggle: false
    };

    this.setOnline = this.setOnline.bind(this);
    this.setOffline = this.setOffline.bind(this);
    this.toggleVisibility = this.toggleVisibility.bind(this);
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

  toggleVisibility(){
    this.setState({showToggle: !this.state.showToggle});
  }

  render(){
    const textStatusColor = this.state.online ? style.textOnline : style.textOffline;
    const status = this.state.online ? "Online " : "Offline ";
    return(
      <div style={textStatusColor} onClick={this.toggleVisibility}>
          Status: {status}
          <Glyphicon glyph={"triangle-bottom"}
                     style={{fontSize:10}}
                     />
          <div onClick={()=>{
                  this.state.online ? this.setOffline() : this.setOnline();
                }}
               style={{
                 display: this.state.showToggle ? "block" : "none",
                  position: "absolute",
                  zIndex: "9999",
                  background: "#333",
                  padding: "3px",
                  borderRadius: "5px",
                  color: status == "Online " ? "#FF0000" : "#4eba6f"
               }}>
            Switch to {this.state.online ? "Offline" : "Online"}
          </div>
      </div>
      );
  }
}


module.exports = OnlineStatus;
