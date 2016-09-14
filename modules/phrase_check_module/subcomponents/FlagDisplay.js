
const api = window.ModuleApi;
const React = api.React;
const RB = api.ReactBootstrap;
const {Glyphicon, Button, ButtonGroup} = RB;

const NAMESPACE = 'PhraseChecker';


class FlagDisplay extends React.Component{

  constructor() {
    super();
    this.state = {
      selectedOption: "",
      newCheckStatus: "",
    };
    this.setFlagStateFunction = this.setFlagStateFunction.bind(this);
    this.updateSelectedOption = this.updateSelectedOption.bind(this);
  }

  componentWillMount() {
    api.registerEventListener('goToNext', this.updateSelectedOption);
    api.registerEventListener('goToPrevious', this.updateSelectedOption);
    api.registerEventListener('changedCheckStatus', this.updateSelectedOption);
  }

  componentWillUnmount() {
    api.removeEventListener('goToNext', this.updateSelectedOption);
    api.removeEventListener('goToPrevious', this.updateSelectedOption);
    api.removeEventListener('changedCheckStatus', this.updateSelectedOption);
  }

  updateSelectedOption(){
    if (typeof this.props.val == "string") {
      this.setState({selectedOption: this.props.val});
      let currentCheck = this.props.getCurrentCheck();
      console.log(currentCheck.retained);
      if (currentCheck.retained) {
        this.setState({selectedOption: currentCheck.retained});
        //api.getDataFromCheckStore(NAMESPACE)['currentChanges'] = this.props.val;
      }
    }
  }

  setFlagStateFunction(newCheckStatus){
    this.props.updateCheckStatus(newCheckStatus);
    this.setState({newCheckStatus: newCheckStatus});
  }

  handleOptionChange(changeEvent){
    if(this.state.newCheckStatus){
      this.setState({selectedOption: changeEvent.target.value});
      let retained = changeEvent.target.value;
      this.props.updateCheckStatus(this.state.newCheckStatus, retained);
    }else{
      api.Toast.error("Unable to change selection:", "First Mark check as Correct in context or Flag for review", 4);
    }
  }

  render(){
    let currentCheck = this.props.getCurrentCheck();
    console.log(currentCheck);
    console.log(currentCheck.retained);
    var _this = this;
    console.log('You have selected:', this.state.selectedOption);
    return (
      <div>
        <ButtonGroup style={{width:'100%', paddingBottom: "2.5px"}}>
          <Button style={{width:'50%'}} bsStyle="success" onClick={function() {_this.setFlagStateFunction('CORRECT');}}>
            <Glyphicon glyph="ok" /> Correct in Context</Button>
          <Button style={{width:'50%'}} bsStyle="danger" onClick={function() {_this.setFlagStateFunction('FLAGGED');}}>
            <Glyphicon glyph="flag" /> Flag for Review</Button>
        </ButtonGroup>
        <h4>The meaning has been:</h4>
        <div className="radio-inline">
          <label>
          <input type="radio" value="Retained"
                      checked={this.state.selectedOption === 'Retained'}
                      onChange={this.handleOptionChange.bind(this)} /> Retained
          </label>
        </div>
        <div className="radio-inline">
          <label>
          <input type="radio" value="Replaced"
                      checked={this.state.selectedOption === 'Replaced'}
                      onChange={this.handleOptionChange.bind(this)} /> Replaced
          </label>
          </div>
      </div>
    );
  }
}

module.exports = FlagDisplay;
