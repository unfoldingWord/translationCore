const React = require('react');


var Styles = {
  appWindow: {
    width: "100%",
    minHeight: "220px",
    borderRadius: '0px',
    padding: '10px',
    margin: "5px",
    backgroundColor: "#4BC7ED",
    color: "#FFFFFF",
    display: "inline-table",
    boxSizing: "border-box",
  },
}

class AppDescription extends React.Component{
  render(){
    return (
      <div style={Styles.appWindow} title={"Click to use " + this.props.title + " tool"}
           onClick={this.props.useApp.bind(this, this.props.folderName)}>
        <img style={{width: '60px'}} src={this.props.imagePath} />
        <h3 style={{display: 'inline-block', marginLeft:'10px', color: "#FFFFFF"}}>
          {this.props.title}
        </h3>
        <p style={{padding: '20px', color: "#FFFFFF"}}>{this.props.description}</p>
      </div>
    )
  }
}

module.exports = AppDescription;
