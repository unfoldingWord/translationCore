import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import path from 'path-extra';
import { TextField } from 'material-ui';
// selectors
// actions
// components
// helpers
import { getProjectManifest } from '../selectors';
import { loadAlignments } from '../helpers/searchHelper';
import { getOrigLangforBook } from '../helpers/bibleHelpers';
import { ALIGNMENT_DATA_PATH } from '../common/constants';

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
    this.setSearchStr = this.setSearchStr.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.open && !this.state.alignmentData) {
      const bookId = this.props?.manifest?.project?.id;
      const resourceId = this.props?.manifest?.resource?.id;
      const targetLanguageId = this.props?.manifest?.target_language?.id;

      if (bookId && resourceId&& targetLanguageId) {
        this.loadAlignmentData(bookId, targetLanguageId, resourceId);
      } else {
        console.warn(`no current project manifest`);
      }
    }
  }

  loadAlignmentData(bookId, targetLanguageId, resourceId) {
    const originalLangId = getOrigLangforBook(bookId)?.languageId;
    const fileName = `${targetLanguageId}_${resourceId}_${originalLangId}`;
    const jsonPath = path.join(ALIGNMENT_DATA_PATH, `${fileName}.json`);
    const alignmentData = loadAlignments(jsonPath);

    if (alignmentData) {
      console.log('AlignmentSearchDialogContainer - loaded alignment data');
      this.setState({ alignmentData });
    } else {
      console.log('AlignmentSearchDialogContainer - FAILED to load alignment data');
    }
  }

  setSearchStr(search) {
    this.setState({ searchStr: search });
  }

  render() {
    const { open } = this.props;

    if (open && this.state.alignmentData) {
      return (
        <div>
          <TextField
            defaultValue={this.state.searchStr}
            multiLine
            rowsMax={4}
            id="search-input"
            className="Search"
            floatingLabelText={'Enter Search String'}
            // underlineFocusStyle={{ borderColor: 'var(--accent-color-dark)' }}
            floatingLabelStyle={{
              color: 'var(--text-color-dark)',
              opacity: '0.3',
              fontWeight: '500',
            }}
            onChange={e => this.setSearchStr(e.target.value)}
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
