import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
// components
import ContentUpdateDialog from '../components/dialogComponents/ContentUpdateDialog';


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
    this._handleClose = this._handleClose.bind(this);
    this.state = {};
  }

  _handleClose() {
    const {onClose} = this.props;
    onClose();
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
};

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {

};

export default connect(mapStateToProps, mapDispatchToProps)(ContentUpdatesDialogContainer);
