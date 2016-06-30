//MenuItem.js
var Glyphicon = require('react-bootstrap/lib/Glyphicon.js');
var Well = require('react-bootstrap/lib/Well.js');
var React = require('react');
var ReactDOM = require('react-dom');

var MenuItem = React.createClass({

  getInitialState: function() { // sets initial state of flagged as false color grey until user clicks it them it becomes true and looks blue
    return {
      flagged: false
    };
  },

  toggleFlag: function(e) { // this toggles the text as flagged or not flagged
                            // every time it is clicked
    this.setState({ // this.setState makes the state able to be changed
      flagged: !this.state.flagged
    });
  },
  render: function() {
    var checkedStatus = this.props.checkedStatus; // getting check status as a prop and putting it in variable checkedStatus

    var style;
    if(this.state.flagged){
      style = {
        color:"blue",
        display:'initial' // when it is toggled it turns blue
      };
    }
    else {
      style = {
        color:"grey" // when it is not being used it dos not show itself to
        // the user
      };
    }

    var style1;
    if (checkedStatus === "WRONG") { // if  checkedStatus equas wrong red X glypghicon appears
      style1 = {
        color:"red",
        display:'initial'
      };
    }
    else {
      style1 = {
        display:'none'
      };
    }

    var style2;
    if (checkedStatus === "REPLACED") { // gold glyphicon appears
      style2 = {
        color:"gold",
        display:'initial'
      };
    }
    else {
      style2 = {
        display: 'none'
      };
    }

    var style3;
    if (checkedStatus === "RETAINED") { // green check glyphicon appears
      style3 = {
        color:"green",
        display:'initial'
      }
    }
    else{
      style3 = {
       display:'none'
      };
    }

    return (
      <span>
        <Well>
          <Glyphicon
            glyph = "flag"
            style = {style}
            onClick = {this.toggleFlag}
          />
          <span>
            <button
              onClick = {this.navigateChapter} // makes a chapter button
            >
              Chapter
            </button>
          </span>

          <span>
            <button
              onClick = {this.navigateVerses} // makes a verse button
            >
              Verse
            </button>
          </span>

            <span>
              <Glyphicon
                glyph = "remove"
                style = {style1}
                onClick = {this.toggleWrong}
              />
            </span>

            <span>
              <Glyphicon
                glyph = "random"
                style = {style2}
                onClick = {this.toggleSwitch}
              />
            </span>

            <span>
              <Glyphicon
                glyph = "ok"
                style = {style3}
                onClick = {this.toggleOk}
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

module.exports = MenuItem;
