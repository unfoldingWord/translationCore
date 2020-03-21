import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';
import { CardHeader } from 'material-ui/Card';
import Dialog from 'material-ui/Dialog';

export const logoData = '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';

class Alert extends Component {
  render() {
    let {
      alertText,
      alertDialogVisibility,
      alertDialogLoading,
      callback,
      callback2,
      button1,
      button2,
      buttonLink,
    } = this.props.alertModalReducer;
    let { closeAlertDialog } = this.props.actions;
    const { translate } = this.props;

    const buttonActions = [
      <button
        key={1}
        label={translate('buttons.cancel_button')}
        className="btn-prime"
        disabled={alertDialogLoading}
        autoFocus
        onClick={callback
          ? () => {
            callback(button1 || translate('buttons.ok_button'));
          }
          : closeAlertDialog}
      > {this.props.alertModalReducer.button1 || translate('buttons.ok_button')}
      </button>,
    ];

    if (this.props.alertModalReducer.button1 && button2) {
      const callback_ = callback2 || callback;

      buttonActions.unshift(
        <button
          label={translate('buttons.cancel_button')}
          className="btn-second"
          disabled={alertDialogLoading}
          onClick={callback_ ? () => {
            callback_(button2);
          } : closeAlertDialog}
        > {this.props.alertModalReducer.button2}
        </button>,
      );
    }

    if (this.props.alertModalReducer.button1 && buttonLink) {
      buttonActions.unshift(
        <button
          label={translate('buttons.cancel_button')}
          className="btn-link"
          disabled={alertDialogLoading}
          onClick={callback ? () => {
            callback(buttonLink);
          } : closeAlertDialog}
        > {this.props.alertModalReducer.buttonLink}
        </button>,
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
              float: 'right',
            }}
          />
        }
      </div>
    );

    return (
      <div>
        <Dialog
          style={{ padding: '0px', zIndex: 2501 }}
          contentStyle={{ opacity: '1' }}
          actions={buttonActions}
          modal={false}
          open={alertDialogVisibility}
        >
          <CardHeader
            style={{
              color: 'var(--reverse-color)',
              backgroundColor: 'var(--accent-color-dark)',
              padding: '15px',
              margin: '-44px -24px -24px -24px',
            }}
          >
            {headerContent}
          </CardHeader><br/><br/>
          <div style={{ minHeight: '80px' }}>
            <table>
              <tbody>
                <tr>
                  <td>
                    <img className={alertDialogLoading ? 'App-logo' : ''}
                      src={`data:image/png;base64,${logoData}`}
                      height="100px"
                      width="90px"
                      style={{ margin: '25px 20px 0px 55px' }}/>
                  </td>
                  <td>
                    <div style={{ color: 'var(--text-color-dark)' }}>
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
  actions: PropTypes.any.isRequired,
};

export default Alert;
