var React = require('react');
var ReactDOM = require('react-dom');
var HTMLScraper = require('../HTMLScraper.js');

var Row = require('react-bootstrap/lib/Row.js');
var Col = require('react-bootstrap/lib/Col.js');
var Grid = require('react-bootstrap/lib/Grid.js');
var Well = require('react-bootstrap/lib/Well.js');
var FormControl = require('react-bootstrap/lib/FormControl.js');
var Button = require('react-bootstrap/lib/Button.js');
var ButtonGroup = require('react-bootstrap/lib/ButtonGroup.js');
var Label = require('react-bootstrap/lib/Label.js');
var Glyph =  require('react-bootstrap/lib/Glyphicon.js');
var NextButton = require('../NextButton')

var PhraseChecker = React.createClass({
  getInitialState: function(){
    return {toCheck: "to establish the faith",
            ref: "tit 1 1",
            note: "AT: 'I work to establish the faith' or 'I work to build up the faith.'",
            tlVerse: "神 的 僕 人 ， 耶 穌 基 督 的 使 徒 保 羅 ， 憑 著 神 選 民 的 信 心 與 敬 虔 真 理 的 知 識 ，",
            selectedText: "",
            flagState: "",
            returnObject: []}
  },
  setSelectedText: function(e){
    this.setState({selectedText: e});
  },
  setFlagState: function(e){
    this.setState({flagState: e});
  },
  appendReturnObject: function(){
    var object = this.state.returnObject;
    object.push(
      {
        ref: this.state.ref,
        selectedText: this.state.selectedText,
        flag: this.state.flagState
      }
    );
    this.setState({returnObject: object});
    console.log(this.state.returnObject);
  },
  getTN: function(){
    var html = new HTMLScraper();
    var book;
    html.downloadEntireBook('tit',
                            function(dbook,tbook){
                              //console.log(dbook/tbook*100 + "%");
                            },
                            function(){
                              book = html.getBook('tit');
                              //console.dir(book);
                            }
                          );
  },
  componentWillMount: function(){
    this.getTN();
  },
  render: function(){
    return (
      <Grid>
        <Row >
          <Col xs={8} md={8}>
            <ScriptureDisplay
              scripture={this.state.tlVerse}
              setSelectedText={this.setSelectedText}
            />
          </Col>
        </Row>
        <Row >
          <Col xs={4} md={4} className="confirm-area">
            <ConfirmDisplay
              note={this.state.note}
              toCheck={this.state.toCheck}
              selectedText={this.state.selectedText}
            />
          </Col>
          <Col xs={4} md={4}>
            <FlagDisplay
              setFlagState={this.setFlagState}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={4} md={4} className="next-button">
            <NextButton nextItem={this.appendReturnObject}/>
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
            {wordArray[i]}
          </span>
        );
      }else{
        spannedArray.push(
          <span key={i} data-pos={i}>
            {wordArray[i]}
          </span>
        );
      }
    }
    return (
      <div className="ScriptureDisplay">
        <h1>TITUS<small>1:1</small></h1>
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
module.exports = PhraseChecker;
