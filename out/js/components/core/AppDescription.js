const React = require('react');

const RB = require('react-bootstrap');
const { Button } = RB;

var Styles = {
  appWindow: {
    border: "3px solid #aaa",
    borderRadius: '10px',
    padding: '10px',
    margin: '10px'
  }
};

class AppDescription extends React.Component {
  constructor() {
    super();
  }
  render() {
    return React.createElement(
      'div',
      { style: Styles.appWindow },
      React.createElement('img', { style: { width: '60px' }, src: this.props.imagePath }),
      React.createElement(
        'h3',
        { style: { display: 'inline-block', marginLeft: '10px' } },
        this.props.title
      ),
      React.createElement(
        'p',
        { style: { padding: '20px' } },
        this.props.description
      ),
      React.createElement(
        Button,
        { onClick: this.props.useApp.bind(this, this.props.folderName) },
        'Use App'
      )
    );
  }
}

module.exports = AppDescription;