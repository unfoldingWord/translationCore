const React = require('react');

const RB = require('react-bootstrap');
const {Glyphicon, Button} = RB;

const RootStyles = require('./RootStyle');

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
          <div>
            <h1>Welcome to translationCore</h1>
            <p>Ad minim velit Lorem anim ipsum qui deserunt deserunt.</p>
          </div>
        )
        break;
      case 2:
        return(
          <div>
            <h1>Please login to your gogs account</h1>
            <p>Cillum dolor eu ea aliquip fugiat incididunt sunt aute.</p>
          </div>
        )
        break;
      case 3:
        return(
          <div>
            <h1>load your first project</h1>
            <p>Aliquip velit duis laborum aliquip exercitation dolore consequat fugiat anim laboris ex excepteur ea deserunt voluptate ea.</p>
          </div>
        )
        break;
      case 4:
          this.props.initialize();
      break;
    }
  }


  render(){
    var _this = this;
    return(
      <div style={RootStyles.WelcomeFrame}>

        <Button onClick={()=>{_this.setState({index:this.state.index-1})}}>
          <Glyphicon glyph='chevron-left' />
        </Button>

        {this.getPage(this.state.index)}

        <Button onClick={()=>{_this.setState({index: this.state.index+1})}}>
          <Glyphicon glyph='chevron-right' />
        </Button>

      </div>
    )
  }
}

module.exports = Welcome
