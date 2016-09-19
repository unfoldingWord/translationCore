
const api = window.ModuleApi;
var React = api.React;
var RB = api.ReactBootstrap;
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
