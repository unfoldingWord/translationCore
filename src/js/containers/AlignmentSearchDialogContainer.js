/* eslint-disable react/display-name,object-curly-newline */
import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import path from 'path-extra';
import {
  Divider,
  Menu,
  MenuItem,
  SelectField,
  Subheader,
  TextField,
} from 'material-ui';
import MaterialTable from 'material-table';
import env from 'tc-electron-env';
import _ from 'lodash';
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
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';

import usfm from 'usfm-js';

// selectors
import { getProjectManifest, getSetting } from '../selectors';
// actions
// components
import BaseDialog from '../components/dialogComponents/BaseDialog';
// helpers
import {
  addTwordsInfoToResource,
  ALIGNMENTS_KEY,
  getAlignmentsFromResource,
  getAvailableBibles,
  getKeyForBible,
  getSearchableAlignments,
  getTwordsIndex,
  getTwordsKey,
  getVerseForKey,
  highlightSelectedTextInVerse,
  indexTwords,
  loadAlignments,
  multiSearchAlignments,
  NT_BOOKS,
  OT_BOOKS,
  parseResourceKey,
  readDirectory,
  saveTwordsIndex,
} from '../helpers/alignmentSearchHelpers';
import { ALIGNMENT_DATA_PATH, USER_RESOURCES_PATH } from '../common/constants';
import { delay } from '../common/utils';
import {
  closeAlertDialog,
  openAlertDialog,
  openOptionDialog,
} from '../actions/AlertModalActions';
import { setSetting } from '../actions/SettingsActions';
import {
  BIBLE_BOOKS,
  BIBLES_ABBRV_INDEX,
  NT_ORIG_LANG,
} from '../common/BooksOfTheBible';
import { showPopover } from '../actions/PopoverActions';

Menu.defaultProps.disableAutoFocus = true; // to prevent auto-scrolling

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
const searchFieldOptions = [
  SEARCH_SOURCE,
  SEARCH_LEMMA,
  SEARCH_TARGET,
  SEARCH_STRONG,
  SEARCH_REFS,
];
const searchFieldOptionsForTwords = [
  SEARCH_SOURCE,
  SEARCH_STRONG,
  SEARCH_TARGET,
];
const searchFieldLabels = {
  [SEARCH_SOURCE]: 'Search Source Words',
  [SEARCH_LEMMA]: 'Search Lemma Words',
  [SEARCH_TARGET]: 'Search Target Words',
  [SEARCH_STRONG]: 'Search Strong\'s Numbers',
  [SEARCH_REFS]: 'Search References',
};

// Results column options
const SHOW_SOURCE_TEXT = 'sourceText';
const SHOW_SOURCE_LEMMA = 'sourceLemma';
const SHOW_STRONGS = 'strong';
const SHOW_MORPH = 'morph';
const SHOW_TARGET_TEXT = 'targetText';
const SHOW_MATCH_COUNT = 'count';
const SHOW_REFERENCES = 'refStr';

const SOURCE_TEXT_LABEL = 'Source Text Column';
const SOURCE_LEMMA_LABEL = 'Source Lemma Column';
const STRONGS_LABEL = 'Source Strong\'s Column';
const SOURCE_MORPH_LABEL = 'Source Morph Column';
const TARGET_TEXT_LABEL = 'Target Text Column';
const MATCH_COUNT_LABEL = 'Match Count Column';
const REFERENCES_LABEL = 'References Column';

const SEARCH_CASE_SENSITIVE = 'search_case_sensitive';
const SEARCH_MATCH_WHOLE_WORD = 'search_match_whole_word';
const SEARCH_HIDE_USFM = 'search_hide_usfm';
const SEARCH_TWORDS = 'search_twords';

const SEARCH_CASE_SENSITIVE_LABEL = 'Case Sensitive';
const SEARCH_MATCH_WHOLE_WORD_LABEL = 'Match Whole Word';
const SEARCH_HIDE_USFM_LABEL = 'Hide USFM Markers';
const SEARCH_TWORDS_LABEL = 'Search Translation Words';

const searchOptions = [
  {
    key: SEARCH_CASE_SENSITIVE,
    label: SEARCH_CASE_SENSITIVE_LABEL,
    stateKey: 'caseSensitive',
  },
  {
    key: SEARCH_MATCH_WHOLE_WORD,
    label: SEARCH_MATCH_WHOLE_WORD_LABEL,
    stateKey: 'matchWholeWord',
  },
  {
    key: SEARCH_TWORDS,
    label: SEARCH_TWORDS_LABEL,
    stateKey: 'searchTwords',
  },
  {
    key: SEARCH_HIDE_USFM,
    label: SEARCH_HIDE_USFM_LABEL,
    stateKey: 'hideUsfmMarkers',
  },
];

const SEARCH_SETTINGS_KEY = 'searchSettingsKey';

