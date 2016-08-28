
const api = window.ModuleApi;
const React = api.React;
const CoreActions = require('../../../actions/CoreActions.js');
const RB = api.ReactBootstrap;
const { Glyphicon } = RB;
const style = require("./Style");

class SideBarButton extends React.Component {
  constructor() {
    super();
    this.state = {
      hover: false
    };
  }

  mouseEnter() {
    this.setState({ hover: true });
  }

  mouseLeave() {
    this.setState({ hover: false });
  }
  render() {
    const linkStyle = this.state.hover ? style.hover : style.li;
    const GlyphStyle = this.state.hover ? style.glyphiconHover : style.glyphicon;
    return React.createElement(
      "div",
      null,
      React.createElement(
        "li",
        { style: linkStyle, onClick: this.props.handleButtonClick,
          onMouseEnter: this.mouseEnter.bind(this),
          onMouseLeave: this.mouseLeave.bind(this) },
        React.createElement(Glyphicon, { glyph: this.props.glyphicon,
          style: GlyphStyle
        }),
        React.createElement("br", null),
        this.props.value
      )
    );
  }

}

module.exports = SideBarButton;