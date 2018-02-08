import React from 'react';
import PropTypes from 'prop-types';
import BaseDialog from './BaseDialog';

/**
 * Displays a dialog to submit user feedback
 */
export default class FeedbackDialog extends React.Component {

  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit() {
    const {onClose} = this.props;
    // TODO: submit things

    onClose();
  }

  render () {
    const {onClose, open, translate} = this.props;

    return (
      <BaseDialog onSubmit={this.handleSubmit}
                  primaryLabel={translate('submit')}
                  secondaryLabel={translate('cancel')}
                  onClose={onClose}
                  title={translate('app_menu.user_feedback')}
                  open={open}>
        Hello world!
      </BaseDialog>
    );
  }
}

FeedbackDialog.propTypes = {
  translate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired
};
