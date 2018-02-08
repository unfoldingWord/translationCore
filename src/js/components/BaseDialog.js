import React from 'react';
import PropTypes from 'prop-types';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Dialog from 'material-ui/Dialog';

/**
 * Generates the dialog actions
 * @param {*} primaryLabel the title of the primary button
 * @param {*} secondaryLabel the title of the secondary button
 * @param {func} onPrimaryClick the click callback of the primary button
 * @param {func} onSecondaryClick the click callback of the secondary button
 * @return {*}
 */
const makeDialogActions = ({primaryLabel, secondaryLabel, onPrimaryClick, onSecondaryClick}) => {
  const hasPrimaryLabel = Boolean(primaryLabel);
  const hasSecondaryLabel = Boolean(secondaryLabel);
  const hasPrimaryCallback = Boolean(onPrimaryClick);
  const hasSecondaryCallback = Boolean(onSecondaryClick);
  const actions = [];

  const primaryButton = (
    <button className="btn-prime"
            onClick={onPrimaryClick}>
      {primaryLabel}
    </button>
  );
  const secondaryButton = (
    <button className="btn-second"
            onClick={onSecondaryClick}>
      {secondaryLabel}
    </button>
  );

  if(hasSecondaryLabel && hasSecondaryCallback) {
    actions.push(secondaryButton);
  } else if(hasSecondaryLabel || hasSecondaryCallback) {
    console.warn('Not rendering secondary controller. Label and callback required.', new Error().stack);
  }

  if(hasPrimaryLabel && hasPrimaryCallback) {
    actions.push(primaryButton);
  } else if(hasPrimaryLabel || hasPrimaryCallback) {
    console.warn('Not rendering primary controller. Label and callback required', new Error().stack);
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
    const {title, secondaryLabel, primaryLabel, onClose, onSubmit, open, children, actions} = this.props;
    const hasControls = Boolean(secondaryLabel) || Boolean(primaryLabel);

    let dialogActions = actions ? actions : makeDialogActions({
        primaryLabel,
        secondaryLabel,
        onPrimaryClick: onSubmit,
        onSecondaryClick: onClose
    });

    return (
      <MuiThemeProvider>
        <Dialog open={open}
                modal={hasControls}
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
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  children: PropTypes.any
};
