const React = require('react');

class ConfirmDisplay extends React.Component{
  render(){
    return (
      <form>
        <label>{this.props.phrase}</label>
        <br />
        <label>{this.props.phraseInfo}</label>
      </form>
    );
  }
}


module.exports = ConfirmDisplay;
