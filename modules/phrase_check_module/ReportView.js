var React = require('react');

var ReportObject = {};

var PhraseReport = React.createClass({
  getInitialState: function(){
    return {
      info: reportObject
    }
  },
  render: function(){
    var report = [];
    for(let group in this.state.info){
      report.push(<h1>{group}</h1>)
      //This is very much still under construction and intentionally
      //left unfinished for the time being
    }
    return (
      <div></div>
    );
  }
});

module.exports = PhraseReport;
