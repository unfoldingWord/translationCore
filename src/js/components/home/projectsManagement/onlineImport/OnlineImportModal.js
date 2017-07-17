import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';
import { Dialog, CardHeader } from 'material-ui';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Door43ProjectSearch from './Door43ProjectSearch';

export default class OnlineImportModal extends Component {
  render() {
    let {
      importOnlineReducer: {
        importLink
      },
      loginReducer: {
        userdata
      },
      homeScreenReducer: {
        onlineImportModalVisibility
      },
      actions: {
        closeOnlineImportModal
      }
    } = this.props;

    const buttonActions = [
      <button
        key={1}
        label="Cancel"
        className="btn-second"
        // disabled={}
        onClick={closeOnlineImportModal}
      >
        Cancel
      </button>,
      <button
        key={2}
        label="Import"
        className="btn-prime"
        // disabled={}
        onClick={() => { console.log("Import button") }}
      >
       <Glyphicon glyph={"cloud-download"} style={{}} />&nbsp;Import
      </button>
    ];

    const headerContent = (
      <div>
        <span>{"Import From Door43"}</span>
          <Glyphicon
            onClick={closeOnlineImportModal}
            glyph={"remove"}
            style={{color: "var(--reverse-color)", cursor: "pointer", fontSize: "18px", float: "right"}}
          />
       </div>
    );

    return (
      <MuiThemeProvider>
        <Dialog
          style={{ padding: "0px" }}
          actions={buttonActions}
          modal={true}
          // bodyStyle={{ height: "550px" }}
          open={onlineImportModalVisibility}
        >
          <CardHeader
            style={{ color: "var(--reverse-color)", backgroundColor: 'var(--accent-color-dark)', padding: '15px', margin: "-44px -24px -24px -24px"}}
          >
            {headerContent}
          </CardHeader><br />
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "20px 20px 0px" }}>
            <p syle={{ width: "70%"}}>
              In this version of translationCore, only New Testament projects can be loaded.
            </p>
          </div>
          <Door43ProjectSearch
            actions={this.props.actions}
            importLink={importLink}
            username={userdata.username}
          />
        </Dialog>
      </MuiThemeProvider>
    );
  }
}

OnlineImportModal.propTypes = {
  importOnlineReducer: PropTypes.object.isRequired,
  homeScreenReducer: PropTypes.object.isRequired,
  loginReducer: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
}
