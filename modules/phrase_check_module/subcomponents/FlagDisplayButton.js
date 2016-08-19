
const api = window.ModuleApi;
const React = api.React;
const RB = api.ReactBootstrap;
const {Glyphicon} = RB;
const style = require("./Style");

class FlagDisplayButton extends React.Component{
  constructor(){
    super();
    this.state ={
      hover: false,
    }
  }

  mouseEnter(){
    this.setState({hover: true});
  }

  mouseLeave(){
    this.setState({hover: false});
  }
    render(){
      if(this.props.color == "green"){
        var linkStyle = this.state.hover ? style.hoverGreen : style.liGreen;
      }else if(this.props.color == "yellow"){
        var linkStyle = this.state.hover ? style.hoverYellow : style.liYellow;
      }else if(this.props.color == "red"){
          var linkStyle = this.state.hover ? style.hoverRed : style.liRed;
      }else{
        console.error("Invalid color prop");
      }
    return(
        <div>
          <div style={linkStyle} onClick={this.props.handleButtonClick}
              onMouseEnter={this.mouseEnter.bind(this)}
              onMouseLeave={this.mouseLeave.bind(this)}>
            <Glyphicon glyph={this.props.glyphicon}/><br />
              {this.props.value}
          </div>
        </div>
        );
      }

}

module.exports = FlagDisplayButton;
