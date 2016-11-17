// SubMenuItem.js//
//api imports
const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;
const CoreStore = require('../../../stores/CoreStore.js');
const style = require('./Style');


class SubMenuItem extends React.Component {
  constructor(){
    super();
    this.state = {
    }
  }

  render() {
    return (
      <tr onClick={this.props.handleItemSelection}
          style={style.subMenuChecks}
          title="Click to select this check">
        {this.props.bookName + " " + this.props.chapter + ":" + this.props.verse}
      </tr>
    );
  }
}

module.exports = SubMenuItem;
