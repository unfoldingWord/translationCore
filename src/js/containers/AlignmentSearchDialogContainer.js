/* eslint-disable react/display-name,object-curly-newline */
import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import path from 'path-extra';
import {
  TextField,
  SelectField,
  Checkbox,
  MenuItem,
} from 'material-ui';
import MaterialTable from 'material-table';
import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';

// selectors
import { getProjectManifest } from '../selectors';
// actions
// components
import BaseDialog from '../components/dialogComponents/BaseDialog';
// helpers
import { loadAlignments, multiSearchAlignments } from '../helpers/searchHelper';
import { getOrigLangforBook } from '../helpers/bibleHelpers';
import { ALIGNMENT_DATA_PATH } from '../common/constants';

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
};

const SEARCH_SOURCE = 'search_source';
const SEARCH_LEMMA = 'search_lemma';
const SEARCH_TARGET = 'search_target';
const SEARCH_STRONG = 'search_strong';
const SEARCH_REFS = 'search_refs';
const searchOptions = [
  SEARCH_SOURCE,
  SEARCH_LEMMA,
  SEARCH_TARGET,
  SEARCH_STRONG,
  SEARCH_REFS,
];
const searchLabels = {
  [SEARCH_SOURCE]: 'Search Source Words',
  [SEARCH_LEMMA]: 'Search Lemma Words',
  [SEARCH_TARGET]: 'Search Target Words',
  [SEARCH_STRONG]: 'Search Strongs Numbers',
  [SEARCH_REFS]: 'Search References',
};

