const React = require('react');
const AppDescription = require('./AppDescription');

class SwitchCheck extends React.Component{
  render() {
    /*temp if condition: the following lines from line 7 to line 16
    is temp fix for now until we fully implement redux or change how
    the the recent projects componet calls switchCheck.js since the
    props name change for my new implementation */
    let toolsMetadatas;
    if(this.props.moduleMetadatas){
      toolsMetadatas = this.props.moduleMetadatas;
    }else{
      toolsMetadatas = this.props.toolsMetadatas;
    }
    //let { toolsMetadatas } = this.props;
    let buttons = [];
    if(toolsMetadatas.length == 0 ) {
      return <div style={{color: "#FFFFFF"}}>No tC default tools found.</div>;
    } else if (!api.getDataFromCommon('saveLocation') || !api.getDataFromCommon('tcManifest')) {
      return <h3 style={{color: 'white', textAlign: 'center', fontWeight: 'bold', padding: '55px 0'}}>Please <span onClick={this.props.showLoad} style={{cursor: 'pointer', color: '#337ab7'}}> load a project </span> before choosing a tool</h3>;
    } else {
      for (let i in toolsMetadatas) {
        const metadata = toolsMetadatas[i];
        buttons.push(<AppDescription key={i}
                                     metadata={metadata}
                                     {...this.props}
                     />)
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
