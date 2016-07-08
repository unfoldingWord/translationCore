var React = require('react');
var RB = require('react-bootstrap');
var {ProgressBar} = RB;

class Loader extends React.Component{
  render(){
    return (
      <ProgressBar
        now={this.props.progress}
        style={{verticaAlign: 'middle'}}
      />
    );
  }
}

module.exports = Loader;
