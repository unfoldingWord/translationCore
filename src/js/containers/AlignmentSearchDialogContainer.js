import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { TextField } from 'material-ui';
// selectors
// actions
// components
// helpers
import { getProjectManifest } from '../selectors';
import Konami from "konami-code-js";


/**
 * Renders a dialog displaying search options.
 *
 * @class
 *
 * @property {func} translate - the localization function
 * @property {func} onClose - callback when the dialog is closed
 * @property {bool} open - controls whether the dialog is open or closed
 */
class AlignmentSearchDialogContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = { alignmentData: null, searchStr: '' };
    this._handleClose = this._handleClose.bind(this);
  }

  UNSAFE_componentWillMount() {
    if (this.props.manifest) {
      if (!this.state.alignmentData) {
      }
    } else {
      console.warn(`no current project manifest`);
    }
  }

  _handleDownload() {
    this.setState({ languages: {} });
  }

  render() {
    const { open, translate } = this.props;

    if (open && this.state.alignmentData) {
      return (
        <div>
          <TextField
            defaultValue={this.state.searchStr}
            multiLine
            rowsMax={4}
            id="search-input"
            className="ViewUrl"
            floatingLabelText={translate('projects.enter_resource_url')}
            // underlineFocusStyle={{ borderColor: 'var(--accent-color-dark)' }}
            floatingLabelStyle={{
              color: 'var(--text-color-dark)',
              opacity: '0.3',
              fontWeight: '500',
            }}
            onChange={e => setUrl(e.target.value)}
            autoFocus={true}
            style={{ width: '100%' }}
          />

        </div>
      );
    } else {
      return <div/>;
    }
  }
}

AlignmentSearchDialogContainer.propTypes = {
  translate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  manifest: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({ manifest: getProjectManifest(state) });

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(AlignmentSearchDialogContainer);
