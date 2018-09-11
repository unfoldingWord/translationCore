import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';
import { CardHeader } from 'material-ui/Card';
import Dialog from 'material-ui/Dialog';

class Alert extends Component {
  render () {
    let {
      alertText,
      alertDialogVisibility,
      alertDialogLoading,
      callback,
      callback2,
      button1,
      button2,
      buttonLink
    } = this.props.alertModalReducer;
    let {closeAlertDialog} = this.props.actions;
    const {translate} = this.props;

    const buttonActions = [
      <button
        key={1}
        label={translate('buttons.cancel_button')}
        className="btn-prime"
        disabled={alertDialogLoading}
        autoFocus
        onClick={callback
          ? () => { callback(button1 || translate('buttons.ok_button')) }
          : closeAlertDialog}
      > {this.props.alertModalReducer.button1 || translate('buttons.ok_button')}
      </button>
    ];
    if (this.props.alertModalReducer.button1 && button2) {
      const callback_ = callback2 || callback;
      buttonActions.unshift(
        <button
          label={translate('buttons.cancel_button')}
          className="btn-second"
          disabled={alertDialogLoading}
          onClick={callback_ ? () => { callback_(button2) } : closeAlertDialog}
        > {this.props.alertModalReducer.button2}
        </button>
      );
    }
    if (this.props.alertModalReducer.button1 && buttonLink) {
      buttonActions.unshift(
        <button
          label={translate('buttons.cancel_button')}
          className="btn-link"
          disabled={alertDialogLoading}
          onClick={callback ? () => { callback(buttonLink) } : closeAlertDialog}
        > {this.props.alertModalReducer.buttonLink}
        </button>
      );
    }

    const headerContent = (
      <div>
        <span>{translate('alert')}</span>
        {
          alertDialogLoading || !button2 ? null : <Glyphicon
            onClick={callback2 || closeAlertDialog}
            glyph={'remove'}
            style={{
              color: 'var(--reverse-color)',
              cursor: 'pointer',
              fontSize: '18px',
              float: 'right'
            }}
          />
        }
      </div>
    );

    return (
      <div>
        <Dialog
          style={{padding: '0px', zIndex: 2501}}
          contentStyle={{opacity: '1'}}
          actions={buttonActions}
          modal={false}
          open={alertDialogVisibility}
        >
          <CardHeader
            style={{
              color: 'var(--reverse-color)',
              backgroundColor: 'var(--accent-color-dark)',
              padding: '15px',
              margin: '-44px -24px -24px -24px'
            }}
          >
            {headerContent}
          </CardHeader><br/><br/>
          <div style={{minHeight: '80px'}}>
            <table>
              <tbody>
              <tr>
                <td>
                  <img className={alertDialogLoading ? 'App-logo' : ''}
                       src="./images/TC_Icon.png" height="100px"
                       style={{margin: '25px 20px 0px 55px'}}/>
                </td>
                <td>
                  <div style={{color: 'var(--text-color-dark)'}}>
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

Alert.propTypes = {
  translate: PropTypes.func.isRequired,
  alertModalReducer: PropTypes.object.isRequired,
  actions: PropTypes.any.isRequired
};

export default Alert;
