const AlertDismissable = React.createClass({
  getInitialState() {
    return {
      title: this.props.title
      content: this.props.content
      leftButtonText:this.props.leftButtonText
      rightButtonText:this.props.rightButtonText
      alertVisible: this.props.visible
    };
  },

  render() {
    if (this.state.alertVisible) {
      return (
        <Alert bsStyle="danger" onDismiss={this.handleAlertDismiss}>
        <h4>{this.state.title}</h4>
        <p>{this.state.content}
        <Button bsStyle="danger" style={{position:'fixed', left: 15, bottom:10}}>{this.state.leftButtonText}</Button>
        <Button onClick={this.handleAlertDismiss} style={{position:'fixed', right: 15, bottom:10}}>{this.props.rightButtonText}</Button>
        </p>
        </Alert>
      );
    }
  },

  handleAlertDismiss() {
    this.setState({alertVisible: false});
  },

  handleAlertShow() {
    this.setState({alertVisible: true});
  }
});

module.exports = AlertDismissable;
