//MenuItem.js
var Glyphicon = require('react-bootstrap/lib/Glyphicon.js');
var Well = require('react-bootstrap/lib/Well.js');
var React = require('react');
var ReactDOM = require('react-dom');

var MenuItem = React.createClass({
  getInitialState: function(){
      return {
        flagged: false,
        wrong: false,
        needSwitch: false,
        isCorrect: false,
        displayWrong: true,
        displayNeedSwitch: true,
        displayIsCorrect: true
      };
  },

  toggleFlag: function(e) { // this toggles the text as flagged or not flagged
                            // every time it is clicked
    this.setState({ // this.setState makes the state able to be changed
      flagged: !this.state.flagged
    });
  },

  toggleWrong: function(e) {
    this.setState({
      wrong: !this.state.wrong,
      displayWrong: !this.state.displayWrong
    });
  },

  toggleSwitch: function(e) {
    this.setState({
      needSwitch:!this.state.needSwitch
    });
  },
  toggleOk: function(e){
    this.setState({
      isCorrect:!this.state.isCorrect
    });
  },

  render: function() {

    var displayWrong = this.state.displayWrong;
    var displayNeedSwitch = this.state.displayNeedSwitch;
    var displayIsCorrect
    var style;
    if(this.state.flagged){
      style = {
        color:"blue",
        display:'initial' // when it is toggled it turns blue
      }
    }
    else {
      style = {
        color:"grey" // when it is not being used it dos not show itself to
        // the user
      };
    }

    var style1;
    if (this.state.wrong) {
      style1={
        color:"red",
        display:'initial'
      }
    }
    else {
      style1 = {
        display:'none'
      };
    }

    var style2;
    if (this.state.needSwitch) {
      style2={
        color:"gold",
        display:'initial'
      }
    }
    else {
      style2={
        display: 'none'
      };
    }
    var style3;
    if (this.state.isCorrect) {
      style3={
        color:"green",
        display:'initial'
      }
    }
    else{
      style3= {
       display:'none'
      };
    }

    return (
      <span>
        <Well>
          <Glyphicon
            glyph="flag"
            style={style}
            onClick={this.toggleFlag}
          />
          <span>
            <button
              onClick={this.navigateChapter}
            >
              Chapter
            </button>
          </span>

          <span>
            <button
              onClick={this.navigateVerses}
            >
              Verse
            </button>
          </span>

            <span>
              <Glyphicon
                glyph = "remove"
                style = {style1}
                display={displayWrong}
                onClick = {this.toggleWrong}
              />
            </span>

            <span>
              <Glyphicon
                glyph = "random"
                style = {style2}
                onClick={this.toggleSwitch}
              />
            </span>
            <span>
            <Glyphicon
            glyph="ok"
            style={style3}
            onClick={this.toggleOk}
            />
            </span>

        </Well>
      </span>
    );
  },

  navigateChapter:function(){
    console.log ("chapter 1")
  },
  navigateVerses:function(){
    console.log("1")
  }


});

ReactDOM.render(<MenuItem />, document.getElementById('content'));
module.exports = MenuItem;
