var React = require('react');
var remote = window.electron.remote;
var {dialog} = remote;
var ProgressBar = require('react-bootstrap/lib/ProgressBar');
var SwitchCheckModuleDropdown = require('../SwitchCheckModuleDropdown.js');
//var Phrase = require('../');
//var Lexical = require('../');
var style = require('./ProgressStyle.js');

var Progress = React.createClass({






render: function() {
  return(
      <div data-toggle="collapse" style={style.container}>
      <div>Phrase Check Module Progress</div>
        <ProgressBar active min={0} max={100} now={10} label="35%" style={style.bar}>
        </ProgressBar>
        <div>Lexical Check Module Progress</div>
        <ProgressBar active min={0} max={100} now={10} label="35%" style={style.bar}>
        </ProgressBar>
      </div>

  );
}

});

module.exports = Progress;
