const React = require('react');
const Button = require('react-bootstrap/lib/Button');
const style = require('../styles/loginStyle');
const LoginModal = require ('../components/LoginModal');

class Toggle extends React.Component{
  constructor() {
    super();
    this.state = {
      online: false,
      buttonColor: false
    };
  }//close constructor
  handleClick(){
    this.setState({online: !this.state.online});
    this.setState({buttonColor: !this.state.buttonColor});
  }//close handleClick

  render(){
    const text = this.state.online ? 'Online' : 'Offline';
    const statusColor = this.state.buttonColor ? 'success' : 'danger';
    return(
      <div>
        <Button bsStyle={statusColor} style={style.button}
        onClick={this.handleClick.bind(this)}>{text}</Button>
      </div>
    );
  }
}

module.exports = Toggle;
