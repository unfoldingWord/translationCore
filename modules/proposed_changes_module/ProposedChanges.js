
const api = window.ModuleApi;
const React = api.React;
const RB = api.ReactBootstrap;
const {Glyphicon, Button, Panel, FormControl, Well} = RB;

const NAMESPACE = 'ProposedChanges';

class ProposedChanges extends React.Component {
  constructor() {
    super();
    this.state = {
      open: false,
      newWord: "",
    };
  }

  handleChange(e) {
    this.value = e.target.value;
    this.setState({newWord: this.value});
  }

  handleSubmit(event){
    console.log(this.state.newWord, this.props.selectedWord);
    api.getDataFromCheckStore(NAMESPACE)['newWord'] = this.state.newWord;
    api.getDataFromCheckStore(NAMESPACE)['previousWord'] = this.props.selectedWord;
    this.setState({ open: !this.state.open });
  }

  render() {

    return (
      <div style={{width:'100%'}}>
        <Button bsStyle="primary"
        onClick={ ()=> this.setState({ open: !this.state.open })} style={{width:'100%'}}>
          Propose Changes
        </Button>
        <Panel collapsible expanded={this.state.open} style={{backgroundColor: "#D3D3D3"}}>

          <Well style={{fontSize: "16px", color: "white", textAlign: "center", background:"#d9534f"}}>{this.props.selectedWord}
          </Well>

          <FormControl
            type="text"
            placeholder="Proposed Word"
            style={{marginBottom: "15px", marginTop: "15px"}}
            onChange={this.handleChange.bind(this)}
          />

          <Button bsStyle="success"
                  type="submit"
                  onClick={this.handleSubmit.bind(this)}
                  style={{width:'100%'}}>
                  Submit
          </Button>
        </Panel>
      </div>
    );
  }
}

module.exports = ProposedChanges;
