import React from 'react';
import { Row, Col, utils } from 'react-bootstrap/lib';

const iW = {
  appWindow: {
    marginRight: "0px",
    marginLeft: "0px",
    marginBottom: "10px",
    width: "100%",
    minHeight: "120px",
    borderRadius: '0px',
    padding: '0px',
    backgroundColor: "#409EBA",
    color: "#FFFFFF",
    display: "inline-table",
    boxSizing: "border-box"
  }
};

const tN = {
  appWindow: {
    marginRight: "0px",
    marginLeft: "0px",
    marginBottom: "10px",
    width: "100%",
    minHeight: "120px",
    borderRadius: '0px',
    padding: '0px',
    backgroundColor: "#58C17A",
    color: "#FFFFFF",
    display: "inline-table",
    boxSizing: "border-box"
  }
};

const tT ={
  appWindow: {
    marginRight: "0px",
    marginLeft: "0px",
    marginBottom: "10px",
    width: "100%",
    minHeight: "120px",
    borderRadius: '0px',
    padding: '0px',
    backgroundColor: "#D71A19",
    color: "#FFFFFF",
    display: "inline-table",
    boxSizing: "border-box"
  }
};

class AppDescription extends React.Component {
  render() {
    let { title, version, description, badgeImagePath, folderName, name} = this.props.metadata;
    let Styles;
    switch (name) {
      case "translationWords":
        Styles = iW.appWindow;
        break;
      case "translationNotes":
        Styles = tN.appWindow;
        break;
      default:
        Styles = tT.appWindow;
    }
    return (
      <div>
      <Row style={Styles}>
        <Col md={8} sm={8} xs={8} style={{margin: "0px", padding: "10px"}}>
          <h4 style={{display: 'inline-block', marginRight: '15px', color: "#FFFFFF"}}>
            {title}
          </h4><span>{"Version " + version}</span><br />
          <span style={{color: "#FFFFFF", marginBottom: ""}}>{description}</span><br /><br /><br />
          <button className="btn-second" onClick={() => this.props.handleLoadTool(folderName, this.props.loggedInUser, name)}
                  title={"Click to load tool"}>
            Select
          </button>
        </Col>
        <Col md={4} sm={4} xs={4} style={{margin: "0px", padding: "0px"}}>
          <img style={{width: '100%', height: "230px"}} src={badgeImagePath} />
        </Col>
      </Row>
      </div>
    )
  }
}

export default AppDescription;
