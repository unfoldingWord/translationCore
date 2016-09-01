
const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;
const Well = ReactBootstrap.Well;

class ConfirmDisplay extends React.Component{
  render(){
    return (
      <Well style={{paddingTop: "0px", marginTop: "1px", marginBottom: "2.5px", overflowY: "scroll", width: "100%", maxHeight: "128px", minHeight: "128px"}}>
        <h4 style={{marginTop: "0px", backgroundColor: "yellow"}}>{this.props.phrase}</h4>
        <span>{this.props.phraseInfo}</span>
      </Well>
    );
  }
}


module.exports = ConfirmDisplay;
