var React = require('react');
var remote = window.electron.remote;
var {dialog} = remote;
var ProgressBar = require('react-bootstrap/lib/ProgressBar');
var SwitchCheckModuleDropdown = require('../SwitchCheckModuleDropdown.js');
//var Phrase = require('../');
//var Lexical = require('../');
var style = require('./ProgressStyle.js');

var Progress = React.createClass({




//TODO: Lexical and Phrase do stacked

render: function() {
  return(
      <div data-toggle="collapse" style={style.container}>
      <div>Phrase Check Module Progress</div>
        <ProgressBar striped >
          <ProgressBar bsStyle="success" now={35} label="35%" style={style.bar} />
          <ProgressBar bsStyle="info" now={60} label="60%" style={style.bar} />
        </ProgressBar>
      <div>Lexical Check Module Progress</div>
        <ProgressBar striped>
          <ProgressBar bsStyle="success" now={35} label="35%" style={style.bar} />
          <ProgressBar bsStyle="info" now={20} label="20%" style={style.bar} />
          <ProgressBar bsStyle="danger" now={20} label="20%" style={style.bar} />
        </ProgressBar>
      </div>

  );
}

});

module.exports = Progress;
