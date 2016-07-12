const React = require('react');
const RB = require('react-bootstrap');
const {Button, ButtonGroup} = RB;

class FlagDisplay extends React.Component{
  render(){
    var _this = this;
    return (
      <ButtonGroup vertical block>
        <Button bsStyle="success" onClick={
            function() {
              _this.props.setFlagState('checkStatus', "RETAINED")
            }
          }>&#10003; Retain</Button>
        <Button bsStyle="warning" onClick={
            function() {
              _this.props.setFlagState('checkStatus', "REPLACED")
            }
          }>&#9872; Changed</Button>
        <Button bsStyle="danger" onClick={
            function() {
              _this.props.setFlagState('checkStatus', "WRONG")
            }
        }>&#10060; Wrong</Button>
      </ButtonGroup>
    );
  }
}

module.exports = FlagDisplay;
