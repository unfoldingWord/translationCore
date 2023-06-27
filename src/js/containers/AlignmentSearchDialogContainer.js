/* eslint-disable react/display-name,object-curly-newline */
/* eslint-disable no-await-in-loop */
import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import fs from 'fs-extra';
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
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
// import ArrowUpward from '@material-ui/icons/ArrowUpward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteIcon from '@material-ui/icons/Delete';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import Remove from '@material-ui/icons/Remove';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';
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
  ALIGNMENT_DATA_DIR,
  ALIGNMENTS_KEY,
  checkForHelpsForBible,
  deleteCachedAlignmentData,
  downloadBible,
  getAlignmentsFromResource,
  getAvailableBibles,
  getKeyForBible,
  getSearchableAlignments,
  getTwordALignments,
  getTwordsIndex,
  getTwordsKey,
  getVerseForKey,
  highlightSelectedTextInVerse,
  indexTwords,
  isMasterResourceDownloaded,
  loadAlignments,
  multiSearchAlignments,
  NT_BOOKS,
  OT_BOOKS,
  parseResourceKey,
  readDirectory,
  removeIndices,
  saveTwordsIndex,
  TWORDS_KEY,
} from '../helpers/alignmentSearchHelpers';
import {
  ALIGNMENT_DATA_PATH,
  USER_HOME,
  USER_RESOURCES_PATH,
} from '../common/constants';
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
import * as OnlineModeConfirmActions from '../actions/OnlineModeConfirmActions';
import * as exportHelpers from '../helpers/exportHelpers';

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

const OkButton = 'OK';
const CancelButton = 'CANCEL';

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
  SEARCH_LEMMA,
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
const ALIGNED_TEXT = 'alignedText';
const ALIGNED_TEXT2 = 'alignedText2';

const SOURCE_TEXT_LABEL = 'Source Text Column';
const SOURCE_LEMMA_LABEL = 'Source Lemma Column';
const STRONGS_LABEL = 'Source Strong\'s Column';
const SOURCE_MORPH_LABEL = 'Source Morph Column';
const TARGET_TEXT_LABEL = 'Target Text Column';
const MATCH_COUNT_LABEL = 'Match Count Column';
const REFERENCES_LABEL = 'References Column';
// const ALIGNED_TEXT_LABEL = 'Aligned Text Column';
const SEARCH_DUAL = 'search_dual';
const SEARCH_CASE_SENSITIVE = 'search_case_sensitive';
const SEARCH_MATCH_WHOLE_WORD = 'search_match_whole_word';
const SEARCH_MATCH_WORDS_IN_ORDER = 'search_match_words_in_order';
const SEARCH_HIDE_USFM = 'search_hide_usfm';
const SEARCH_TWORDS = 'search_twords';
const SEARCH_MASTER = 'search_master';
const REFRESH_MASTER = 'refresh_master';
const CLEAR_INDEX_DATA = 'clear_index_data';

const SEARCH_DUAL_LABEL = 'Dual Repo Searching';
const SEARCH_CASE_SENSITIVE_LABEL = 'Case Sensitive';
const SEARCH_MATCH_WHOLE_WORD_LABEL = 'Match Whole Word';
const SEARCH_MATCH_WORDS_IN_ORDER_LABEL = 'Match Multiple Words in Order';
const SEARCH_HIDE_USFM_LABEL = 'Hide USFM Markers';
const SEARCH_TWORDS_LABEL = 'Search Translation Words';
const SEARCH_MASTER_LABEL = 'Search Master Branch';
const REFRESH_MASTER_LABEL = 'Refresh Master Branch';
const CLEAR_INDEX_DATA_LABEL = 'Clear Index Data';

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
    key: SEARCH_MATCH_WORDS_IN_ORDER,
    label: SEARCH_MATCH_WORDS_IN_ORDER_LABEL,
    stateKey: 'inOrder',
  },
  {
    key: SEARCH_TWORDS,
    label: SEARCH_TWORDS_LABEL,
    stateKey: 'searchTwords',
  },
  {
    key: SEARCH_DUAL,
    label: SEARCH_DUAL_LABEL,
    stateKey: 'dualSearch',
  },
  {
    key: SEARCH_HIDE_USFM,
    label: SEARCH_HIDE_USFM_LABEL,
    stateKey: 'hideUsfmMarkers',
  },
  {
    key: SEARCH_MASTER,
    label: SEARCH_MASTER_LABEL,
    stateKey: 'searchMaster',
  },
];

