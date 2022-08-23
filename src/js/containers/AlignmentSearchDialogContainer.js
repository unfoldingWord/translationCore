import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import path from 'path-extra';
import { TextField } from 'material-ui';
import MaterialTable from 'material-table';
// selectors
import { getProjectManifest } from '../selectors';
// actions
// components
import BaseDialog from '../components/dialogComponents/BaseDialog';
// helpers
import { loadAlignments, multiSearchAlignments } from '../helpers/searchHelper';
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
    this.state = {
      alignmentData: null,
      searchStr: '',
      found: null,
    };
    this.setSearchStr = this.setSearchStr.bind(this);
    this.startSearch = this.startSearch.bind(this);
    this.showResults = this.showResults.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.open) {
      let update = false;
      const bookId = this.props?.manifest?.project?.id;
      const resourceId = this.props?.manifest?.resource?.id;
      const targetLanguageId = this.props?.manifest?.target_language?.id;
      const alignmentData = this.state?.alignmentData;

      if (!alignmentData) {
        update = true;
      } else {
        update = (resourceId !== alignmentData?.descriptor) ||
          (targetLanguageId !== alignmentData?.targetLang);
      }

      if (update) {
        if (bookId && resourceId && targetLanguageId) {
          this.loadAlignmentData(bookId, targetLanguageId, resourceId);
        } else {
          console.warn(`no current project manifest`);
        }
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
      this.setState({ alignmentData, found: null });
    } else {
      console.log('AlignmentSearchDialogContainer - FAILED to load alignment data');
      this.setState({ alignmentData: null, found: null });
    }
  }

  showResults() {
    if (this.state.found) {
      if (this.state.found?.length) {
        const data = this.state.found.map(item => {
          const newItem = {
            ...item,
            refStr: item.refs.join('; '),
          };
          return newItem;
        });
        return (
          <MaterialTable
            columns={[
              { title: 'Source Text', field: 'sourceText' },
              { title: 'Source Lemma', field: 'sourceLemma' },
              { title: 'Target Text', field: 'targetText' },
              { title: 'Refs', field: 'refStr' },
            ]}
            data={data}
            title="Search Results:"
          />
        );
      } else {
        return (
          <>
            <br/>
            {'No results found!'}
          </>
        );
      }
    } else {
      return (
        <>
          <br/>
          {'Need to Start Search!'}
        </>
      );
    }
  }

  setSearchStr(search) {
    this.setState({ searchStr: search });
  }

  startSearch() {
    console.log('AlignmentSearchDialogContainer - start search');
    const config = {
      fullWord: true,
      caseInsensitive: true,
      searchLemma: true,
      searchSource: true,
      searchTarget: true,
    };

    // when
    const found = multiSearchAlignments(this.state.alignmentData, this.state.searchStr, config) || [];
    console.log(`AlignmentSearchDialogContainer - finished search, found ${found.length} items`);
    this.setState({ found });
  }

  render() {
    const {
      open,
      translate,
      onClose,
    } = this.props;

    return (
      <BaseDialog
        open={open}
        primaryLabel={'Search'}
        secondaryLabel={translate('buttons.cancel_button')}
        primaryActionEnabled={this.state.alignmentData && this.state.searchStr}
        onSubmit={this.startSearch}
        onClose={onClose}
        title={'Search Alignments'}
        modal={false}
        scrollableContent={true}
        titleStyle={{ marginBottom: '0px' }}
      >
        {this.state.alignmentData &&
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
            { this.showResults()}
          </div>
        }
      </BaseDialog>
    );
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