const getShowTitle = label => `Show ${label}`;
const showMenuItems = [
  {
    key: SHOW_SOURCE_TEXT,
    label: getShowTitle(SOURCE_TEXT_LABEL),
  },
  {
    key: SHOW_MORPH,
    label: getShowTitle(SOURCE_MORPH_LABEL),
  },
  {
    key: SHOW_SOURCE_LEMMA,
    label: getShowTitle(SOURCE_LEMMA_LABEL),
  },
  {
    key: SHOW_STRONGS,
    label: getShowTitle(STRONGS_LABEL),
  },
  {
    key: SHOW_TARGET_TEXT,
    label: getShowTitle(TARGET_TEXT_LABEL),
  },
  {
    key: SHOW_MATCH_COUNT,
    label: getShowTitle(MATCH_COUNT_LABEL),
  },
  {
    key: SHOW_REFERENCES,
    label: getShowTitle(REFERENCES_LABEL),
  },
];

let bibles = {};
let popupLocation = null;

/**
 * Renders a dialog for user to do alignment search.
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
      alignedBibles: [],
      alignedBible: null,
      hide: {},
    };
    this.setSearchStr = this.setSearchStr.bind(this);
    this.startSearch = this.startSearch.bind(this);
    this.showResults = this.showResults.bind(this);
    this.setSearchFields = this.setSearchFields.bind(this);
    this.isSearchFieldSelected = this.isSearchFieldSelected.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.setSearchTypes = this.setSearchTypes.bind(this);
    this.getSelectedOptions = this.getSelectedOptions.bind(this);
    this.setSearchAlignedBible = this.setSearchAlignedBible.bind(this);
    this.showMessage = this.showMessage.bind(this);
    this.showColumnHidesMenu = this.showColumnHidesMenu.bind(this);
    this.selectColumnHides = this.selectColumnHides.bind(this);
    this.toggleBook = this.toggleBook.bind(this);
    this.setAll = this.setAll.bind(this);
    this.addBible = this.addBible.bind(this);
    this.getVerseContent = this.getVerseContent.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.open) {
      if (!prevProps.open) { // when dialog is opened
        const savedState = this.props.savedSettings;

        if (savedState && Object.keys(savedState).length) {
          const newState = _.cloneDeep(savedState);

          if (!newState.hide) {
            newState.hide = {};
          }

          newState.found = null;
          this.setState(newState);
        }

        delay(100).then(() => {
          this.loadAlignmentSearchOptions();
        });
      }
    } else {
      if (prevProps.open) { // if dialog closed
        this.props.saveSettings(_.cloneDeep(this.state));
      }
    }
  }

  /**
   * update message and delay for screen to update
   * @param message
   * @param loading
   * @returns {Promise<void>}
   */
  async showMessage(message, loading) {
    this.props.openAlertDialog(message, loading);
    await delay(100);
  }

  /**
   * index downloaded bible resources to get available aligned bibles
   */
  loadAlignmentSearchOptions() {
    console.log('loadAlignmentSearchOptions() - starting');
    this.showMessage('Loading Available Aligned Bibles', true).then(() => {
      const tCorePath = path.join(env.home(), 'translationCore');
      const alignedBibles = getSearchableAlignments(tCorePath);
      console.log(`loadAlignmentSearchOptions() - found ${alignedBibles?.length} aligned bible testaments`);

      for (const bible of alignedBibles) {
        const key = getKeyForBible(bible, ALIGNMENTS_KEY);
        const label = this.getLabelForBible(bible);
        bible.key = key;
        bible.label = label;
        bible.isNT = bible.origLang === NT_ORIG_LANG;
      }
      this.props.closeAlertDialog();
      this.setState({ alignedBibles });
      console.log(`loadAlignmentSearchOptions() - current aligned bible ${this.state.alignedBible}`);
      this.selectAlignedBookToSearch(this.state.alignedBible);
      console.log('loadAlignmentSearchOptions() - finished');
    });
  }

  /**
   * get user label for bible
   * @param {object} bible
   * @param {boolean} short - if true, remove original language
   * @returns {string}
   */
  getLabelForBible(bible, short = false) {
    let label;
    const bibleId = bible.resourceId || bible.bibleId;

    if (short) {
      label = `${bible.languageId}_${bibleId}/${bible.owner} - ${bible.version}`;
    } else {
      label = `${bible.languageId}_${bibleId}/${bible.owner} - ${(bible.origLang)} - ${bible.version}`;
    }
    return label;
  }

  /**
   * checks if selected bible has an index saved.  If not then an index is first created and saved.  Then the index is
   *    loaded for searching
   * @param {string} selectedBibleKey
   * @param {function} callback - when finished
   */
  loadAlignmentData(selectedBibleKey, callback = null) {
    if (selectedBibleKey) {
      console.log(`loadAlignmentData() - loading index for '${selectedBibleKey}'`);
      this.showMessage('Loading index of Bible alignments for Search', true).then(async () => {
        const resource = this.getResourceForBible(selectedBibleKey);

        if (resource) {
          if (!resource.alignmentCount) {
            console.log(`loadAlignmentData() - Doing one-time indexing of Bible for Search for '${selectedBibleKey}'`);
            const indexingMsg = 'Doing one-time indexing of Bible for Search:';
            await this.showMessage(indexingMsg, true);
            const alignmentData = await getAlignmentsFromResource(USER_RESOURCES_PATH, resource, async (percent) => {
              await this.showMessage(<> {indexingMsg} <br/>{`${100 - percent}% left`} </>, true);
            });

            if (alignmentData?.alignments?.length) {
              console.error(`loadAlignmentData() - found ${alignmentData?.alignments?.length} alignments`);
              resource.alignmentCount = alignmentData?.alignments?.length;
              this.setState({ alignedBibles: this.state.alignedBibles });
              await this.showMessage('Doing one-time indexing of Bible for Search', true);
              const success = this.loadIndexedAlignmentData(resource);
              callback && callback(success, `Failed loading index for '${selectedBibleKey}'`);
            } else {
              console.error(`loadAlignmentData() - no alignments for ${selectedBibleKey}`);
              callback && callback(false, `No Alignments found in '${selectedBibleKey}'`);
            }
          } else {
            console.log(`loadAlignmentData() loaded cached alignment index for ${selectedBibleKey}`);
            const success = this.loadIndexedAlignmentData(resource);
            callback && callback(success, `Failed loading index for '${selectedBibleKey}'`);
          }
        } else {
          console.log(`loadAlignmentData() no aligned bible match found for ${selectedBibleKey}`);
          callback && callback(false, `Could not find aligned bible for '${selectedBibleKey}'`);
        }
      });
    } else {
      console.log('loadAlignmentData() no aligned bible');
      callback && callback(false, `Invalid aligned bible ID: '${selectedBibleKey}'`);
    }
  }

  selectColumnHides(key) {
    const newHide = {
      ...(this.state?.hide || {}),
    };
    let currentState = newHide[key];
    newHide[key] = !currentState;
    this.setState({ hide: newHide });
  }

  showColumnHidesMenu() {
    const hide = this.state?.hide || {};

    this.props.openAlertDialog(
      <>
        <div> {'Enable Columns'} </div>
        <Menu>
          {showMenuItems.map(item => {
            const enabled = !hide[item.key];
            return (
              <MenuItem
                primaryText={item.label}
                key={item.key}
                onClick={() => this.selectColumnHides(item.key)}
                checked={enabled}
              />
            );
          })}
        </Menu>
      </>
      , false);
  }

  /**
   * searches aligned Bibles list for selected bible and returns resource data.
   * @param {string} selectedBibleKey
   * @returns {object|null} resource
   */
  getResourceForBible(selectedBibleKey) {
    const resource = this.state.alignedBibles?.find(item => item.key === selectedBibleKey);
    return resource;
  }

  /**
   * loads the indexed alignment data for resource and saves in state
   * @param {object} resource
   * @return {boolean} true if success
   */
  loadIndexedAlignmentData(resource) {
    try {
      // check alignment data folder for indexed search data
      const resourcesIndexed = readDirectory(ALIGNMENT_DATA_PATH, false, true, '.json');
      let alignmentData;
      const foundIndexPath = resourcesIndexed?.find((file) => file.indexOf(resource.key) === 0);

      if (foundIndexPath) {
        alignmentData = loadAlignments(path.join(ALIGNMENT_DATA_PATH, foundIndexPath));
      } else {
        console.log('loadIndexedAlignmentData() - did not find index');
      }

      if (alignmentData) {
        console.log('loadIndexedAlignmentData() - loaded alignment data');
        this.setState({
          alignmentData,
          found: null,
        });
        return true;
      } else {
        this.props.openAlertDialog(`No Aligned Bible found for ${resource.label}`);
        console.log('loadIndexedAlignmentData() - FAILED to load alignment data');
        this.setState({
          alignmentData: null,
          found: null,
        });
        return false;
      }
    } catch (e) {
      console.error('loadIndexedAlignmentData() - ERROR loading alignment data', e);
      return false;
    }
  }

  getSearchFieldOptions() {
    const currentsearchFieldOptions = this.state.searchTwords ? searchFieldOptionsForTwords : searchFieldOptions;
    return currentsearchFieldOptions;
  }

  /**
   * show search results in table
   * @returns {JSX.Element}
   */
  showResults() {
    if (this.props.open && this.state.found) { // if we have search results
      if (this.state.found?.length) { // if search results are not empty, create table to show results
        const ignoreBooks = this.ignoreBooksForTestament();
        const data = this.formatData(ignoreBooks);
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
            searchTooltip: 'Filter Results',
            searchPlaceholder: 'Filter Results',
          },
        };
        const hide = this.state?.hide || {};
        const searchColumns = [
          !hide[SHOW_SOURCE_TEXT] && { title: (SOURCE_TEXT_LABEL), field: SHOW_SOURCE_TEXT, ...originalStyles },
          !hide[SHOW_SOURCE_LEMMA] && { title: (SOURCE_LEMMA_LABEL), field: SHOW_SOURCE_LEMMA, ...originalStyles },
          !hide[SHOW_MORPH] && { title: (SOURCE_MORPH_LABEL), field: SHOW_MORPH, ...columnStyles },
          !hide[SHOW_STRONGS] && { title: (STRONGS_LABEL), field: SHOW_STRONGS, ...columnStyles },
          !hide[SHOW_TARGET_TEXT] && { title: (TARGET_TEXT_LABEL), field: SHOW_TARGET_TEXT, ...columnStyles },
          !hide[SHOW_MATCH_COUNT] && { title: (MATCH_COUNT_LABEL), field: SHOW_MATCH_COUNT, ...columnStyles },
          !hide[SHOW_REFERENCES] && {
            title: (REFERENCES_LABEL),
            field: SHOW_REFERENCES,
            ...columnStyles,
            render: rowData => <> { this.renderRefs(rowData.refs, rowData.targetText) } </>,
          },
        ];
        let message = `Found ${data?.length || 0} matches`;

        if (ignoreBooks?.length) {
          message += ` - ignored books: ${ignoreBooks.join(',')}`;
        }

        return (
          <>
            <div style={{ fontWeight: 'bold', color: 'black' }}> {message} </div>
            <MaterialTable
              columns={searchColumns.filter(item => item)}
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
          </>
        );
      } else { // if search results are empty, show message
        return (
          <>
            <br/>
            <br/>
            <b>{'No results found!'}</b>
          </>
        );
      }
    } else { // if we don't have search results yet, prompt user that they need to do search
      return (
        <>
          <br/>
          <br/>
          <b>{'Need to Start Search!'}</b>
        </>
      );
    }
  }

  /**
   * format data for display
   * @param ignoreBooks
   * @returns {*}
   */
  formatData(ignoreBooks) {
    let data = this.state.found || [];
    let hidden = this.state.hide || {};
    hidden = Object.keys(hidden).map(key => hidden[key] && key).filter(i => i);

    if (hidden?.length && data?.length) {
      const mergedData = {};
      const remainingColumns = [SHOW_SOURCE_TEXT, SHOW_MORPH, SHOW_SOURCE_LEMMA, SHOW_STRONGS, SHOW_TARGET_TEXT].filter(item => !hidden.includes(item));

      for (let i = 0; i < data.length; i ++) {
        const row = data[i];
        const key = remainingColumns.map(key => (row[key] || '').toString()).join('&');
        const mergedDataItem = mergedData[key];

        if (!mergedDataItem) {
          mergedData[key] = row;
          const newRefs = [];

          for (const ref of row.refs) {
            if (!newRefs.includes(ref)) {
              newRefs.push(ref);
            }
          }

          row.refs = newRefs;
        } else {
          let mergedRefs = mergedDataItem.refs;

          if (!mergedRefs) {
            mergedDataItem.refs = [];
            mergedRefs = mergedDataItem.refs;
          }

          for (const ref of row.refs) {
            if (!mergedRefs.includes(ref)) {
              mergedRefs.push(ref);
            }
          }
        }
      }
      data = Object.keys(mergedData).map(key => mergedData[key]);
    }

    function zeroAdjustLength(text, len) {
      while (text.length < len) {
        text = '0' + text;
      }
      return text;
    }

    function normalizeRef(ref) {
      let [bookId, ref_] = (ref || '').trim().split(' ');

      if ( bookId && ref_ ) {
        let [chapter, verse] = ref_.split(':');

        if (chapter && verse) {
          chapter = zeroAdjustLength(chapter, 3);
          verse = zeroAdjustLength(verse, 3);
          const bookNum = zeroAdjustLength(BIBLES_ABBRV_INDEX[bookId] || '', 3);
          return `${bookNum}_${chapter}_${verse}`;
        }
      }
      return null;
    }

    function bibleRefSort(a, b) {
      const akey = normalizeRef(a);
      const bkey = normalizeRef(b);
      // eslint-disable-next-line no-nested-ternary
      return akey < bkey ? -1 : akey > bkey ? 1 : 0;
    }

    data = data.map(item => {
      let refs = item.refs;
      let refs_ = refs;

      if (ignoreBooks?.length) {
        refs_ = refs.filter(refStr => refStr && !ignoreBooks.includes(refStr.split(' ')[0]));
        refs = refs_.sort(bibleRefSort); // sort refs in canonical order
      }

      if (!refs || !refs.length) { // if no references left, then ignore
        return null;
      }

      // eslint-disable-next-line react/jsx-key
      // const refSpans = refs.map(refStr => <span>{ refStr }</span> );
      // const refStr = <> { refSpans.join(';&nbsp;') } </>;
      const newItem = {
        ...item,
        refs,
        count: refs?.length,
      };
      return newItem;
    }).filter(item => item);
    return data;
  }

  /**
   * format refs array for output
   * @param {array} refs
   * @param {string} targetText - aligned target text
   * @returns {JSX.Element}
   */
  renderRefs(refs, targetText) {
    return <div>
      { refs.map((ref, i) => <span
        key={ i.toString() }
        onClick={(e) => {
          this.showPopUpVerse(ref, e, targetText);
        }}
      >
        {ref + ';\u00A0'}
      </span>)}
    </div>;
  }

  /**
   * scale the base font size by factor
   * @param factor
   * @returns {string}
   */
  getFontSize(factor) {
    const baseFontSize = this.state.baseFontSize || 1;
    const scaledFont = factor * baseFontSize;
    return `${scaledFont.toFixed(2)}em`;
  }

  /**
   * redraw the last popup with the new settings
   */
  refreshPopUp() {
    if (popupLocation) {
      delay(100).then(() => {
        this.showPopUpVerse(popupLocation.ref, popupLocation.e, popupLocation.targetText);
      });
    }
  }

  /**
   * show a popup verse for at element
   * @param {string} ref - bible reference to display
   * @param {object} e - element to show popup for
   * @param {string} targetText - aligned target text
   */
  showPopUpVerse(ref, e, targetText) {
    popupLocation = { ref, e, targetText };
    const popupTitlefontSize = this.getFontSize(1.1);
    const subTitleFontSize = `1.3em`;
    const verseFontSize = this.getFontSize(1);
    const extraBibleKeys = this.state.extraBibleKeys || [];
    const bibleKeys = [this.state.alignedBible];
    const bibleChoices = this.getAvailableBibles();

    for (const key of extraBibleKeys) {
      if (!bibleKeys.includes(key)) {
        const found = bibleChoices?.find(bible => bible.key === key);

        if (found) {
          bibleKeys.push(key);
        }
      }
    }

    const versesContent = bibleKeys.map((bibleKey, i) => {
      const content = this.getVerseContent(bibleKey, popupTitlefontSize, ref, !i && targetText);
      return content;
    });
    const contentStyle = {
      display: 'flex',
      alignItems: 'left',
      flexDirection: 'column',
      fontSize: verseFontSize,
    };
    const content = <div style={contentStyle}>
      {/* eslint-disable-next-line arrow-body-style */}
      {versesContent.map((item, pos) => {
        return <>
          {(pos > 0) &&
            <>
              <hr style={{
                border: '1px solid grey',
                width: '-webkit-fill-available',
                margin: '5px 0',
              }}/>
              <span key={pos.toString()} style={{
                display: 'flex',
                width: 'auto',
                justifyContent: 'space-between',
              }}>
                <strong style={{
                  fontSize: subTitleFontSize,
                  marginBottom: '5px',
                }}>{`${item.bibleLabel}`}</strong>
                <IconButton aria-label="delete"
                  key={pos}
                  style={{
                    margin: '0 0 5px 5px',
                    alignSelf: 'center',
                  }}
                  onClick={() => { // delete the bible key
                    const key = item.bibleKey;
                    let extraBibleKeys = [...(this.state.extraBibleKeys || [])];
                    extraBibleKeys = extraBibleKeys.filter(key_ => key_ !== key);
                    this.setState({ extraBibleKeys });
                    this.refreshPopUp();
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </span>
            </>
          }
          <div> {item.verseContent} </div>
        </>;
      })}
      <button onClick={() => this.addBible(bibleChoices)}
        className="btn-prime"
        id="add_bible_button"
        style={{ alignSelf: 'center', marginTop: '20px' }}
      >
        {'Add Bible'}
      </button>
    </div>;
    const style = { maxWidth: '600px' };
    const titleStyle = { display: 'flex', width: '-webkit-fill-available' };
    this.props.showPopover(versesContent[0].Title, content, e.target, style, titleStyle);
  }

  addBible(bibleChoices) {
    console.log('addBible() - Add Bible');

    this.props.openAlertDialog(
      <>
        <div> {'Choose new Bible'} </div>
        <Menu
          onItemClick={(event, menuItem, index) => {
            const extraBibleKeys = [...(this.state.extraBibleKeys || [])];

            if (!extraBibleKeys.includes(menuItem.key)) {
              extraBibleKeys.push(menuItem.key);
              this.setState({ extraBibleKeys });
            }
            this.props.closeAlertDialog();
            this.refreshPopUp();
          }}
        >
          {bibleChoices.map(item => (
            <MenuItem
              style={{ lineHeight: '24px' }}
              primaryText={item.label}
              key={item.key}
            />
          ))}
        </Menu>
      </>,
      false,
      'CANCEL',
      () => this.props.closeAlertDialog(),
    );
  }

  /**
   * get list of available bibles for viewing content
   * @returns {*[]}
   */
  getAvailableBibles() {
    function keySort(a, b) {
      const akey = a?.key;
      const bkey = b?.key;
      // eslint-disable-next-line no-nested-ternary
      return akey < bkey ? -1 : akey > bkey ? 1 : 0;
    }

    const resourceDir = path.join(env.home(), 'translationCore', 'resources');
    let bibleOptions = getAvailableBibles(resourceDir, false) || [];

    bibleOptions = bibleOptions.map(bible => {
      const key = getKeyForBible(bible, ALIGNMENTS_KEY);
      const label = this.getLabelForBible(bible, true);

      return {
        ...bible,
        key,
        label,
      };
    });
    return bibleOptions.sort(keySort);
  }

  /**
   * change font size for popup text
   * @param up
   */
  changeFontSize(up) {
    let baseFontSize = this.state.baseFontSize || 1;

    if (up) {
      baseFontSize *= 1.1;
    } else {
      baseFontSize /= 1.1;
    }
    console.log(`changeFontSize() - fontSize now ${baseFontSize}`);
    this.setState({ baseFontSize });
    this.refreshPopUp();
  }

  /**
   * generate verse content to show for bible
   * @param {string} bibleKey
   * @param {string} fontSize
   * @param {string} ref
   * @param {string} targetText - aligned target text
   * @returns {{verseContent: unknown[], Title: JSX.Element}}
   */
  getVerseContent(bibleKey, fontSize, ref, targetText) {
    const bible = parseResourceKey(bibleKey);
    const bibleLabel = this.getLabelForBible(bible, true);
    const Title = (
      <>
        <strong style={{ fontSize }}>{`${ref} - ${bibleLabel}`}</strong>
        <IconButton aria-label="increase-font"
          style = {{
            justifySelf: 'flex-right',
            marginLeft: 'auto',
          }}
          onClick={() => {
            console.log('increase font');
            this.changeFontSize(true);
          }}
        >
          <ArrowUpward fontSize='large' />
        </IconButton>
        <IconButton aria-label="decrease-font"
          style = {{
            justifySelf: 'flex-right',
            marginRight: '10px',
          }}
          onClick={() => {
            console.log('decrease font');
            this.changeFontSize(false);
          }}
        >
          <ArrowDownward fontSize='large' />
        </IconButton>
      </>
    );
    let verseText = '';
    const verseData = getVerseForKey(bibleKey, ref, bibles);

    if (Array.isArray(verseData)) {
      if (verseData.length > 1) {
        for (const verseItem of verseData) {
          verseText += `${verseItem.chapter}:${verseItem.verse} - ${verseItem.verseData}\n`;
        }
      } else {
        verseText = verseData[0].verseData;
      }
    }

    if (!verseText) {
      verseText = 'Error: no data found';
    } else if (this.state.hideUsfmMarkers) {
      const filtered = usfm.removeMarker(verseText).trim();
      verseText = filtered;
    }

    const verseContent = highlightSelectedTextInVerse(verseText, targetText);

    return {
      Title,
      verseContent,
      bibleLabel,
      bibleKey,
    };
  }

  /**
   * find any ignored books for current testament
   * @returns {[string]}
   */
  ignoreBooksForTestament() {
    const ignoreBooks_ = this.state?.ignore || [];
    const testament = this.state?.books || [];
    const ignoreBooks = ignoreBooks_.filter(bookId => testament.includes(bookId));
    return ignoreBooks;
  }

  /**
   * when user enters search string, save in state
   * @param {string} search - new search string
   */
  setSearchStr(search) {
    this.setState({ searchStr: search });
  }

  /**
   * when user selects bible to search, save in state
   * @param {object} event - unused
   * @param index - unused
   * @param {string} value - new selection
   */
  setSearchAlignedBible(event, index, value) {
    this.selectAlignedBookToSearch(value);
  }

  /**
   * select book and testament
   * @param {string} key
   */
  selectAlignedBookToSearch(key) {
    console.log(`selectAlignedBookToSearch(${key})`);

    if (key) {
      this.loadAlignmentData(key, (success, errorMessage) => {
        bibles = {};

        if (success) {
          //const key = `${bible.languageId}_${bible.resourceId}_${(encodeParam(bible.owner))}_${bible.origLang}_testament_${encodeParam(bible.version)}`;
          const [, , , origLang] = key.split('_');
          let books = null;
          const isNT = origLang === NT_ORIG_LANG;

          if (isNT) {
            books = NT_BOOKS;
          } else {
            books = OT_BOOKS;
          }

          console.log(`selectAlignedBookToSearch(${key}) - setting bible`);
          this.setState({
            alignedBible: key,
            books,
            isNT,
          });
          this.props.closeAlertDialog();
          this.loadTWordsIndex(key);
        } else {
          console.warn(`selectAlignedBookToSearch(${key}) - ERROR setting bible: ${errorMessage}`);

          if (errorMessage) {
            this.props.openAlertDialog(errorMessage);
          }
        }
      });
    }
  }

  /**
   * get twords index
   * @param {string} alignemntsKey - alignments key
   */
  loadTWordsIndex(alignemntsKey) {
    if (this.state.searchTwords) {
      // TODO
      const resource = parseResourceKey(alignemntsKey);
      const res = addTwordsInfoToResource(resource, USER_RESOURCES_PATH);
      const tWordsKey = getTwordsKey(res);
      let tWordsIndex = getTwordsIndex(tWordsKey);

      if (tWordsIndex) {
        this.setState({ tWordsIndex });
      } else {
        const indexingMsg = 'Indexing translationWords:';

        indexTwords(USER_RESOURCES_PATH, resource, async (percent) => {
          await this.showMessage(<> {indexingMsg} <br/>{`${100 - percent}% left`} </>, true);
        }).then(tWordsIndex => {
          console.log('tWords index finished');
          this.props.closeAlertDialog();
          saveTwordsIndex(tWordsKey, tWordsIndex);
          this.setState({ tWordsIndex });
        });
      }
    }
  }

  /**
   * when user updates fields to search, then save in state
   * @param {object} event - unused
   * @param {number} index - unused
   * @param {string[]} values
   */
  setSearchFields(event, index, values) {
    this.setState({ searchType: values });
  }

  /**
   * iterate through search options to find a match for key
   * @param {string} key
   * @returns {{label: string, key: string, stateKey: string} | {label: string, key: string, stateKey: string}}
   */
  findSearchItem(key) {
    const found = searchOptions.find(item => item.key === key);
    return found;
  }

  /**
   * when user updates search options (such as whole word or case insensitive), save in state
   * @param event
   * @param index
   * @param values
   */
  setSearchTypes(event, index, values) {
    const hide = {};
    const searchType = [];
    // hide = this.state?.hide || {};

    for (const item of showMenuItems) {
      const selected = this.isItemPresent(values, item.key);
      hide[item.key] = !selected;
    }

    for (const item of this.getSearchFieldOptions()) {
      const selected = this.isItemPresent(values, item);

      if (selected) {
        searchType.push(item);
      }
    }

    // basic options
    const basicOptions = {};

    searchOptions.forEach(item => {
      const searchOption = this.findSearchItem(item.key);
      const selected = this.isItemPresent(values, item.key);
      basicOptions[searchOption.stateKey] = selected;
    });

    const types = {
      ...basicOptions,
      hide,
      searchType,
    };

    this.setState(types);
  }

  /**
   * when user clicks close, clear search results and call onClose
   */
  handleClose() {
    this.setState({
      alignmentData: null,
      alignedBibles: null,
      tWordsIndex: null,
      found: null,
    }); // clear data

    const onClose = this.props.onClose;
    onClose && onClose();
    bibles = {};
  }

  /**
   * when user clicks search button, do search of indexed data
   */
  startSearch() {
    console.log('AlignmentSearchDialogContainer - start search');
    this.setState({ found: null });
    const state = this.state;
    const searchTwords = state.searchTwords;
    const config = {
      fullWord: state.matchWholeWord,
      caseInsensitive: !state.caseSensitive,
      searchTwords,
      searchLemma: !searchTwords && this.isSearchFieldSelected(SEARCH_LEMMA),
      searchSource: this.isSearchFieldSelected(SEARCH_SOURCE),
      searchTarget: this.isSearchFieldSelected(SEARCH_TARGET),
      searchStrong: this.isSearchFieldSelected(SEARCH_STRONG),
      searchRefs: !searchTwords && this.isSearchFieldSelected(SEARCH_REFS),
    };

    // when
    let found = multiSearchAlignments(state.alignmentData, state.tWordsIndex, state.searchStr, config) || [];
    console.log(`AlignmentSearchDialogContainer - finished search, found ${found.length} items`);
    delay(100).then(() => {
      this.setState({ found });
    });
  }

  /**
   * check state data to see if search option is selected
   * @param {string} key
   * @returns {boolean}
   */
  isSearchFieldSelected(key) {
    const searchType = this.state.searchType;
    return this.isItemPresent(searchType, key);
  }

  /**
   * check state data to see if search option is selected
   * @param {string} key
   * @returns {boolean}
   */
  isBookEnabled(key) {
    const ignoredBooks = this.state.ignore || [];
    const found = this.isItemPresent(ignoredBooks, key);
    return !found;
  }

  /**
   * check state data to see if search option is selected
   * @param {string} key
   * @returns {boolean}
   */
  toggleBook(key) {
    const ignoredBooks = this.state.ignore || [];
    const found = this.isItemPresent(ignoredBooks, key);
    let newIgnore = [...ignoredBooks];

    if (found) {
      newIgnore = ignoredBooks.filter(item => item !== key);
    } else {
      newIgnore.push(key);
    }
    this.setState({ ignore: newIgnore });
  }

  /**
   * set all or clear all books in bible
   * @param {boolean} enable - if true then all books are enabled, otherwise all books are cleared
   */
  setAll(enable) {
    let newIgnore = [...(this.state.ignore || [])];

    for (const bible of this.state.books) {
      if (enable) {
        newIgnore = newIgnore.filter(item => item !== bible);
      } else if (!newIgnore.includes(bible)) {
        newIgnore.push(bible);
      }
    }
    this.setState({ ignore: newIgnore });
  }

  /**
   * search array to see if it contains key
   * @param {string[]} array - to search
   * @param {string} key
   * @returns {boolean}
   */
  isItemPresent(array, key) {
    return array && array.indexOf(key) >= 0;
  }

  /**
   * generate list of currently selected search options
   * @param {string} options
   * @returns {string[]}
   */
  getSelectedOptions(options) {
    const hide = this.state?.hide || {};
    let selections = options.map(item => !!this.state[item.stateKey] && item.key);
    selections = selections.filter(item => item);
    let selections2 = showMenuItems.map(item => !hide[item.key] && item.key);
    selections2 = selections2.filter(item => item);
    const searchType = this.state?.searchType || [];
    let selections3 = searchFieldOptions.map(item => searchType.includes(item) && item);
    selections3 = selections3.filter(item => item);
    selections = selections.concat(selections2);
    selections = selections.concat(selections3);
    return selections;
  }

  render() {
    const {
      open,
      translate,
    } = this.props;

    const fullScreen = { maxWidth: '100%', width: '100%' };
    // const partialScreen = { maxWidth: '768px', width: '75%' };
    const contentStyle = fullScreen;
    const testament = this.state?.books || [];
    const bookLabels = this.state?.isNT ? BIBLE_BOOKS.newTestament : BIBLE_BOOKS.oldTestament;

    return (
      <BaseDialog
        open={open}
        primaryLabel={'Search'}
        secondaryLabel={translate('buttons.close_button')}
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
              <SelectField
                id={'select_search_type'}
                hintText="Select Bible to Search"
                value={this.state.alignedBible}
                style={{ width: '400px' }}
                onChange={this.setSearchAlignedBible}
              >
                {
                  this.state.alignedBibles?.map(item => (
                    <MenuItem
                      key={item.key}
                      insetChildren={true}
                      value={item.key}
                      primaryText={item.label}
                    />
                  ))
                }
              </SelectField>
            </div>
            <div style={{ display: 'flex' }}>
              <SelectField
                id={'select_search_option'}
                hintText="Select search options"
                value={this.getSelectedOptions(searchOptions)}
                multiple
                style={{ width: '350px', marginLeft: '20px', marginRight: '20px' }}
                onChange={this.setSearchTypes}
              >
                {searchOptions.map(item => (
                  <MenuItem
                    key={item.key}
                    insetChildren={true}
                    checked={this.state[item.stateKey]}
                    value={item.key}
                    primaryText={item.label}
                  />
                ))}
                <Divider />
                <Subheader inset={true}>{'Select Columns to Show:'}</Subheader>
                {showMenuItems.map(item => {
                  const hide = this.state?.hide || {};
                  return (
                    <MenuItem
                      key={item.key}
                      insetChildren={true}
                      checked={!hide[item.key]}
                      value={item.key}
                      primaryText={item.label}
                    />
                  );
                })}
                <Divider />
                <Subheader inset={true}>{'Select Fields to Search:'}</Subheader>
                {
                  this.getSearchFieldOptions().map(item => (
                    <MenuItem
                      key={item}
                      insetChildren={true}
                      checked={this.isSearchFieldSelected(item)}
                      value={item}
                      primaryText={searchFieldLabels[item]}
                    />
                  ))
                }
                <Divider />
                <Subheader inset={true}>{'Select Books to Search:'}</Subheader>
                <MenuItem
                  key={'all'}
                  value={'all'}
                  primaryText='*** Select All ***'
                  onClick={() => this.setAll(true)}
                />
                <MenuItem
                  key={'none'}
                  value={'none'}
                  primaryText='*** Clear All ***'
                  onClick={() => this.setAll(false)}
                />
                {
                  testament.map(item => (
                    <MenuItem
                      key={item}
                      insetChildren={true}
                      checked={this.isBookEnabled(item)}
                      value={item}
                      primaryText={bookLabels[item]}
                      onClick={() => this.toggleBook(item)}
                    />
                  ))
                }
              </SelectField>
            </div>
          </div>
          { this.showResults() }
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
  openAlertDialog: PropTypes.func.isRequired,
  openOptionDialog: PropTypes.func.isRequired,
  closeAlertDialog: PropTypes.func.isRequired,
  saveSettings: PropTypes.func.isRequired,
  savedSettings: PropTypes.object.isRequired,
  showPopover: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  manifest: getProjectManifest(state),
  savedSettings: getSetting(state, SEARCH_SETTINGS_KEY),
});

const mapDispatchToProps = {
  openAlertDialog: (alertMessage, loading, buttonText = null, callback = null) => openAlertDialog(alertMessage, loading, buttonText, callback),
  openOptionDialog: (alertMessage, callback, button1Text, button2Text, buttonLinkText = null, callback2 = null, notCloseableAlert = false) => openOptionDialog(alertMessage, callback, button1Text, button2Text, buttonLinkText, callback2, notCloseableAlert),
  closeAlertDialog: () => closeAlertDialog(),
  saveSettings: (value) => setSetting(SEARCH_SETTINGS_KEY, value),
  showPopover: (title, bodyText, positionCoord, style = {}, titleStyle = {}, bodyStyle = {}) => showPopover(title, bodyText, positionCoord, style, titleStyle, bodyStyle),
};

export default connect(mapStateToProps, mapDispatchToProps)(AlignmentSearchDialogContainer);
