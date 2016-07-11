const React = require('react');
const Button = require('react-bootstrap/lib/Button');
const style = require('../styles/loginStyle');
const LoginModal = require ('../components/LoginModal');
const CoreActions = require('../actions/CoreActions.js');

class Toggle extends React.Component{
  constructor() {
    super();
    this.state = {
      online: false,
      buttonColor: false
    };
  }
  handleClick(){
    if(this.state.online == false){
      CoreActions.updateLoginModal(true);
    }
    this.setState({online: !this.state.online});
    this.setState({buttonColor: !this.state.buttonColor});
  }

  render(){
    const text = this.state.online ? 'Online' : 'Offline';
    const statusColor = this.state.buttonColor ? 'success' : 'danger';
    return(
      <div>
        <Button bsStyle={statusColor} style={style.NavBarbutton}
        onClick={this.handleClick.bind(this)}>{text}</Button>
      </div>
    );
  }
}

module.exports = Toggle;
