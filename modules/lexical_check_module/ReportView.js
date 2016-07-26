var React = require('react');

var ReportObject = {};

// var LexicalReport = React.createClass({
//   getInitialState: function(){
//     return {
//     }
//   },
//   render: function(){
//     return (<div></div>);
//   }
// });

//module.exports = LexicalReport;
module.exports = function(chap, verse) {
  return (<div>{`Lexical check for ${chap}-${verse}`}</div>);
}
