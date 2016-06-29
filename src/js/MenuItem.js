//MenuItem.js
var Glyphicon = require('react-bootstrap/lib/Glyphicon.js');
var Well = require('react-bootstrap/lib/Well.js');
var React = require('react');
var ReactDOM = require('react-dom');

var MenuItem = React.createClass({

  getInitialState: function() {
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

  setCheckedStatus: function(status) {
    this.setState({
      checkedStatus: status
    });
  },

  render: function() {

    var checkedStatus = this.props.checkedStatus;

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
    if (checkedStatus === "WRONG") {
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
    if (checkedStatus === "REPLACED") {
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
    if (checkedStatus === "RETAINED") {
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
              onClick = {this.navigateChapter}
            >
              Chapter
            </button>
          </span>

          <span>
            <button
              onClick = {this.navigateVerses}
            >
              Verse
            </button>
          </span>

            <span>
              <Glyphicon
                glyph = "remove"
                style = {style1}
                display = {checkedStatus === "WRONG"}
                onClick = {this.toggleWrong}
              />
            </span>

            <span>
              <Glyphicon
                glyph = "random"
                style = {style2}
                display = {checkedStatus === "REPLACED"}
                onClick = {this.toggleSwitch}
              />
            </span>

            <span>
              <Glyphicon
                glyph = "ok"
                style = {style3}
                display = {checkedStatus === "RETAINED"}
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