const searchOptionRefreshMaster = {
  key: REFRESH_MASTER,
  label: REFRESH_MASTER_LABEL,
  stateKey: 'refreshMaster',
};

const searchOptionClearIndexData = {
  key: CLEAR_INDEX_DATA,
  label: CLEAR_INDEX_DATA_LABEL,
  stateKey: 'clearIndex',
};

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
      alignedBible2: null,
      alignmentData2: null,
      inOrder: false,
      hide: {},
      dualSearch: false,
      updatingMaster: false,
      selectingAlignments: false,
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
    this.setSearchAlignedBible2 = this.setSearchAlignedBible2.bind(this);
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
          newState.updatingMaster = false;
          newState.selectingAlignments = false;
          this.setState(newState);
        }

        delay(100).then(() => {
          this.loadAlignmentSearchOptionsWithUI();
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
  async loadAlignmentSearchOptionsWithUI() {
    console.log('loadAlignmentSearchOptions() - starting');
    await this.showMessage('Loading Available Aligned Bibles', true).then(async () => {
      this.loadAlignmentSearchOptions(this.state.searchMaster);
      const unsupported = this.isSupportedAlignmentKey(this.state.alignedBible) || this.isSupportedAlignmentKey(this.state.alignedBible2);

      if (unsupported) { // if either keys not supported then clear them
        this.setState({ alignedBible: null, alignedBible2: null });
      } else {
        await this.selectAlignedBookToSearch(this.state.alignedBible);
        await this.selectAlignedBookToSearch(this.state.alignedBible2, 2);
      }
      console.log('loadAlignmentSearchOptions() - finished');
    });
  }

  /**
   * make sure alignment key is for current build
   * @param {string} alignment
   * @returns {boolean}
   */
  isSupportedAlignmentKey(alignment) {
    let unsupported = true;

    // if alignment key is set make sure it is compatible with current build
    if (!alignment || alignment?.indexOf(ALIGNMENTS_KEY) > 0 || alignment?.indexOf(TWORDS_KEY) > 0) {
      unsupported = false;
    }
    return unsupported;
  }

  /**
   * index downloaded bible resources to get available aligned bibles
   * @param {boolean} useMaster - if true then include master branch alignments
   */
  loadAlignmentSearchOptions(useMaster) {
    const tCorePath = path.join(env.home(), 'translationCore');
    let alignedBibles = getSearchableAlignments(tCorePath, useMaster);
    console.log(`loadAlignmentSearchOptions() - found ${alignedBibles?.length} aligned bible testaments`);
    const alignedBibles_ = alignedBibles.map(bible => {
      if (this.state.searchTwords) {
        if (bible.owner !== 'Door43-Catalog') { // for now only door43 supported
          if (!checkForHelpsForBible(bible)) {
            return null;
          }
        }
      }

      if (!useMaster) {
        if (bible.version === 'master') {
          return null;
        }
      }

      const key = getKeyForBible(bible, ALIGNMENTS_KEY);
      const label = this.getLabelForBible(bible);
      bible.key = key;
      bible.label = label;
      bible.isNT = bible.origLang === NT_ORIG_LANG;
      return bible;
    });

    alignedBibles = alignedBibles_.filter(bible => bible);
    alignedBibles = alignedBibles.sort((a, b) => a.key < b.key ? -1 : 1);
    this.props.closeAlertDialog();
    this.setState({ alignedBibles });
    console.log(`loadAlignmentSearchOptions() - current aligned bible ${this.state.alignedBible}`);
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
   * @param {number} searchNum - if number is two, then load for second search
   */
  async loadAlignmentData(selectedBibleKey, callback = null, searchNum = 1) {
    if (selectedBibleKey) {
      console.log(`loadAlignmentData() - loading index for '${selectedBibleKey}'`);
      await this.showMessage('Loading index of Bible alignments for Search', true).then(async () => {
        const resource = this.getResourceForBible(selectedBibleKey);

        if (resource) {
          if (!resource.alignmentCount) {
            console.log(`loadAlignmentData() - Doing one-time indexing of Bible for Search of '${selectedBibleKey}'`);
            const indexingMsg = `Doing one-time indexing of Bible for Search of '${selectedBibleKey}':`;
            await this.showMessage(indexingMsg, true);
            const alignmentData = await getAlignmentsFromResource(USER_RESOURCES_PATH, resource, async (percent) => {
              await this.showMessage(<> {indexingMsg} <br/>{`${100 - percent}% left`} </>, true);
            });

            if (alignmentData?.alignments?.length) {
              console.log(`loadAlignmentData() - found ${alignmentData?.alignments?.length} alignments`);
              resource.alignmentCount = alignmentData?.alignments?.length;
              this.setState({ alignedBibles: this.state.alignedBibles });
              await this.showMessage(indexingMsg, true);
              const success = this.loadIndexedAlignmentData(resource, searchNum);
              callback && await callback(success, `Failed loading index for '${selectedBibleKey}'`);
            } else {
              console.error(`loadAlignmentData() - no alignments for ${selectedBibleKey}`);
              callback && await callback(false, `No Alignments found in '${selectedBibleKey}'`);
            }
          } else {
            console.log(`loadAlignmentData() loaded cached alignment index for ${selectedBibleKey}`);
            const success = this.loadIndexedAlignmentData(resource, searchNum);
            callback && await callback(success, `Failed loading index for '${selectedBibleKey}'`);
          }
        } else {
          console.log(`loadAlignmentData() no aligned bible match found for ${selectedBibleKey}`);
          callback && await callback(false, `Could not find aligned bible for '${selectedBibleKey}'`);
        }
      });
    } else {
      console.log('loadAlignmentData() no aligned bible');
      callback && await callback(false, `Invalid aligned bible ID: '${selectedBibleKey}'`);
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
   * @param {number} searchNum - if number is two, then load for second search
   * @return {boolean} true if success
   */
  loadIndexedAlignmentData(resource, searchNum = 1) {
    const alignmentKey = (searchNum === 2) ? 'alignmentData2' : 'alignmentData';

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
          [alignmentKey]: alignmentData,
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

  saveToJsonfile(data) {
    const DOCUMENTS_PATH = path.join(USER_HOME, 'Documents');

    const defaultFields = [
      { id: 'sourceText', source: 'Source Text' },
      { id: 'sourceLemma', source: 'Source Lemma' },
      { id: 'morph', source: 'Source Morph' },
      { id: 'strong', source: 'Source Strongs' },
      { id: 'targetText', source: 'Target Text' },
      { id: 'alignedText', source: 'Aligned Text' },
      { id: 'count', source: 'Match Count' },
      { id: 'refs', source: 'References' },
      { id: 'config', source: 'Configuration' },
    ];
    const tWordsFields = [
      { id: 'refs', source: 'refs' },
      { id: 'lemma', source: 'lemma' },
      { id: 'strong', source: 'strong' },
      { id: 'morph', source: 'morph' },
      { id: 'alignedText', source: 'alignedText' },
      { id: 'targetText', source: 'targetText' },
      { id: 'targetAlignment', source: 'alignedText' },
      { id: 'sourceAlignment', source: 'sourceText' },
      { id: 'category', source: 'category' },
      { id: 'tWord', source: 'contextId.groupId' },
      { id: 'quote', source: 'contextId.quote' },
      { id: 'count', source: 'count' },
    ];

    const newData = [];
    const fields = this.state.searchTwords ? tWordsFields : defaultFields;

    for (const item of data) {
      const newItem = {};

      for (const field of fields) {
        const id = field.id;
        let source = field.source?.split('.') || [];
        let value = item;

        for (const key of source) {
          value = value[key];
        }

        newItem[id] = value;
      }
      newData.push(newItem);
    }

    const dataStr = JSON.stringify(newData, null, 2);

    exportHelpers.getFilePath('searchResults', DOCUMENTS_PATH, 'json').then(pdfPath => {
      console.log(`doPrint() - have TSV save path: ${pdfPath}`);

      fs.writeFile(pdfPath, dataStr, (error) => {
        if (error) {
          console.error(`saveTofile() - save error`, error);
        } else {
          console.log(`Wrote TSV successfully to ${pdfPath}`);
        }
      });
    }).catch(error => {
      console.log(`Failed to select PDF path: `, error);
    });
  }

  saveToTsvfile(data) {
    const DOCUMENTS_PATH = path.join(USER_HOME, 'Documents');
    const defaultFields = [
      { id: 'sourceText', title: 'Source Text' },
      { id: 'sourceLemma', title: 'Source Lemma' },
      { id: 'morph', title: 'Source Morph' },
      { id: 'strong', title: 'Source Strongs' },
      { id: 'targetText', title: 'Target Text' },
      { id: 'alignedText', title: 'Aligned Text' },
      { id: 'count', title: 'Match Count' },
      { id: 'refs', title: 'References' },
      { id: 'config', title: 'Configuration' },
    ];
    const tWordsFields = [
      { id: 'sourceText', title: 'Source Text' },
      { id: 'sourceLemma', title: 'Source Lemma' },
      { id: 'morph', title: 'Source Morph' },
      { id: 'strong', title: 'Source Strongs' },
      { id: 'targetText', title: 'Translation Words' },
      { id: 'alignedText', title: 'Aligned Text' },
      { id: 'category', title: 'Category' },
      { id: 'count', title: 'Match Count' },
      { id: 'refs', title: 'References' },
      { id: 'config', title: 'Configuration' },
    ];

    const fields = this.state.searchTwords ? tWordsFields : defaultFields;

    const dataLines = [];
    const configFields = [ 'alignedBible', 'alignedBible2', 'caseSensitive', 'dualSearch', 'hideUsfmMarkers', 'matchWholeword', 'searchMaster', 'searchStr', 'searchTwords', 'searchType'];
    const config = {};

    configFields.forEach(id => {
      const value = this.state[id];
      config[id] = `${value}`;
    });

    dataLines.push(fields.map(f => f.title).join('\t'));

    for (let i = 0; i < data.length; i++) {
      const item = data[i];

      const fieldData = fields.map(field => {
        let value = '';
        const id = field.id;

        if (id === 'config') {
          if (i === 0) {
            value = JSON.stringify(config);
          }
        } else {
          value = (item[id] || '');

          if (Array.isArray(value)) {
            value = value.join('; ');
          }
        }

        return `${value}`;
      });

      dataLines.push(fieldData.join('\t'));
    }

    const dataStr = dataLines.join('\n');

    exportHelpers.getFilePath('searchResults', DOCUMENTS_PATH, 'tsv').then(pdfPath => {
      console.log(`doPrint() - have TSV save path: ${pdfPath}`);

      fs.writeFile(pdfPath, dataStr, (error) => {
        if (error) {
          console.error(`saveTofile() - save error`, error);
        } else {
          console.log(`Wrote TSV successfully to ${pdfPath}`);
        }
      });
    }).catch(error => {
      console.log(`Failed to select PDF path: `, error);
    });
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
        const alignedColumn = this.getColumnTitle(this.state.alignedBible);
        const alignedColumn2 = this.state.alignedBible2 ? this.getColumnTitle(this.state.alignedBible2) : '';
        const searchColumns = [
          !hide[SHOW_SOURCE_TEXT] && { title: (SOURCE_TEXT_LABEL), field: SHOW_SOURCE_TEXT, ...originalStyles },
          !hide[SHOW_SOURCE_LEMMA] && { title: (SOURCE_LEMMA_LABEL), field: SHOW_SOURCE_LEMMA, ...originalStyles },
          !hide[SHOW_MORPH] && { title: (SOURCE_MORPH_LABEL), field: SHOW_MORPH, ...columnStyles },
          !hide[SHOW_STRONGS] && { title: (STRONGS_LABEL), field: SHOW_STRONGS, ...columnStyles },
          !hide[SHOW_TARGET_TEXT] && { title: (TARGET_TEXT_LABEL), field: SHOW_TARGET_TEXT, ...columnStyles },
          this.state.searchTwords && { title: (alignedColumn), field: ALIGNED_TEXT, ...columnStyles },
          this.state.searchTwords && alignedColumn2 && { title: (alignedColumn2), field: ALIGNED_TEXT2, ...columnStyles },
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

        const buttonStyle = { alignSelf: 'center', marginTop: '20px', width: 'auto', paddingLeft: '4px', paddingRight: '4px' };

        return (
          <>
            <div style={{ fontWeight: 'bold', color: 'black' }}> {message} </div>
            <button onClick={() => this.saveToTsvfile(data)}
              className="btn-prime"
              id="save_tsv_button"
              style={buttonStyle}
            >
              {'Save Search Results to TSV File'}
            </button>
            <button onClick={() => this.saveToJsonfile(data)}
              className="btn-prime"
              id="save_tsv_button"
              style={buttonStyle}
            >
              {'Save Search Details to JSON File'}
            </button>
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
   * get title from bible key
   * @param bibleKey
   * @returns {string}
   */
  getColumnTitle(bibleKey) {
    const bible_ = bibleKey?.split('_') || [];
    const alignedBible = bible_.length > 1 ? bible_.slice(0, 2).join('_') : bible_[0];
    const alignedColumn = `Aligned ${alignedBible} Column`;
    return alignedColumn;
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

    if (data?.length) {
      const mergedData = {};
      const remainingColumns = [SHOW_SOURCE_TEXT, SHOW_MORPH, SHOW_SOURCE_LEMMA, SHOW_STRONGS, SHOW_TARGET_TEXT, ALIGNED_TEXT, ALIGNED_TEXT2].filter(item => !hidden.includes(item));

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

    // ignore books from other testament also
    const ignoreBooks_ = ignoreBooks.concat(this.state?.ignoreBooks || []);

    data = data.map(item => {
      let refs = item.refs;
      let refs_ = refs.filter(refStr => refStr && !ignoreBooks_.includes(refStr.split(' ')[0]));
      refs = refs_.sort(bibleRefSort); // sort refs in canonical order

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
          this.showPopUpVerse(refs, i, e, targetText);
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
        this.showPopUpVerse(popupLocation.refs, popupLocation.index, popupLocation.e, popupLocation.targetText);
      });
    }
  }

  /**
   * show a popup verse for at element
   * @param {[string]} refs - bible references to display
   * @param {number} index - current
   * @param {object} e - element to show popup for
   * @param {string} targetText - aligned target text
   */
  showPopUpVerse(refs, index, e, targetText) {
    popupLocation = { refs, index, e, targetText };
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
      const content = this.getVerseContent(bibleKey, popupTitlefontSize, refs[index], !i && targetText);
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
          <AddCircleOutlineIcon fontSize='large' />
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
          <RemoveCircleOutlineIcon fontSize='large' />
        </IconButton>
        <IconButton aria-label="next-ref"
          disabled={popupLocation.index <= 0}
          style = {{
            justifySelf: 'flex-right',
            marginRight: '10px',
          }}
          onClick={() => {
            console.log('previous ref');
            let i = (popupLocation.index || 0) - 1;

            if (i < 0) {
              i = 0;
            }
            this.showPopUpVerse(popupLocation.refs, i, popupLocation.e, popupLocation.targetText);
          }}
        >
          <NavigateBeforeIcon fontSize='large' />
        </IconButton>

        <IconButton aria-label="next-ref"
          disabled={popupLocation.index >= popupLocation.refs?.length - 1}
          style = {{
            justifySelf: 'flex-right',
            marginRight: '10px',
          }}
          onClick={() => {
            console.log('next ref');
            const refsCount = popupLocation.refs?.length || 0;
            let i = (popupLocation.index || 0) + 1;

            if (i >= refsCount) {
              i = refsCount -1;
            }
            this.showPopUpVerse(popupLocation.refs, i, popupLocation.e, popupLocation.targetText);
          }}
        >
          <NavigateNextIcon fontSize='large' />
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
    let ignoreBooks_ = this.state?.ignore || [];
    let testament = this.state?.books || [];
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
   * when user selects bible to search, save in state
   * @param {object} event - unused
   * @param index - unused
   * @param {string} value - new selection
   */
  setSearchAlignedBible2(event, index, value) {
    if (this.state.searchMaster) {
      this.setState({ alignedBible2: value });
      value && this.state.searchMaster && delay(100).then(() => {
        this.downloadMasterIfMissing();
        this.selectAlignedBookToSearch(value, 2);
      });
    } else {
      this.selectAlignedBookToSearch(value, 2);
    }
  }

  /**
   * select book and testament
   * @param {string} key
   * @param {number} searchNum - if number is two, then load for second search
   */
  async selectAlignedBookToSearch(key, searchNum = 1) {
    console.log(`selectAlignedBookToSearch(${key}) for ${searchNum}`);
    const alignmentKey = (searchNum === 2) ? 'alignedBible2' : 'alignedBible';

    if (key) {
      if (!this.state.selectingAlignments) {
        this.setState({ selectingAlignments: true });
        await delay(100);
        await this.loadAlignmentData(key, async (success, errorMessage) => {
          bibles = {};

          if (success) {
            //const key = `${bible.languageId}_${bible.resourceId}_${(encodeParam(bible.owner))}_${bible.origLang}_testament_${encodeParam(bible.version)}`;
            const [, , , origLang] = key.split('_');
            let books = null;
            let ignoreBooks = null;
            const isNT = origLang === NT_ORIG_LANG;

            if (this.state.dualSearch) {
              books = [...OT_BOOKS, ...NT_BOOKS];
              ignoreBooks = [];
            } else if (isNT) {
              books = NT_BOOKS;
              ignoreBooks = OT_BOOKS;
            } else {
              books = OT_BOOKS;
              ignoreBooks = NT_BOOKS;
            }

            console.log(`selectAlignedBookToSearch(${key}) - setting bible`);
            this.setState({
              [alignmentKey]: key,
              books,
              ignoreBooks,
              isNT,
            });
            this.props.closeAlertDialog();
            console.log(`selectAlignedBookToSearch(${key}) - loading twords index`);
            await this.loadTWordsIndex(key, false, searchNum === 2);
            console.log(`selectAlignedBookToSearch(${key}) - loaded twords index`);
            this.state.searchMaster && this.downloadMasterIfMissing();
          } else {
            console.warn(`selectAlignedBookToSearch(${key}) - ERROR setting bible: ${errorMessage}`);

            if (errorMessage) {
              this.props.openAlertDialog(errorMessage);
            }
          }
          console.log(`selectAlignedBookToSearch(${key}) - finished loading alignment data`);
        }, searchNum);
        console.log(`selectAlignedBookToSearch(${key}) for ${searchNum} - indexing done`);
        this.setState({ selectingAlignments: false });
      } else {
        console.log(`selectAlignedBookToSearch(${key}) for ${searchNum} - already selecting`);
      }
    }
  }

  downloadMasterIfMissing() {
    const message = 'Do you want to download the master branch of the aligned bibles currently selected?';
    this.updateMaster(message, false);
  }

  /**
   * get twords index
   * @param {string} alignmentsKey - alignments key
   * @param {boolean} force - force index generation
   * @param {boolean} secondAlignmentKey - if true then we load second alignments key
   */
  async loadTWordsIndex(alignmentsKey, force = false, secondAlignmentKey = false) {
    const stateKey = secondAlignmentKey ? 'tWordsIndex2' :'tWordsIndex';
    console.log(`loadTWordsIndex(${alignmentsKey}) - starting`);

    if (alignmentsKey && this.state.searchTwords) {
      const resource = parseResourceKey(alignmentsKey);
      const res = addTwordsInfoToResource(resource, USER_RESOURCES_PATH);

      if (!res) { // resource no longer present
        this.setState({ alignedBible: null });
        this.loadAlignmentSearchOptionsWithUI();
        console.log(`loadTWordsIndex(${alignmentsKey}) - resource no longer present`);
        return;
      }

      const tWordsKey = getTwordsKey(res);
      let tWordsIndex = getTwordsIndex(tWordsKey);

      if (tWordsIndex && !force) {
        console.log(`loadTWordsIndex(${alignmentsKey}) - already have index`);
        this.setState({ [stateKey]: tWordsIndex });
      } else {
        console.log(`loadTWordsIndex(${alignmentsKey}) - indexing tWords`);
        const indexingMsg = `Indexing translationWords for '${alignmentsKey}':`;

        const tWordsIndex = await indexTwords(USER_RESOURCES_PATH, resource, async (percent) => {
          await this.showMessage(<> {indexingMsg} <br/>{`${100 - percent}% left`} </>, true);
        });

        console.log(`loadTWordsIndex(${alignmentsKey}) - tWords index finished`);
        this.props.closeAlertDialog();
        saveTwordsIndex(tWordsKey, tWordsIndex);
        this.setState({ [stateKey]: tWordsIndex });
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
    const found = this.getSearchOptions().find(item => item.key === key);
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

    for (const item of showMenuItems) { // see what columns to display
      const selected = this.isItemPresent(values, item.key);
      hide[item.key] = !selected;
    }

    for (const item of this.getSearchFieldOptions()) { // see what fields to search
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

    if (values.includes(SEARCH_DUAL) && !this.state.dualSearch) { // if toggling on dual search
      // on toggle on of dual search, clear any previous bible 2 selections
      basicOptions.alignedBible2 = null;
      basicOptions.alignmentData2 = null;
    }

    if (values.includes(SEARCH_MASTER) && !this.state.searchMaster) { // if toggling on searching of master branch
      this.loadAlignmentSearchOptions(true); // update the list first

      delay(100).then(() => {
        this.downloadMasterIfMissing();
      });
    }

    if (values.includes(REFRESH_MASTER)) {
      const message = 'Do you want to refresh the master branch of the aligned bibles currently selected?';
      this.updateMaster(message, true);
    }

    if (values.includes(CLEAR_INDEX_DATA)) {
      this.props.openOptionDialog('Do you want do delete all cached alignment search data?  This clears out all alignment search data (new as well as old) and downloaded master branch data to free up disk space.  Alignments will be recreated for bibles you select for search.',
        (buttonPressed) => {
          if (buttonPressed === OkButton) {
            deleteCachedAlignmentData();
            this.handleClose();
            this.props.closeAlertDialog();
          } else { // did not want to delete
            this.props.closeAlertDialog();
          }
        },
        OkButton,
        CancelButton);
    }

    const types = {
      ...basicOptions,
      hide,
      searchType,
    };

    this.setState(types);

    if (types.searchTwords !== this.state.searchTwords) { // if changed, reload
      delay(100).then(async () => {
        this.state.searchMaster && this.downloadMasterIfMissing();
        await this.loadAlignmentSearchOptionsWithUI();
        await this.loadTWordsIndex(this.state.alignedBible);
        await this.loadTWordsIndex(this.state.alignedBible, false, true);
      });
    }
  }

  /**
   * if we downloaded or selected master
   * @param bibleKey
   * @param {boolean} isPrimarySearchBible
   * @param {boolean} removeOld
   * @param {boolean} updateAlways - if true, update key always, otherwise only update if current key in=s not master
   */
  async updateBibleKeyToMaster(bibleKey, isPrimarySearchBible, removeOld = false, updateAlways = false) {
    const resource = bibleKey && parseResourceKey(bibleKey);

    if (removeOld) {
      removeIndices(resource);
    }

    if (resource && (updateAlways || (resource.version !== 'master'))) {
      resource.version = 'master';
      const newBiblekey = getKeyForBible(resource, ALIGNMENTS_KEY);

      if (isMasterResourceDownloaded(resource)) {
        if (isPrimarySearchBible) {
          await this.selectAlignedBookToSearch(newBiblekey);
        } else {
          this.setState({ alignedBible2: newBiblekey });
        }
      }
    }
  }

  /**
   * confirm before download of resources
   * @param message
   * @param download - if true, always download
   */
  updateMaster(message, download) {
    if (!this.state.updatingMaster) {
      this.setState({ updatingMaster: true });

      delay(100).then(async () => {
        this.downloadMasterIfMissing();

        const resources = [];
        const bibles = [this.state.alignedBible];

        if (this.state.alignedBible2 && (this.state.searchTwords || this.state.dualSearch)
          && (this.state.alignedBible !== this.state.alignedBible2)) {
          bibles.push(this.state.alignedBible2);
        }

        for (const bibleKey of bibles) {
          const resource = bibleKey && parseResourceKey(bibleKey);

          if (resource) {
            if ((bibleKey === this.state.alignedBible) || (bibleKey === this.state.alignedBible2)) {
              resource.isPrimarySearchBible = true;
            }
            resource.version = 'master';
            resource.bibleKey = getKeyForBible(resource);

            if (!download) {
              if (isMasterResourceDownloaded(resource)) {
                continue; // skip if already downloaded
              }
            }

            resources.push(resource);
          }
        }

        if (!resources.length) { // we didn't need to download, but make sure alignments selected
          for (const bibleKey of bibles) {
            await this.updateBibleKeyToMaster(bibleKey, (bibleKey === this.state.alignedBible) || (bibleKey === this.state.alignedBible2));
          }
          this.setState({ updatingMaster: false });
          return;
        }

        this.props.openOptionDialog(message,
          (buttonPressed) => {
            if (buttonPressed === OkButton) {
              this.props.confirmOnlineAction(
                async () => {
                  let error;
                  const folder = path.join(ALIGNMENT_DATA_DIR);

                  for (const resource_ of resources) {
                    console.log('Downloading', resource_);
                    await this.showMessage(`Downloading: ${resource_.bibleKey}`, true);
                    error = await downloadBible(resource_, folder);

                    if (error) {
                      console.log(`Error downloading ${resource_.bibleKey}`, error);
                      await this.showMessage(`Download Error: ${resource_.bibleKey}`);
                      break;
                    }

                    this.loadAlignmentSearchOptions(true); // update the options
                    await delay(100);
                    this.updateBibleKeyToMaster(resource_.bibleKey, resource_.isPrimarySearchBible, true, true);
                    await this.showMessage(`Downloading: ${resource_.bibleKey}`, true);
                  }

                  this.setState({ updatingMaster: false });

                  if (!error) {
                    this.props.closeAlertDialog();
                  } else {
                    this.props.openOptionDialog(
                      'Download error',
                      () => this.props.closeAlertDialog(),
                      'OK',
                    );
                  }
                },
                () => { // we do not want to go online
                  this.setState({ updatingMaster: false });
                  this.props.closeAlertDialog();
                },
              );
            } else { // did not want to download now
              this.setState({ updatingMaster: false });
              this.props.closeAlertDialog();
            }
          },
          OkButton,
          CancelButton);
      });
    } else {
      console.log(`updateMaster() - already updating`);
    }
  }

  /**
   * when user clicks close, clear search results and call onClose
   */
  handleClose() {
    this.setState({
      alignmentData: null,
      alignmentData2: null,
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
    this.showMessage('Doing Search', true).then(() => {
      this.setState({ found: null });
      const state = this.state;
      const searchTwords = state.searchTwords;
      const config = {
        fullWord: state.matchWholeWord,
        inOrder: state.inOrder,
        caseInsensitive: !state.caseSensitive,
        searchTwords,
        searchLemma: this.isSearchFieldSelected(SEARCH_LEMMA),
        searchSource: this.isSearchFieldSelected(SEARCH_SOURCE),
        searchTarget: this.isSearchFieldSelected(SEARCH_TARGET),
        searchStrong: this.isSearchFieldSelected(SEARCH_STRONG),
        searchRefs: !searchTwords && this.isSearchFieldSelected(SEARCH_REFS),
      };
      let found = [];
      const alignmentData2 = state.dualSearch && state.alignmentData2 || null;

      try {
        found = multiSearchAlignments(state.alignmentData, state.tWordsIndex, state.searchStr, config, alignmentData2, state.tWordsIndex2) || [];
      } catch (e) {
        console.error('AlignmentSearchDialogContainer - search error', e);
        this.showMessage(`Search Error`);
      }

      if (config.searchTwords) {
        getTwordALignments(found, state.alignedBible, bibles, ALIGNED_TEXT);
        getTwordALignments(found, state.alignedBible2, bibles, ALIGNED_TEXT2);
      }

      console.log(`AlignmentSearchDialogContainer - finished search, found ${found.length} items`);
      delay(100).then(() => {
        this.setState({ found });
        this.props.closeAlertDialog();
      });
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

  // get list of bibles for second aligned bible
  getAlignedBibles2() {
    let alignedBibles = [{
      key: '',
      label: '',
    }];

    if (this.state.alignedBibles?.length) {
      alignedBibles = alignedBibles.concat(this.state.alignedBibles);
    }
    return alignedBibles;
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
                value={this.getSelectedOptions(this.getSearchOptions())}
                multiple
                style={{ width: '350px', marginLeft: '20px', marginRight: '20px' }}
                onChange={this.setSearchTypes}
              >
                {this.getSearchOptions().map(item => (
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
          {(this.state.searchTwords || this.state.dualSearch) &&
            <div style={{ display: 'flex' }}>
              <SelectField
                id={'select_search_type'}
                hintText="Select Bible to Search"
                value={this.state.alignedBible2 || ''}
                style={{ width: '400px' }}
                onChange={this.setSearchAlignedBible2}
              >
                {
                  this.getAlignedBibles2()?.map(item => (
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
          }
          { this.showResults() }
        </div>
      </BaseDialog>
    );
  }

  getSearchOptions() {
    const searchOptions_ = [...searchOptions];

    if (this.state.searchMaster) {
      searchOptions_.push(searchOptionRefreshMaster);
    }

    searchOptions_.push(searchOptionClearIndexData);
    return searchOptions_;
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
  confirmOnlineAction: PropTypes.func.isRequired,
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
  confirmOnlineAction: (onConfirm, onCancel) => OnlineModeConfirmActions.confirmOnlineAction(onConfirm, onCancel),
};

export default connect(mapStateToProps, mapDispatchToProps)(AlignmentSearchDialogContainer);
