const React = require('react');

const Dropzone = require('react-dropzone');

const remote = window.electron.remote;
const {dialog} = remote;


const style = {
                dropzone: {
                  active: {
                    border: '2px solid #727272',
                    backgroundColor: '#f5f5f5'
                  },
                  text: {
                    height: '200px',
                    paddingTop: '75px',
                    verticalAlign: 'middle',
                    width: '100%'
                  },
                  main: {
                    width: '100%',
                    color: '#212121',
                    height: '200px',
                    border: '2px dashed #727272',
                    borderRadius: '5px',
                    fontSize: '25px'
                  },
                  inner: {
                    fontSize: '15px'
                  }
                }
              }

const DragDrop = React.createClass({
  getInitialState: function() {
    this.opened = false;
    return {
      filePath: ''
    }
  },
  onDrop: function(files) {
    var _this = this;
    if (files !== undefined) {
      _this.setState({filePath: files[0].path});
      _this.props.sendFilePath(files[0].path, null, true);
    }
  },
  onClick: function() {
    var _this = this;
    if (!this.opened) {
      this.opened = true;
      dialog.showOpenDialog({
        properties: ['openDirectory']
      }, function(filename) {
        if (filename !== undefined) {
          _this.opened = false;
          _this.setState({filePath: filename[0]});
          _this.props.sendFilePath(filename[0], null, true);
        }
      });
    }
  },

  render: function() {
    return (
    <div onClick = {this.onClick} >
        <Dropzone onDrop = {this.onDrop}
        disableClick={true} multiple={false} style={style.dropzone.main}
        activeStyle={style.dropzone.active}>
            <div style={style.dropzone.text}>
              <center>
                Drag files here to upload, or click to select a file
                <span style={style.dropzone.inner}> {this.state.filePath} </span>
              </center>
            </div>
      </Dropzone>
    </div>
  );
  }

});

module.exports = DragDrop;
