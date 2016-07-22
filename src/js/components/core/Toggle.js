const React = require('react');
const Button = require('react-bootstrap/lib/Button');
const CoreActions = require('../../actions/CoreActions.js');
const CoreStore = require('../../stores/CoreStore.js');
const LoginModal = require ('./LoginModal');
const style = require('../../styles/loginStyle');

class Toggle extends React.Component{
  constructor() {
    super();
    this.state = {
      online: false,
    };
  }

  componentWillMount() {
    CoreStore.addChangeListener(this.updateButtonStatus.bind(this));
  }

  componentWillUnmount() {
    CoreStore.removeChangeListener(this.updateButtonStatus.bind(this));
  }

  handleClick(){
    CoreActions.updateLoginModal(true);
  }

  updateButtonStatus(){
    this.setState({online: CoreStore.getButtonStatus()});
  }

  render(){
    const text = this.state.online ? 'Profile' : 'Log in';
    const statusColor = this.state.online ? 'success' : 'info';
    return(
      <div>
        <Button bsStyle={statusColor} style={style.NavBarbutton}
        onClick={this.handleClick.bind(this)}>{text}</Button>
      </div>
    );
  }
}

module.exports = Toggle;
