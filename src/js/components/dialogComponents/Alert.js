import React, { Component } from 'react';
import {Glyphicon} from 'react-bootstrap';
import {CardHeader} from 'material-ui/Card';
import Dialog from 'material-ui/Dialog';

class Alert extends Component {
  render() {
    let {alertText, alertDialogVisibility} = this.props.alertModalReducer;
    let {closeAlertDialog} =this.props.actions;

    const actions = [
      <button
        label="Cancel"
        className="btn-prime"
        onClick={closeAlertDialog}
      > OK
      </button>
    ];

    const headerContent = (
      <div>
        <span>{"Alert"}</span>
        <Glyphicon
          onClick={closeAlertDialog}
          glyph={"remove"}
          style={{color: "#ffffff", cursor: "pointer", fontSize: "18px", float: "right"}}
        />
       </div>
    );

    return (
      <div>
        <Dialog
          style={{padding: "0px"}}
          actions={actions}
          modal={false}
          open={alertDialogVisibility}
        >
        <CardHeader
            style={{ color: "var(--reverse-color)", backgroundColor: 'var(--accent-color-dark)', padding: '15px', margin: "-44px -24px -24px -24px"}}
            children={headerContent}
          /><br /><br />
          <div style={{minHeight: "80px"}}>
            <table>
              <tbody>
              <tr>
                <td>
                  <img src={window.__base + "images/TC_Icon.png"} height="100px" style={{margin: "25px 20px 0px 55px"}}/>
                </td>
                <td>
                  <div style={{color: "var(--text-color-dark)"}}>
                    {alertText}
                  </div>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </Dialog>
      </div>
    );
  }
}

export default Alert;
