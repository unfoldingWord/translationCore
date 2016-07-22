const React = require('react');
const Button = require('react-bootstrap/lib/Button');

class OnlineStatus extends React.Component{
  render(){
    /*const text = this.state.online ? 'Online' : 'Offline';
    const statusColor = this.state.online ? 'success' : 'danger';*/
    return(
      <div>
          <Button bsStyle="success">Hello</Button>
      </div>
      );
  }
}


module.exports = OnlineStatus;
