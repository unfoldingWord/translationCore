import React, { Component } from 'react';
import {Glyphicon} from 'react-bootstrap';
import {CardHeader} from 'material-ui/Card';
import Dialog from 'material-ui/Dialog';

class Alert extends Component {
  render() {
    let {alertText, alertDialogVisibility, alertDialogLoading, callback, button1, button2} = this.props.alertModalReducer;
    let {closeAlertDialog} =this.props.actions;

    const actions = [
      <button
        label="Cancel"
        className="btn-prime"
        disabled={alertDialogLoading}
        onClick={callback ? () => { callback(button1 || "OK"); } : closeAlertDialog}
      > {this.props.alertModalReducer.button1 || "OK"}
      </button>
    ];
    if (this.props.alertModalReducer.button1) {
      actions.unshift(
        <button
        label="Cancel"
        className="btn-second"
        disabled={alertDialogLoading}
        onClick={callback ? () => { callback(button2); } : closeAlertDialog}
      > {this.props.alertModalReducer.button2}
      </button>
      );
    }

    const headerContent = (
      <div>
        <span>{"Alert"}</span>
          {alertDialogLoading ? null :
              <Glyphicon
                  onClick={closeAlertDialog}
                  glyph={"remove"}
                  style={{color: "var(--reverse-color)", cursor: "pointer", fontSize: "18px", float: "right"}}
              />}
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
                  <img className={alertDialogLoading ? "App-logo" : ""} src={window.__base + "images/TC_Icon.png"} height="100px" style={{margin: "25px 20px 0px 55px"}}/>
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
