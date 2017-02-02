const api = window.ModuleApi;
const React = api.React;
const RB = api.ReactBootstrap;
const {Glyphicon} = RB;
const CoreStore = require('../../../stores/CoreStore.js');
const style = require("./Style");
const OnlineStatus = require("./OnlineStatus");
const Chevron = require('./Chevron');

class StatusBar extends React.Component {
  constructor() {
    super();
    this.state = {
      path: "",
      currentCheckNamespace: "",
      newToolSelected: false,
    }
    this.currentCheckNamespace = this.currentCheckNamespace.bind(this);
    this.getSwitchCheckToolEvent = this.getSwitchCheckToolEvent.bind(this);
  }

  componentWillMount() {
    api.registerEventListener('changeCheckType', this.currentCheckNamespace);
    api.registerEventListener('newToolSelected', this.getSwitchCheckToolEvent);
  }

  componentWillUnmount() {
    api.removeEventListener('changeCheckType', this.currentCheckNamespace);
    api.removeEventListener('newToolSelected', this.getSwitchCheckToolEvent);
  }

  currentCheckNamespace() {
    let bookName = "";
    let content = "";
    let manifest = ModuleApi.getDataFromCommon("tcManifest");
    if (manifest && manifest.ts_project) {
      bookName = manifest.ts_project.name;
    }
    let currentTool = CoreStore.getCurrentCheckNamespace();
    if (currentTool) {
      this.setState({ currentCheckNamespace: currentTool });
    }
    if (this.state.currentCheckNamespace !== "") {
      content = <div>
        {bookName + " "}<Glyphicon glyph={"menu-right"} />
        {" " + currentTool + " "}
      </div>;
      this.setState({ path: content });
    }
  }

  getSwitchCheckToolEvent() {
    this.setState({ path: "" });
  }

  render() {
    const styles = {
      container: {
        backgroundColor: '#333333',
        overflow: 'hidden',
        width: '100%',
        height: '30px'
      },
      inner: {
        overflow: 'hidden',
        paddingTop: 5
      },
      child: {
        width: 'auto',
        float: 'left',
        color: 'white',
        paddingLeft: 30,
        paddingRight: 30,
        width: 'auto',
        minWidth:'200px'
      },
      childRight: {
        width: 'auto',
        float: 'right',
        paddingRight: 10,
      }
    }
    return (
      <div style={styles.container}>
        <div style={styles.inner}>
          <div style={styles.childRight}>
            <OnlineStatus />
          </div>
          <div style={styles.child}>
          <img src="images/TC_Icon_White.png" style={{marginRight: 5, height:17, width:17}}/>
            Application
          </div>
          <div style={styles.child}>
          <Glyphicon glyph={"folder-open"} style={{ fontSize: 15, paddingRight: 8, paddingTop: 3, }} />
            Project
          </div>
          <div style={styles.child}>
            <Glyphicon glyph={"wrench"} style={{ fontSize: 15, paddingRight: 5, paddingTop: 3, float:'left' }} />
            <div style={{float:'left'}}>
              Tool: {this.state.currentCheckNamespace}
            </div>
          </div>
          <div style={styles.child}>
          <Glyphicon glyph={"list-alt"} style={{ fontSize: 15, paddingRight: 5, paddingTop: 3, float:'left' }} />
            Report
          </div>
        </div>
      </div>
    );
  }
}


module.exports = StatusBar;
