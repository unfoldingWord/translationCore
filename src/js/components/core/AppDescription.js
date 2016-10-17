const React = require('react');

const RB = require('react-bootstrap');
const {Button, Col} = RB;

var Styles = {
  appWindow: {
    width: "45%",
    height: "350px",
    borderRadius: '10px',
    padding: '10px',
    margin: "0px 5px 10px",
    cursor: "pointer",
    backgroundColor: "#303337",
    border: "3px solid rgba(0, 0, 0, 0.5)",
    color: "#FFFFFF",
    display: "inline-table",
    boxSizing: "border-box",
  },
}

class AppDescription extends React.Component{
  constructor(){
    super();
  }
  render(){
    return (
      <div style={Styles.appWindow} title={"Click to use " + this.props.title + " tool"}
           onClick={this.props.useApp.bind(this, this.props.folderName)}>
        <img style={{width: '60px'}} src={this.props.imagePath} />
        <h3 style={{display: 'inline-block', marginLeft:'10px'}}>{this.props.title}</h3>
        <p style={{padding: '20px'}}>{this.props.description}</p>
      </div>
    )
  }
}

module.exports = AppDescription;
