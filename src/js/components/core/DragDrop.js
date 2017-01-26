const React = require('react');

const Dropzone = require('react-dropzone');

const remote = require('electron').remote;
const {dialog} = remote;

const style = {
  div: {
    paddingTop: '15%',
    width: '60%',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  dropzone: {
    active: {
      border: '2px solid #0277BD',
      backgroundColor: '#747474'
    },
    main: {
      width: '100%',
      color: '#FFFFFF',
      height: '200px',
      border: '2px dashed #0277BD',
      borderRadius: '10px',
      fontStyle: 'italic',
      padding: "5px",
    },
    inner: {
      fontSize: '15px'
    },
    welcome: {
      width: '100%',
      color: '#212121',
      height: '200px',
      borderRadius: '5px',
      fontSize: '25px'
    }
  }
};

class DragDrop extends React.Component{
  constructor() {
    super();
  }

  componentWillMount() {
    if(this.props.isWelcome){
      this.mainStyle = style.dropzone.welcome;
    } else {
      this.mainStyle = style.dropzone.main;
    }
  }

  onDrop(files) {
    if (files !== undefined) {
      // FileImport(files[0].path);
      this.props.sendFilePath(files[0].path);
    }
  }

  onClick() {
    if (!this.opened) {
      this.opened = true;
      var _this = this;
      dialog.showOpenDialog({
        properties: this.props.properties
      }, function(filename) {
        if (filename !== undefined) {
          _this.props.sendFilePath(filename[0]);
        }
        _this.opened = false;
      });
    }
  }

  render() {
    return (
    <div style={style.div} onClick = {this.onClick.bind(this)} >
        <Dropzone onDrop = {this.onDrop.bind(this)}
        disableClick={true} multiple={false} style={this.mainStyle}
        activeStyle={style.dropzone.active}>
            <div style={this.props.styles}>
              <center>
                <h4 style={{marginTop: '60px'}}>Drag files here to upload, or click to select a file</h4>
                <h4>(local projects, USFM projects, etc)</h4>
                <span style={style.dropzone.inner}> {this.props.filePath} </span>
              </center>
            </div>
      </Dropzone>
    </div>
  );
  }
}

module.exports = DragDrop;
