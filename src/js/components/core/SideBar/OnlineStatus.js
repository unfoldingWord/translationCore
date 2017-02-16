
const api = window.ModuleApi;
const React = api.React;
const RB = api.ReactBootstrap;
const {Glyphicon} = RB;
const style = {
  textOffline: {
    color: "#FF0000",
    display: "inline",
    backgroundColor: '#333333',
    outline: 'none',
    border: 0,
  },
  textOnline: {
    color: "#4eba6f",
    display: "inline",
    backgroundColor: '#333333',
    outline: 'none',
    border: 0,
  }
}

class OnlineStatus extends React.Component {
  constructor() {
    super();
    this.state = {
      online: window.navigator.onLine
    };

    this.setOnline = this.setOnline.bind(this);
    this.setOffline = this.setOffline.bind(this);
    this.onPress = this.onPress.bind(this);
  }
  componentWillMount() {
    window.addEventListener("offline", this.setOffline);
    window.addEventListener("online", this.setOnline);
  }
  componentWillUnmount() {
    window.removeEventListener("offline", this.setOffline);
    window.removeEventListener("online", this.setOnline);
  }

  setOnline() {
    this.props.changeOnlineStyle(true);
  }

  setOffline() {
    this.props.changeOnlineStyle(false);
  }

  onPress() {
    this.props.changeOnlineStatus(!this.props.online, true);
  }

  render() {
    console.log(this.props);
    const textStatusColor = this.props.online ? style.textOnline : style.textOffline;
    const status = this.props.online ? "Online " : "Offline ";
    return (
      <button style={textStatusColor} onMouseDown={this.onPress} >
        Status: {status}
        <Glyphicon glyph={"triangle-bottom"} style={{ fontSize: 10 }} />
      </button>
    );
  }
}


module.exports = OnlineStatus;
