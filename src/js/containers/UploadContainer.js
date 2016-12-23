/**
 * @author Ian Hoegen
 * @description: This handles all the data interactions for the Upload component
 ******************************************************************************/

const React = require('react');
const Upload = require('../components/core/Upload.js');
const UploadMethods = require('../components/core/UploadMethods.js');
var current;

class UploadParent extends React.Component {
  constructor() {
    super();
    this.state = {
      active: 1,
      show: 'link',
      link: ""
    }
    current=this;
  }
  
  changeActive(key) {
    current.setState({ active: key });
    current.props.changeActive(key);
    switch (key) {
      case 1:
        current.setState({ show: 'link' });
        break;
      case 2:
        current.setState({ show: 'file' });
        break;
      case 3:
        current.setState({ show: 'usfm' });
        break;
      case 4:
        current.setState({ show: 'd43' });
        break;
      default:
        break;
    }
  }

  checkUSFM(path){
    current.props.getUSFM(!(path == 'No file selected'));
  }

  render() {
    return (
      <Upload checkUSFM={this.checkUSFM} getLink={this.props.getLink} changeActive={this.changeActive} pressedEnter={this.props.pressedEnter} show={this.state.show} active={this.state.active} sendPath={UploadMethods.sendFilePath}/>
    )
  }
}

module.exports =  {
  Component: UploadParent,
  Methods: UploadMethods
}
