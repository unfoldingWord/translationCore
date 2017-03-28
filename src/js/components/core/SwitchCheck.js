const React = require('react');
const AppDescription = require('./AppDescription');

class SwitchCheck extends React.Component {
  render() {
    let { toolsMetadatas } = this.props;
    let buttons = [];
    if(toolsMetadatas.length == 0 ) {
      return <div style={{color: "#FFFFFF"}}>No tC default tools found.</div>;
    } else if (!this.props.projectSaveLocation || !this.props.manifest) {
      return <h3 style={{marginTop: "0px", color: 'white', textAlign: 'center', fontWeight: 'bold', padding: '55px 0'}}>Please <span onClick={this.props.showLoad} style={{cursor: 'pointer', color: '#337ab7'}}> load a project </span> before choosing a tool</h3>;
    } else {
      for (let i in toolsMetadatas) {
        const metadata = toolsMetadatas[i];
        if (metadata.name == "ToolsTester") {
          if (this.props.currentSettings.developerMode) {
            buttons.push(<AppDescription key={i} metadata={metadata} {...this.props} />);
          }
        } else {
          buttons.push(<AppDescription key={i} metadata={metadata} {...this.props} />);
        }
      }
    }
    return (
      <div style={{padding: "10px"}}>
          {buttons}
      </div>
    );
  }
}
module.exports = SwitchCheck;
