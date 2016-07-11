const React = require('react');
const Well = require('react-bootstrap/lib/Well.js');
const Glyph = require('react-bootstrap/lib/Glyphicon.js');

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
    var verseDisplay = this.props.currentVerse.toString().split(" ");
    return (
      <div className="ScriptureDisplay">
        <h1>{verseDisplay[0].toUpperCase()}<small>{verseDisplay[1]}</small></h1>
        <Glyph glyph="remove" style={{float: 'right'}} onClick={this.clearSelection}/>
        <Well>
          <p onClick={this.getSelectedText}>{spannedArray}</p>
        </Well>
      </div>
    );
  }
}

module.exports = ScriptureDisplay;
