
const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;
const Well = ReactBootstrap.Well;
const Glyph = ReactBootstrap.Glyph;

class ScriptureDisplay extends React.Component{

  constructor(){
    super();
    this.state = {
      selectedPos: [],
      selectedVals: []
    }

    this.getSelectedText = this.getSelectedText.bind(this);
    this.clearSelection = this.clearSelection.bind(this);
    this.returnSelection = this.returnSelection.bind(this);
  }

  getSelectedText(){
    var selection = window.getSelection();
    var newPos = this.state.selectedPos;
    var newVals = this.state.selectedVals;

    var startPoint = parseInt(
      selection
      .anchorNode
      .parentElement
      .attributes["data-pos"]
      .value
    );

    var endPoint = parseInt(
      selection
      .focusNode
      .parentElement
      .attributes["data-pos"]
      .value
    )+1;

    for(var i = startPoint; i < endPoint; i++){
      newPos.push(i);
    }

    newVals.push(selection.toString());
    this.setState({
      selectedPos: newPos,
      selectedVals: newVals
    });
    this.returnSelection();
  }

  returnSelection(){
    var returnString = this.state.selectedVals.join(" ... ");
    this.props.setSelectedText(returnString);
  }

  clearSelection(){
    this.setState({
      selectedPos: [],
      selectedVals: []
    });
  }

  render(){
    var wordArray = this.props.scripture.split(' ');
    var spannedArray = [];
    var highlightedStyle = {backgroundColor: 'yellow'};
    for(var i = 0; i < wordArray.length; i++){
      if(this.state.selectedPos.includes(i)){
        spannedArray.push(
          <span style={{backgroundColor: 'yellow'}} data-pos={i} key={i}>
            {wordArray[i] + " "}
          </span>
        );
      }else{
        spannedArray.push(
          <span key={i} data-pos={i}>
            {wordArray[i] + " "}
          </span>
        );
      }
    }
    return (
      <div>
        <h3>{this.props.currentVerse}</h3>
        {/*<Glyph glyph="remove" style={{float: 'right'}} onClick={this.clearSelection}/>*/}
        <Well>
          <p onClick={this.getSelectedText}>{spannedArray}</p>
        </Well>
      </div>
    );
  }
}

module.exports = ScriptureDisplay;
