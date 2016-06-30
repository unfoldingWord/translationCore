var Row = require('react-bootstrap/lib/Row.js');
var Col = require('react-bootstrap/lib/Col.js');
var Grid = require('react-bootstrap/lib/Grid.js');
var Well = require('react-bootstrap/lib/Well.js');
var FormControl = require('react-bootstrap/lib/FormControl.js');
var Button = require('react-bootstrap/lib/Button.js');
var ButtonGroup = require('react-bootstrap/lib/ButtonGroup.js');
var Label = require('react-bootstrap/lib/Label.js');
var Glyph =  require('react-bootstrap/lib/Glyphicon.js');
var NextButton = require('../../NextButton');
var React = require('react');
var ReactDOM = require('react-dom');


var titus = {
  "Assumed Knowledge" : {
    "tit 1:1" : "a servant of God and an apostle of Jesus Christ - The phrase 'I am' is implied."
  },
  "doubleNegatives" : {
    "tit 1:6" : "An elder must be without blame - This is a double negative emphasizing moral character.",
    "tit 3:14" : "so that they may not be unfruitful - so that they will be fruitful"
  },
  "hyperbole" : {
    "tit 1:12" : "Cretans are unceasing liars - Cretans are lying all the time or Cretans never stop lying."
  },
  "synedoche" : {
    "tit 1:12" : "lazy bellies - lazy gluttons or people who do nothing but eat too much food. This figure of speech uses the image of their stomachs to describe the whole person."
  },
  "hypotheticals" : {
    "tit 2:6" : "would bring shame upon someone if he tried to oppose you - This presents a hypothetical situation where someone opposes Titus and is himself shamed as a result. It is not expressing a current event. Your language may have a way of expressing this."
  },
  "personification" : {
    "tit 2:11" : "trains us - This is a figure of speech that presents the grace of God as a person who trains and disciplines people to live holy lives."
  },
  "metaphor" : {
    "tit 2:14" : "to set us free from lawlessness - to release us from our sinful condition. This is a metaphor that compares being released from sin's control to the freedom of a slave being purchased by someone.",
    "tit 3:3" : "led astray and enslaved by various passions and pleasures - This metaphor compares the way our sinful desires control us to slavery.",
    "tit 3:6" : "poured the Holy Spirit on us - This is a metaphor resembling the anointing of priests."
  }
};

var PhraseChecker = React.createClass({
  getInitialState: function(){
    return {toCheck: "",
            ref: "",
            note: "",
            chapterData: titus,
            tlVerse: "This is selectable placeholder text. Eventually the target language text will appear here",
            selectedText: "",
            flagState: "",
            returnObject: [],
            progress:  0,
            isLoading: false}
  },

  setSelectedText: function(e){
    this.setState({selectedText: e});
  },
  setFlagState: function(e){
    this.setState({flagState: e});
  },
  setNote: function(e){
    this.setState({note: e});
  },
  setRef: function(e){
    this.setState({ref: e});
  },
  appendReturnObject: function(){
    var object = this.state.returnObject;
    object.push(
      {
        ref: this.state.ref,
        selectedText: this.state.selectedText,
        flag: this.state.flagState,
        note: this.state.note
      }
    );
    this.setState({returnObject: object});
    console.log(this.state.returnObject);
  },
  render: function(){
    return (
      <Grid>
        <Row
          className="progressBar"
          style={{
            display: this.state.isLoading ? "block" : "none"
          }}
        >
        </Row>
        <Row
          className="show-grid"
          style={{display: this.state.isLoading ? "none" : "block"}}
        >
          <Col md={12}>
            <ScriptureDisplay
              scripture={this.state.tlVerse}
              setSelectedText={this.setSelectedText}
              currentVerse={this.state.ref}
              ref="ScriptureDisplay"
            />
          </Col>
        </Row>
        <Row className="show-grid">
          <Col xs={6} md={6}className="confirm-area">
            <ConfirmDisplay
              note={this.state.note}
              toCheck={this.state.toCheck}
              selectedText={this.state.selectedText}
            />
          </Col>
          <Col xs={6} md={6}>
            <FlagDisplay
              setFlagState={this.setFlagState}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={6} md={6}className="next-button">
            <NextButton nextItem={this.appendReturnObject}/>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <TempMenu verses={this.state.chapterData}
                      setNote={this.setNote}
                      setRef={this.setRef}/>
          </Col>
        </Row>
      </Grid>
    );
  }
});

