import React from 'react';
import PropTypes from 'prop-types';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Dialog from 'material-ui/Dialog';

/**
 * Generates the dialog actions
 * @param {bool} actionsEnabled enables/disables the action buttons
 * @param {*} primaryLabel the title of the primary button
 * @param {*} secondaryLabel the title of the secondary button
 * @param {func} onPrimaryClick the click callback of the primary button
 * @param {func} onSecondaryClick the click callback of the secondary button
 * @return {*}
 */
const makeDialogActions = ({actionsEnabled, primaryLabel, secondaryLabel, onPrimaryClick, onSecondaryClick}) => {
  const hasPrimaryLabel = Boolean(primaryLabel);
  const hasSecondaryLabel = Boolean(secondaryLabel);
  const hasPrimaryCallback = Boolean(onPrimaryClick);
  const hasSecondaryCallback = Boolean(onSecondaryClick);
  const actions = [];

  const primaryButton = (
    <button className="btn-prime"
            disabled={!actionsEnabled}
            onClick={onPrimaryClick}>
      {primaryLabel}
    </button>
  );
  const secondaryButton = (
    <button className="btn-second"
            disabled={!actionsEnabled}
            onClick={onSecondaryClick}>
      {secondaryLabel}
    </button>
  );

  if(hasSecondaryLabel && hasSecondaryCallback) {
    actions.push(secondaryButton);
  }

  if(hasPrimaryLabel && hasPrimaryCallback) {
    actions.push(primaryButton);
  }
  return actions;
};

/**
 * Represents a generic dialog.
 * You could use this to display simple information,
 * or you could create a new component that wraps this component
 * with some custom functionality.
 */
export default class BaseDialog extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidCatch(error, info) {
    console.error(error);
    console.warn(info);
  }

  render () {
    const {actionsEnabled, title, secondaryLabel, primaryLabel, onClose, onSubmit, open, children, actions} = this.props;

    let dialogActions = actions ? actions : makeDialogActions({
        actionsEnabled,
        primaryLabel,
        secondaryLabel,
        onPrimaryClick: onSubmit,
        onSecondaryClick: onClose
    });

    const isModal = dialogActions.length !== 0;

    return (
      <MuiThemeProvider>
        <Dialog open={open}
                modal={isModal}
                title={title}
                titleStyle={{
                  color: 'var(--reverse-color)',
                  backgroundColor: 'var(--accent-color-dark)',
                  padding: '15px',
                  marginBottom: '15px'
                }}
                onRequestClose={onClose}
                actions={dialogActions}>
          {children}
        </Dialog>
      </MuiThemeProvider>
    );
  }
}

BaseDialog.propTypes = {
  actions: PropTypes.array,
  title: PropTypes.any,
  secondaryLabel: PropTypes.any,
  primaryLabel: PropTypes.any,
  actionsEnabled: PropTypes.bool,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  children: PropTypes.any
};
BaseDialog.defaultProps = {
  actionsEnabled: true
};
