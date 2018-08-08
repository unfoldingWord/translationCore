import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
// components
import ContentUpdateDialog from '../components/dialogComponents/ContentUpdateDialog';
// actions
import {confirmOnlineAction} from '../actions/OnlineModeConfirmActions';


const resources = [
  {
    languageName: 'Tamil',
    languageId: 'ta',
    currentTimestamp: '2018-07-07T00:00:00+00:00',
    latestTimestamp: '2018-08-01T19:08:11+00:00'
  },
  {
    languageName: 'Hausa',
    languageId: 'ha',
    currentTimestamp: '2018-07-07T00:00:00+00:00',
    latestTimestamp: '2018-08-01T19:08:11+00:00'
  },
  {
    languageName: 'Kannada',
    languageId: 'kn',
    currentTimestamp: '2018-07-07T00:00:00+00:00',
    latestTimestamp: '2018-08-01T19:08:11+00:00'
  },
  {
    languageName: 'kiswahili',
    languageId: 'sw',
    currentTimestamp: '2018-07-07T00:00:00+00:00',
    latestTimestamp: '2018-08-01T19:08:11+00:00'
  },
  {
    languageName: 'vietnamese',
    languageId: 'vi',
    currentTimestamp: '2018-07-07T00:00:00+00:00',
    latestTimestamp: '2018-08-01T19:08:11+00:00'
  },
  {
    languageName: 'espanol',
    languageId: 'es',
    currentTimestamp: '2018-07-07T00:00:00+00:00',
    latestTimestamp: '2018-08-01T19:08:11+00:00'
  }
];
/**
 * Renders a dialog displaying a list of new content updates.
 *
 * @class
 *
 * @property {func} translate - the localization function
 * @property {func} onClose - callback when the dialog is closed
 * @property {bool} open - controls whether the dialog is open or closed
 */
class ContentUpdatesDialogContainer extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
    this._handleClose = this._handleClose.bind(this);
    this._startContentUpdateCheck = this._startContentUpdateCheck.bind(this);
  }

  componentWillReceiveProps(newProps) {
    const openChanged = newProps.open !== this.props.open;
    if(openChanged && newProps.open) {
      const {confirmOnlineAction} = this.props;
      confirmOnlineAction(() => {
        this._startContentUpdateCheck();
      }, ()=> {
        this._handleClose();
      });
    }
  }

  componentDidCatch(error, info) {
    console.error(error, info);
  }

  _handleClose() {
    const {onClose} = this.props;
    onClose();
  }

  _startContentUpdateCheck() {

  }

  render () {
    const {open, onClose, translate} = this.props;
    return (
      <div>
        <ContentUpdateDialog  open={open}
                              onDownload={() => {}}
                              onClose={onClose}
                              translate={translate}
                              resources={resources} />
      </div>
    );
  }
}

ContentUpdatesDialogContainer.propTypes = {
  translate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  confirmOnlineAction: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {
  confirmOnlineAction
};

export default connect(mapStateToProps, mapDispatchToProps)(ContentUpdatesDialogContainer);
