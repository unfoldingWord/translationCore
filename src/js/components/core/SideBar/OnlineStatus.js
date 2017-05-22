
const api = window.ModuleApi;
const React = api.React;
const RB = api.ReactBootstrap;
const {Glyphicon} = RB;
const style = {
  textOffline: {
    color: "var(--warning-color)",
    display: "inline",
    backgroundColor: 'var(--background-color-dark)',
    outline: 'none',
    border: 0,
  },
  textOnline: {
    color: "var(--completed-color)",
    display: "inline",
    backgroundColor: 'var(--background-color-dark)',
    outline: 'none',
    border: 0,
  }
}

class OnlineStatus extends React.Component {
  constructor() {
    super();
    this.state = {
      online: window.navigator.onLine,
      showToggle: false
    };

    this.setOnline = this.setOnline.bind(this);
    this.setOffline = this.setOffline.bind(this);
    this.toggleVisibility = this.toggleVisibility.bind(this);
  }
  componentWillMount() {
    window.addEventListener("offline", this.setOffline);
    window.addEventListener("online", this.setOnline);
  }
  componentWillUnmount() {
    window.removeEventListener("offline", this.setOffline);
    window.removeEventListener("online", this.setOnline);
  }

  setOnline(fromButton) {
    this.props.changeOnlineStatus(true, false, fromButton);
    //This designates if the call was actually from a button or not
    this.setState({online: true});
  }

  setOffline(fromButton) {
    this.props.changeOnlineStatus(false, false, fromButton);
    //This designates if the call was actually from a button or not
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
                  this.state.online ? this.setOffline(true) : this.setOnline(true);
                  //designates a user action for setOffline function
                }}
               style={{
                 display: this.state.showToggle ? "block" : "none",
                  position: "absolute",
                  zIndex: "9999",
                  background: "var(--background-color-dark)",
                  padding: "3px",
                  borderRadius: "5px",
                  color: status == "Online " ? "var(--warning-color)" : "var(--completed-color)"
               }}>
            Switch to {this.state.online ? "Offline" : "Online"}
          </div>
      </div>
      );
  }
}


module.exports = OnlineStatus;
