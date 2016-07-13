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
      buttonColor: false
    };
  }
  handleClick(){
    if(this.state.online == false){
      CoreActions.updateLoginModal(true);
    }else if(this.state.online === true){
      CoreActions.updateButtonColor(false);
      CoreActions.updateButtonText(false);
    }

  }
  componentWillMount() {
    CoreStore.addChangeListener(this.updateButtonText.bind(this));
    CoreStore.addChangeListener(this.updateButtonColor.bind(this));
  }

  componentWillUnmount() {
    CoreStore.removeChangeListener(this.updateButtonText.bind(this));
    CoreStore.removeChangeListener(this.updateButtonColor.bind(this));
  }

  updateButtonText(){
    this.setState({online: CoreStore.getButtonText()});
  }
  updateButtonColor(){
    this.setState({buttonColor: CoreStore.getButtonColor()});
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
