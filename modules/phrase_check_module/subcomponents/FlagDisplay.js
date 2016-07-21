
const api = window.ModuleApi;
const React = api.React;
const RB = api.ReactBootstrap;
const {Button, ButtonGroup, Glyphicon} = RB;

class FlagDisplay extends React.Component{
  render(){
    var _this = this;
    return (
      <ButtonGroup vertical={true} block>
        <Button bsStyle="success" onClick={
            function() {
              _this.props.setFlagState('checkStatus', "RETAINED")
            }
          }><Glyphicon glyph="ok" /> Retain</Button>
        <Button bsStyle="warning" onClick={
            function() {
              _this.props.setFlagState('checkStatus', "REPLACED")
            }
          }><Glyphicon glyph="random" /> Changed</Button>
        <Button bsStyle="danger" onClick={
            function() {
              _this.props.setFlagState('checkStatus', "WRONG")
            }
        }><Glyphicon glyph="remove" /> Wrong</Button>
      </ButtonGroup>
    );
  }
}

module.exports = FlagDisplay;
