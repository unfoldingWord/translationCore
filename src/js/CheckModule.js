var CheckModule = React.createClass({
  render: function() {
    return (
      <div>
        <RetainedButton />
        <ReplacedButton />
        <WrongButton />
      </div>
    );
  }
});

var RetainedButton = React.createClass({
  handleClick: function() {

  },
  render: function() {
    return (
      <button onClick={this.handleClick}>Retained</button>
    );
  }
});