const styles = {
  checkboxIconStyle: { fill: 'var(--accent-color-dark)' },
};

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
      searchType: [
        SEARCH_SOURCE,
        SEARCH_TARGET,
      ],
      caseSensitive: false,
      matchWholeWord: false,
      found: null,
    };
    this.setSearchStr = this.setSearchStr.bind(this);
    this.startSearch = this.startSearch.bind(this);
    this.showResults = this.showResults.bind(this);
    this.setSearchType = this.setSearchType.bind(this);
    this.setMatchWholeWord = this.setMatchWholeWord.bind(this);
    this.setCaseSensitive = this.setCaseSensitive.bind(this);
    this.isSearchItemSelected = this.isSearchItemSelected.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.open) {
      let update = false;
      const bookId = this.props?.manifest?.project?.id;
      const resourceId = this.props?.manifest?.resource?.id;
      const targetLanguageId = this.props?.manifest?.target_language?.id;
      const originalLangId = getOrigLangforBook(bookId)?.languageId;
      const alignmentData = this.state?.alignmentData;

      if (!alignmentData) {
        update = true;
      } else {
        update = (resourceId !== alignmentData?.descriptor) ||
          (targetLanguageId !== alignmentData?.targetLang) ||
          (originalLangId !== alignmentData?.origLang);
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
    if (!this.state.alignmentData) {
      return (
        <>
          <br/>
          <br/>
          <b>{'Need to Select Project!'}</b>
        </>
      );
    } else if (this.state.found) {
      if (this.state.found?.length) {
        const data = this.state.found.map(item => {
          const newItem = {
            ...item,
            refStr: item.refs.join('; '),
          };
          return newItem;
        });
        const columnStyles = {
          cellStyle: {
            fontSize: '16px',
            fontFamily: 'Ezra, Noto Sans',
          },
        };
        const originalLang = this.state.alignmentData?.origLang;
        const originalStyles = {
          cellStyle: {
            fontSize: (originalLang === 'hbo') ? '27px' : '19px',
            fontFamily: 'Ezra, Noto Sans',
          },
        };
        const localization = {
          toolbar: {
            searchTooltip: 'Filter',
            searchPlaceholder: 'Filter',
          },
        };

        return (
          <MaterialTable
            columns={[
              { title: 'Source Text', field: 'sourceText', ...originalStyles },
              { title: 'Source Lemma', field: 'sourceLemma', ...originalStyles },
              { title: 'Source Strong', field: 'strong', ...columnStyles },
              { title: 'Target Text', field: 'targetText', ...columnStyles },
              { title: 'Refs', field: 'refStr', ...columnStyles },
            ]}
            data={data}
            title={'Search Results:'}
            icons={tableIcons}
            style={{ fontSize: '16px' }}
            options={{
              actionsCellStyle: { fontSize: '16px' },
              filterCellStyle: { fontSize: '16px' },
              headerStyle: {
                fontSize: '16px',
                fontWeight: 'bold',
              },
              rowStyle: { fontSize: '16px' },
              searchFieldStyle: { fontSize: '16px' },
              paging: false,
            }}
            localization={localization}
          />
        );
      } else {
        return (
          <>
            <br/>
            <br/>
            <b>{'No results found!'}</b>
          </>
        );
      }
    } else {
      return (
        <>
          <br/>
          <br/>
          <b>{'Need to Start Search!'}</b>
        </>
      );
    }
  }

  setSearchStr(search) {
    this.setState({ searchStr: search });
  }

  setMatchWholeWord(value) {
    this.setState({ matchWholeWord: !!value });
  }

  setCaseSensitive(value) {
    this.setState({ caseSensitive: !!value });
  }

  setSearchType(event, index, values) {
    this.setState({ searchType: values });
  }

  handleClose() {
    this.setState({ alignmentData: null }); // clear data
    const onClose = this.props.onClose;
    onClose && onClose();
  }

  startSearch() {
    console.log('AlignmentSearchDialogContainer - start search');
    const state = this.state;
    const config = {
      fullWord: state.matchWholeWord,
      caseInsensitive: !state.caseSensitive,
      searchLemma: this.isSearchItemSelected(SEARCH_LEMMA),
      searchSource: this.isSearchItemSelected(SEARCH_SOURCE),
      searchTarget: this.isSearchItemSelected(SEARCH_TARGET),
      searchStrong: this.isSearchItemSelected(SEARCH_STRONG),
      searchRefs: this.isSearchItemSelected(SEARCH_REFS),
    };

    // when
    const found = multiSearchAlignments(state.alignmentData, state.searchStr, config) || [];
    console.log(`AlignmentSearchDialogContainer - finished search, found ${found.length} items`);
    this.setState({ found });
  }

  isSearchItemSelected(item) {
    return this.state.searchType && this.state.searchType.indexOf(item) >= 0;
  }

  render() {
    const {
      open,
      translate,
    } = this.props;

    const fullScreen = { maxWidth: '100%', width: '100%' };
    const partialScreen = { maxWidth: '768px', width: '75%' };
    const contentStyle = this.state.found?.length ? fullScreen : partialScreen;

    return (
      <BaseDialog
        open={open}
        primaryLabel={'Search'}
        secondaryLabel={translate('buttons.cancel_button')}
        primaryActionEnabled={!!(this.state.alignmentData && this.state.searchStr)}
        onSubmit={this.startSearch}
        onClose={this.handleClose}
        title={'Search Alignments'}
        modal={false}
        scrollableContent={true}
        titleStyle={{ marginBottom: '0px' }}
        contentStyle={contentStyle}
      >
        <div>
          {this.state.alignmentData &&
            <>
              <TextField
                defaultValue={this.state.searchStr}
                multiLine
                rowsMax={4}
                id="search-input"
                className="Filter Results"
                floatingLabelText={'Enter Search String (can use * and ?)'}
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
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex' }}>
                  <Checkbox
                    style={{ width: '0px', marginRight: -10 }}
                    checked={this.state.caseSensitive}
                    labelStyle={{
                      color: 'var(--reverse-color)',
                      opacity: '0.7',
                      fontWeight: '500',
                    }}
                    iconStyle={styles.checkboxIconStyle}
                    onCheck={(e) => {
                      this.setCaseSensitive(e.target.checked);
                    }}
                  />
                  {'Case Sensitive Search'}
                </div>
                <div style={{ display: 'flex' }}>
                  <Checkbox
                    style={{ width: '0px', marginRight: -10 }}
                    checked={this.state.matchWholeWord}
                    labelStyle={{
                      color: 'var(--reverse-color)',
                      opacity: '0.7',
                      fontWeight: '500',
                    }}
                    iconStyle={styles.checkboxIconStyle}
                    onCheck={(e) => {
                      this.setMatchWholeWord(e.target.checked);
                    }}
                  />
                  {'Match Whole Word'}
                </div>
                <SelectField
                  id={'select_search_type'}
                  hintText="Select fields to search"
                  value={this.state.searchType}
                  multiple
                  style={{ width: '300px' }}
                  onChange={this.setSearchType}
                >
                  {
                    searchOptions.map(item => (
                      <MenuItem
                        key={item}
                        insetChildren={true}
                        checked={this.isSearchItemSelected(item)}
                        value={item}
                        primaryText={searchLabels[item]}
                      />
                    ))
                  }
                </SelectField>
              </div>
            </>
          }
          { this.showResults()}
        </div>
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
