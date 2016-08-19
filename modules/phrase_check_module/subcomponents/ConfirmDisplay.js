
const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;
const Well = ReactBootstrap.Well;

class ConfirmDisplay extends React.Component{
  render(){
    return (
      <Well style={{marginBottom: "2.5px", overflowY: "scroll", width: "100%", maxHeight: '195px', minHeight: '195px'}}>
        <Well style={{background: "white", margin: "2.5px", padding: "2.5px"}}>{this.props.phrase}</Well>
        <label>{this.props.phraseInfo}</label>
      </Well>
    );
  }
}


module.exports = ConfirmDisplay;
