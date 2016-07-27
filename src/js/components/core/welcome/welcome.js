const React = require('react');

const RB = require('react-bootstrap');
const {Glyphicon, Button} = RB;

const Login = require('./WelcomeLogin');
const CreateProject = require('./WelcomeCreateProject');

const NUM_OF_SLIDES = 3;

const Styles = {
  navButtons: {
    float: 'right',
    margin: '0px 50px',
    height: '50px',
    alignSelf: 'center',
    fontSize: '200%',
    color: '#fff'
  },
  menuButtons: {
    width: '25%',
    margin: '5px'
  },
  welcomePage: {
    width: '100%',
    margin: 'auto',
    alignSelf: 'center',
    textAlign: 'center',
    color: '#fff'
  },
  welcomeFrame: {
    backgroundColor: '#2ecc71',
    height: '100%',
    display: 'flex'
  },
  bigGlyph: {
    color: '#fff',
    fontSize: '1000%'
  },
  loginBox: {
    width: '50%',
    margin: 'auto'
  },
  uploadBox: {
    width: '50%',
    margin: 'auto',
    backgroundColor: '#fff',
    borderRadius: '5px'
  }
}

class Welcome extends React.Component{

  constructor(){
    super();

    this.state = {
      index: 1
    }

    this.getPage = this.getPage.bind(this);
    this.setIndex = this.setIndex.bind(this);
  }

  setIndex(e){
    this.setState({
      index: e
    });
  }

  getPage(e){
    switch(e){
      case 1:
        return (
          <div style={Styles.welcomePage}>
            <img src="./images/TC_Icon_White.png" />
            <h1>Welcome to translationCore</h1>
            <p>We are glad that you are here. We just need to set up a few things before we can begin.</p>
          </div>
        )
        break;
      case 2:
        return(
          <div style={Styles.welcomePage}>
            <Glyphicon style={Styles.bigGlyph} glyph="user" />
            <h1>Connect a Door43 account</h1>
            <p>Connecting your Door43 account lets you save your checks online, you can create an account if you dont already have one.</p>
            <div style={Styles.loginBox}>
              <Login success={()=>{this.setState({index:this.state.index+1})}}/>
            </div>
          </div>
        )
        break;
      case 3:
        return(
          <div style={Styles.welcomePage}>
          <Glyphicon style={Styles.bigGlyph} glyph="cloud-download" />
            <h1>Load your first project</h1>
            <p>You can load in your first project from Door43 or from your hard drive.</p>
            <div style={{width: '50%', borderStyle: 'dashed', margin: 'auto', minHeight: '100px'}}>
            </div>
          </div>
        )
        break;
      case 4:
          console.log("Flow is now #<Main />");
      break;
    }
  }

  render(){
    var _this = this;
    return(
      <div style={Styles.welcomeFrame}>

        <Button
          bsStyle='link'
          onClick={
            ()=>{
              //If you are on the first slide you cant go backwards
              if(this.state.index == 1){
                return;
              } else {
                _this.setState({index:this.state.index-1})
              }
            }
          }
          style={Styles.navButtons}
        >
          <Glyphicon glyph='chevron-left' />
        </Button>

        {this.getPage(this.state.index)}

        <Button
          bsStyle='link'
          onClick={ () => {
              if(this.state.index == NUM_OF_SLIDES){
                this.props.initialize()
              } else {
                _this.setState({index: this.state.index+1})
              }
            }
          }
          style={Styles.navButtons}
        >
          <Glyphicon glyph='chevron-right' />
        </Button>

      </div>
    )
  }
}

module.exports = Welcome
