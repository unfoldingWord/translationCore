const React = require('react');
const Button = require('react-bootstrap/lib/Button');



class OnlineStatus extends React.Component{
  constructor(){
    super();
    this.state ={
      online: false;
    };
  }
  componentWillMount(){
    window.addEventListener("offline", function() {this.setState({online: false});});
    window.addEventListener("online", function() {this.setState({online: true});});
  }
  render(){
    const text = this.state.online ? 'Online' : 'Offline';
    const statusColor = this.state.online ? 'success' : 'danger';
    return(
      <div>
          <Button bsStyle={statusColor} style={{borderRadius: '3%'}}>{text}</Button>
      </div>
      );
  }
}


module.exports = OnlineStatus;
