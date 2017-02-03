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
      pressed: false
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

  onHover(id) {
    this.setState({hovered:id})
  }

  onPress(tab) {
    switch (tab) {
      case 1:
        this.setState({ pressed: tab });
        this.props.changeView();
        break;
      case 2:
        this.setState({ pressed: tab });
        this.props.handleOpenProject();
        break;
      case 3:
        this.setState({ pressed: tab });
        this.props.handleSelectTool();
        break;
      case 4:
        this.setState({ pressed: tab });
        this.props.handleSelectReports();
        break;
      default:
        this.setState({ pressed: 0 });
        this.onHover(0)
        break;
    }
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
        height: '100%'
      },
      child: {
        width: 'auto',
        float: 'left',
        color: 'white',
        paddingLeft: 30,
        paddingRight: 30,
        width: 'auto',
        minWidth: '200px',
        border: 0,
        outline: 'none',
        backgroundColor: '#333333',
        height: '100%'
      },
      childActive: {
        width: 'auto',
        float: 'left',
        color: 'white',
        paddingLeft: 30,
        paddingRight: 30,
        width: 'auto',
        minWidth: '200px',
        border: 0,
        outline: 'none',
        backgroundColor: '#AAAAAA',
        height: '100%'
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
          <button onMouseOver={()=>this.onHover(1)} onMouseDown={() => this.onPress(1)} onMouseUp={() => this.onPress(0)} onMouseOut={() => this.onPress(0)} style={this.state.pressed != 1  && this.state.hovered != 1 ? styles.child : styles.childActive}>
            <img src="images/TC_Icon_White.png" style={{ marginRight: 5, height: 17, width: 17 }} />
            Application
          </button>
          <button onMouseOver={()=>this.onHover(2)} onMouseDown={() => this.onPress(2)} onMouseUp={() => this.onPress(0)} onMouseOut={() => this.onPress(0)} style={this.state.pressed != 2 && this.state.hovered  != 2 ? styles.child : styles.childActive}>
            <Glyphicon glyph={"folder-open"} style={{ fontSize: 15, paddingRight: 8, paddingTop: 3, }} />
            Project
          </button>
          <button  onMouseOver={()=>this.onHover(3)} onMouseDown={() => this.onPress(3)} onMouseUp={() => this.onPress(0)} onMouseOut={() => this.onPress(0)} style={this.state.pressed != 3 && this.state.hovered != 3 ? styles.child : styles.childActive}>
            <Glyphicon glyph={"wrench"} style={{ fontSize: 15, paddingTop: 3, paddingRight: 5, float: 'left' }} />
            <div style={{ float: 'left' }}>
              Tool: {this.state.currentCheckNamespace}
            </div>
          </button>
          <button  onMouseOver={()=>this.onHover(4)} onMouseDown={() => this.onPress(4)} onMouseUp={() => this.onPress(0)} onMouseOut={() => this.onPress(0)} style={this.state.pressed != 4 && this.state.hovered != 4 ? styles.child : styles.childActive}>
            <Glyphicon glyph={"list-alt"} style={{ fontSize: 15, paddingRight: 5, paddingTop: 3, }} />
            Report
          </button>
        </div>
      </div>
    );
  }
}


module.exports = StatusBar;
