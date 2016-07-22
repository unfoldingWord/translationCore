const React = require('react');
const Button = require('react-bootstrap/lib/Button');
const style = require('../../styles/loginStyle');

class OnlineStatus extends React.Component{
  constructor(){
    super();
    this.state ={
      online: window.navigator.onLine
    };
  }
  componentWillMount(){
    window.addEventListener("offline", () => {this.setState({online: false});});
    window.addEventListener("online", () => {this.setState({online: true});});
  }
  componentWillUnmount(){
    window.removeEventListener("offline", () => {this.setState({online: false});});
    window.removeEventListener("online", () => {this.setState({online: true});});
  }
  render(){
    const text = this.state.online ? 'Online' : 'Offline';
    const statusColor = this.state.online ? style.online : style.offline;

    return(
      <div>
          <div style={statusColor}></div>
      </div>
      );
  }
}


module.exports = OnlineStatus;
