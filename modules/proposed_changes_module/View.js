
const api = window.ModuleApi;
const React = api.React;
const RB = api.ReactBootstrap;
const {Glyphicon, Button, Panel, FormControl, Well} = RB;

const NAMESPACE = 'ProposedChanges';

class ProposedChanges extends React.Component {
  constructor() {
    super();
    this.state = {
      newWord: "",
      currentWord: ""
    };
  }

  componentWillMount() {
    if (this.props.val) {
      this.setState({newWord: this.props.val});
      api.getDataFromCheckStore(NAMESPACE)['newWord'] = this.props.val;
    }
  }

  handleChange(e) {
    this.value = e.target.value;
    this.setState({newWord: this.value});
    api.getDataFromCheckStore(NAMESPACE)['newWord'] = this.value;
    api.getDataFromCheckStore(NAMESPACE)['previousWord'] = this.props.selectedWord;
  }

  // these next two functions will be used through a ref
  getProposedChanges() {
    return api.getDataFromCheckStore(NAMESPACE, 'newWord');
  }

  setNewWord(newWord) {
    this.setState({newWord: newWord});
    api.getDataFromCheckStore(NAMESPACE)['newWord'] = newWord;
  }

  update(newCurrentWord) {
    var newWord = "";
    for (var i = 0; i < newCurrentWord.length; i++){
      var word = newCurrentWord[i];
      newWord += word;
      if (i < newCurrentWord.length - 1) {
        newWord += ', ';
      }
    }
    this.setState({currentWord: newWord});
  }

  render() {
    var words = this.props.selectedWord;
    var wordArray = [];
    var wordKey = 0;
    if (words) {
      for (var i = 0; i < words.length; i++) {
        var word = words[i];
        wordArray.push(<span key={wordKey++}>{word}</span>);
        if (i < words.length - 1) {
          wordArray.push(<span key={wordKey++}>{', '}</span>);
        }
      }
    }
    var currentWordPhrase;
    if(this.state.currentWord == ""){
      currentWordPhrase = "Word/Phrase selected";
    }else{
      currentWordPhrase = this.state.currentWord;
    }
    return (
      <Well style={{width:"100%", padding: "10px", marginTop: "2.5px", marginBottom: "2.5px", display: "inline-block"}}>
        <center>
          <span style={{fontSize: "24px", color: "#000", fontFamily: "Helvetica", marginBottom: "5px"}}>
            Propose Changes
          </span>
        </center>
        <Well style={{fontSize: "16px", color: "white", background:"#d9534f", padding: "5px", marginBottom: "10px"}}>{currentWordPhrase}
          </Well>
        <FormControl
            type="text"
            placeholder="Proposed Word/Pharse"
            value={this.state.newWord}
            style={{marginBottom: "0px", marginTop: "0px",fontSize: "16px" }}
            onChange={this.handleChange.bind(this)}
        />
      </Well>
    );
  }
}

module.exports = {view: ProposedChanges, name: NAMESPACE};
