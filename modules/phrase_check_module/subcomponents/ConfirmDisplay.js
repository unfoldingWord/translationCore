
const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;

class ConfirmDisplay extends React.Component{
  render(){
    return (
      <div style={{padding: '9px', marginTop: "1px", marginBottom: "2.5px", overflowY: "scroll", width: "100%", maxHeight: "128px", minHeight: "128px"}}>
        <span style={{marginTop: "0px", backgroundColor: "yellow"}}><strong>{this.props.phrase}</strong></span>
        <br /><span>{this.props.phraseInfo}</span>
      </div>
    );
  }
}


module.exports = ConfirmDisplay;
