const React = require('react');
const Button = require('react-bootstrap/lib/Button');
const style = require('../../styles/loginStyle');

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
