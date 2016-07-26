const React = require('react');

const RB = require('react-bootstrap');
const {Glyphicon} = RB;

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
    }
  }

  goToApp(){
    return(
      <p>Now youre in the app</p>
    )
  }

  render(){
    var localIndex = 1;
    var _this = this;
    return(
      <div>
      <Glyphicon glyph='chevron-left' onClick={() => {_this.setIndex(localIndex--)}} />
      {this.getPage(localIndex)}
      <Glyphicon glyph='chevron-right' onClick={() => {_this.setIndex(localIndex++)}} />
      </div>
    )
  }
}

module.exports = Welcome
