
const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;
const Well = ReactBootstrap.Well;

class ConfirmDisplay extends React.Component{
  render(){
    return (
      <Well style={{marginBottom: "2.5px", overflowY: "scroll", minHeight: '215px'}}>
        <Well style={{background: "white"}}>{this.props.phrase}</Well>
        <label>{this.props.phraseInfo}</label>
      </Well>
    );
  }
}


module.exports = ConfirmDisplay;
