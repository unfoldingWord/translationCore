
var OriginalLanguage = React.createClass({
 render: function() {

 }

});

var GatewayLanguage = React.createClass({
  render: function() {

  }
});
var TargetLanguage = React.createClass({
  render: function() {

  }
});
var TPane = React.createClass({

  render: function() {
    <OriginalLanguage />
    <GatewayLanguage />
    <TargetLanguage />
  }
});

ReactDOM.render(<TPane />, document.getElementById('content'));