var ScriptureDisplay = React.createClass({
  getInitialState: function(){
    return {selectedPos: [],
            selectedVals: []};
  },
  getSelectedText: function(){
    var selection = window.getSelection();
    var newPos = this.state.selectedPos;
    var newVals = this.state.selectedVals;
    var startPoint = parseInt(selection.anchorNode.parentElement.attributes["data-pos"].value);
    var endPoint = parseInt(selection.focusNode.parentElement.attributes["data-pos"].value)+1;
    for(var i = startPoint; i < endPoint; i++){newPos.push(i);}
    newVals.push(selection.toString());
    this.setState({selectedPos: newPos,
                   selectedVals: newVals});
    this.returnSelection();
  },
  returnSelection: function(){
    var returnString = this.state.selectedVals.join(" ... ");
    this.props.setSelectedText(returnString);
  },
  clearSelection: function(){
    this.setState({selectedPos: [],
                   selectedVals: []});
  },
  render: function(){
    var wordArray = this.props.scripture.split(' ');
    var spannedArray = [];
    var highlightedStyle = {backgroundColor: 'yellow'};
    for(var i = 0; i < wordArray.length; i++){
      if(this.state.selectedPos.includes(i)){
        spannedArray.push(
          <span style={{backgroundColor: 'yellow'}}
                data-pos={i}
                key={i}>
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
    var verseDisplay = this.props.currentVerse.split(" ");
    return (
      <div className="ScriptureDisplay">
        <h1>{verseDisplay[0].toUpperCase()}<small>{verseDisplay[1]}</small></h1>
        <Glyph
          glyph="remove"
          style={{float: 'right'}}
          onClick={this.clearSelection}
        />
        <Well>
          <p onClick={this.getSelectedText}>{spannedArray}</p>
        </Well>
      </div>
    );
  }
});

var ConfirmDisplay = React.createClass({
  render: function(){
    return (
      <form>
        <label>{this.props.toCheck}</label>
        <label>{this.props.note}</label>
      </form>
    );
  }
});

var FlagDisplay = React.createClass({
  render: function(){
    var _this = this;
    return (
      <ButtonGroup vertical block>
        <Button bsStyle="success" onClick={
          function() {
            _this.props.setFlagState("Retained")
          }
          }>&#10003; Retain</Button>
        <Button bsStyle="warning" onClick={
          function() {
            _this.props.setFlagState("Changed")
          }
          }>&#9872; Changed</Button>
        <Button bsStyle="danger" onClick={
          function() {
            _this.props.setFlagState("Wrong")
          }
        }>&#10060; Wrong</Button>
      </ButtonGroup>
    );
  }
});

var NextButton = React.createClass({
  render: function(){
    return (
      <Button onClick={this.props.nextItem}>Next &#8594;</Button>
    );
  }
});

var TempMenu = React.createClass({
  getInitialState: function(){
    return {current: 0}
  },
  passInfo: function(k, j, i){
    this.props.setNote(k);
    this.props.setRef(j);
    this.setState({current: i});
  },
  render: function(){
    var verseList = [];
    var scripture = this.props.verses;
    var _this = this;
    let i = 0;
    for(let type in scripture){
      var verses = [];
      for(let verse in scripture[type]){
        verses.push(
          <a
            key={i++}
            num={i}
            className="verseReference"
            onClick={
              function(){
                _this.passInfo(scripture[type][verse], verse, i)
              }
            }
            >
            {verse + ", "}
          </a>
        );
      }
      verseList.push(
        <p className="listhead" key={type}>
          <span>{type + ": "}</span>
          {verses}
        </p>
      );
    }
    return (
      <div>
        {verseList}
      </div>
    );
  }
});

/* This would eventually replace the anchor tags in the TempMenu however I do
   not want to waste time writing a new component if lance is working on a be
   tter menu anyways. Placing this on hold for now.
*/
// var MenuElement = React.createClass({
//   getInitialState: function(){
//     return {type: "",
//             verse: "",
//             index: 0}
//   },
//   render: function(){
//     var i = 0;
//     var _this = this;
//     return (
//       <a
//         key={i++}
//         index={i}
//         className="verseReference"
//         onClick{
//           function(){
//             _this.props.passInfo()
//           }
//         }
//
//     );
//   }
// });

module.exports = PhraseChecker;
