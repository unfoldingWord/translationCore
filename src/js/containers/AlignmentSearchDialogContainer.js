/* eslint-disable react/display-name,object-curly-newline */
import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import path from 'path-extra';
import {
  TextField,
  SelectField,
  MenuItem,
  Menu,
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

// selectors
import { getProjectManifest, getSetting } from '../selectors';
// actions
// components
import BaseDialog from '../components/dialogComponents/BaseDialog';
// helpers
import {
  encodeParam,
  getAlignmentsFromResource,
  getSearchableAlignments,
  loadAlignments,
  multiSearchAlignments,
  readDirectory,
} from '../helpers/searchHelper';
import { ALIGNMENT_DATA_PATH, USER_RESOURCES_PATH } from '../common/constants';
import { delay } from '../common/utils';
import { closeAlertDialog, openAlertDialog } from '../actions/AlertModalActions';
import { setSetting } from '../actions/SettingsActions';

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
const searchFieldLabels = {
  [SEARCH_SOURCE]: 'Search Source Words',
  [SEARCH_LEMMA]: 'Search Lemma Words',
  [SEARCH_TARGET]: 'Search Target Words',
  [SEARCH_STRONG]: 'Search Strongs Numbers',
  [SEARCH_REFS]: 'Search References',
};

const SEARCH_CASE_SENSITIVE = 'search_case_sensitive';
const SEARCH_MATCH_WHOLE_WORD = 'search_match_whole_word';
const SEARCH_HIDE_COLUMNS = 'search_hide_columns';

const searchOptions = [
  {
    key: SEARCH_CASE_SENSITIVE,
    label: 'Case Sensitive',
    stateKey: 'caseSensitive',
  },
  {
    key: SEARCH_MATCH_WHOLE_WORD,
    label: 'Match Whole Word',
    stateKey: 'matchWholeWord',
  },
  {
    key: SEARCH_HIDE_COLUMNS,
    label: 'Hide Columns',
  },
];

const SEARCH_SETTINGS_KEY = 'searchSettingsKey';

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
    this.selectColumnHides = this.selectColumnHides.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.open) {
      if (!prevProps.open) { // when dialog is opened
        const savedState = this.props.savedSettings;

        if (savedState && Object.keys(savedState).length) {
          this.setState(_.cloneDeep(savedState));
        }

        delay(100).then(() => {
          this.loadAlignmentSuggestions();
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
  loadAlignmentSuggestions() {
    this.showMessage('Loading Available Aligned Bibles', true).then(() => {
      const tCorePath = path.join(env.home(), 'translationCore');
      const alignedBibles = getSearchableAlignments(tCorePath);

      for (const bible of alignedBibles) {
        const key = `${bible.languageId}_${bible.resourceId}_${(encodeParam(bible.owner))}_${bible.origLang}_testament_${encodeParam(bible.version)}`;
        const label = `${bible.languageId}_${bible.resourceId}/${bible.owner} - ${bible.origLang} - ${bible.version}`;
        bible.key = key;
        bible.label = label;
      }
      this.setState({ alignedBibles });
      this.loadAlignmentData(this.state.alignedBible);
    });
  }

  /**
   * checks if selected bible has an index saved.  If not then an index is first created and saved.  Then the index is
   *    loaded for searching
   * @param {string} selectedBibleKey
   */
  loadAlignmentData(selectedBibleKey) {
    if (selectedBibleKey) {
      this.showMessage('Loading index of Bible alignments for Search', true).then(async () => {
        const resource = this.getResourceForBible(selectedBibleKey);

        if (resource) {
          if (!resource.alignmentCount) {
            const indexingMsg = 'Doing one-time indexing of Bible for Search:';

            await this.showMessage(indexingMsg, true);
            const alignmentData = await getAlignmentsFromResource(USER_RESOURCES_PATH, resource, async (percent) => {
              await this.showMessage(<> {indexingMsg} <br/>{`${100 - percent}% left`} </>, true);
            });

            if (alignmentData?.alignments?.length) {
              resource.alignmentCount = alignmentData?.alignments?.length;
              this.setState({ alignedBibles: this.state.alignedBibles });
              await this.showMessage('Doing one-time indexing of Bible for Search', true);
              this.loadIndexedAlignmentData(resource);
              this.props.closeAlertDialog();
            } else {
              await this.showMessage(`No Alignments found in ${resource.label}`);
              console.error('no alignments');
            }
          } else {
            this.loadIndexedAlignmentData(resource);
            this.props.closeAlertDialog();
          }
        } else {
          this.props.openAlertDialog(`No Aligned Bible found for ${resource.label}`);
          console.log(`loadAlignmentData() no aligned bible match found for ${selectedBibleKey}`);
        }
      });
    } else {
      console.log('loadAlignmentData() no aligned bible');
      this.props.closeAlertDialog();
    }
  }

  selectColumnHides() {
    this.props.openAlertDialog(
      <Menu>
        <MenuItem primaryText="Refresh" />
        <MenuItem primaryText="Help &amp; feedback" />
        <MenuItem primaryText="Settings" />
        <MenuItem primaryText="Sign out" />
      </Menu>
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
   */
  loadIndexedAlignmentData(resource) {
    // check alignment data folder for indexed search data
    const resourcesIndexed = readDirectory(ALIGNMENT_DATA_PATH, false, true, '.json');
    let alignmentData;
    const foundIndexPath = resourcesIndexed?.find((file) => file.indexOf(resource.key) === 0 );

    if (foundIndexPath) {
      alignmentData = loadAlignments(path.join(ALIGNMENT_DATA_PATH, foundIndexPath));
    } else {
      console.log('loadAlignmentDataFromIndex() - did not find index');
    }

    if (alignmentData) {
      console.log('loadAlignmentDataFromIndex() - loaded alignment data');
      this.setState({ alignmentData, found: null });
    } else {
      this.props.openAlertDialog(`No Aligned Bible found for ${resource.label}`);
      console.log('loadAlignmentDataFromIndex() - FAILED to load alignment data');
      this.setState({ alignmentData: null, found: null });
    }
  }

  /**
   * show search results in table
   * @returns {JSX.Element}
   */
  showResults() {
    if (this.state.found) { // if we have search results
      if (this.state.found?.length) { // if search results are not empty, create table to show results
        const data = this.state.found.map(item => {
          const newItem = {
            ...item,
            refStr: item.refs.join('; '),
            count: item.refs?.length,
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
            searchTooltip: 'Filter Results',
            searchPlaceholder: 'Filter Results',
          },
        };

        return (
          <>
            <div style={{ fontWeight: 'bold', color: 'black' }}> {`Found ${this.state?.found.length || 0} matches`} </div>
            <MaterialTable
              columns={[
                { title: 'Source Text', field: 'sourceText', ...originalStyles },
                { title: 'Source Lemma', field: 'sourceLemma', ...originalStyles },
                { title: 'Source Strong', field: 'strong', ...columnStyles },
                { title: 'Target Text', field: 'targetText', ...columnStyles },
                { title: 'Match Count', field: 'count', ...columnStyles },
                { title: 'References', field: 'refStr', ...columnStyles },
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
    this.loadAlignmentData(value);
    this.setState({ alignedBible: value });
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
    const fullWordItem = this.findSearchItem(SEARCH_MATCH_WHOLE_WORD);
    const caseSensitiveItem = this.findSearchItem(SEARCH_CASE_SENSITIVE);

    if (this.isItemSelected(values, SEARCH_HIDE_COLUMNS)) {
      this.selectColumnHides();
      return;
    }

    const types = {
      [fullWordItem.stateKey]: this.isItemSelected(values, SEARCH_MATCH_WHOLE_WORD),
      [caseSensitiveItem.stateKey]: this.isItemSelected(values, SEARCH_CASE_SENSITIVE),
    };

    this.setState(types);
  }

  /**
   * when user clicks close, clear search results and call onClose
   */
  handleClose() {
    this.setState({ alignmentData: null }); // clear data
    const onClose = this.props.onClose;
    onClose && onClose();
  }

  /**
   * when user clicks search button, do search of indexed data
   */
  startSearch() {
    console.log('AlignmentSearchDialogContainer - start search');
    const state = this.state;
    const config = {
      fullWord: state.matchWholeWord,
      caseInsensitive: !state.caseSensitive,
      searchLemma: this.isSearchFieldSelected(SEARCH_LEMMA),
      searchSource: this.isSearchFieldSelected(SEARCH_SOURCE),
      searchTarget: this.isSearchFieldSelected(SEARCH_TARGET),
      searchStrong: this.isSearchFieldSelected(SEARCH_STRONG),
      searchRefs: this.isSearchFieldSelected(SEARCH_REFS),
    };

    // when
    let found = multiSearchAlignments(state.alignmentData, state.searchStr, config) || [];
    found = found?.map(index => state.alignmentData.alignments[index]);
    console.log(`AlignmentSearchDialogContainer - finished search, found ${found.length} items`);
    this.setState({ found });
  }

  /**
   * check state data to see if search option is selected
   * @param {string} key
   * @returns {boolean}
   */
  isSearchFieldSelected(key) {
    const searchType = this.state.searchType;
    return this.isItemSelected(searchType, key);
  }

  /**
   * search array to see if it contains key
   * @param {string[]} array - to search
   * @param {string} key
   * @returns {boolean}
   */
  isItemSelected(array, key) {
    return array && array.indexOf(key) >= 0;
  }

  /**
   * generate list of currently selected search options
   * @param {string} options
   * @returns {string[]}
   */
  getSelectedOptions(options) {
    let selections = options.map(item => !!this.state[item.stateKey] && item.key);
    selections = selections.filter(item => item);
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
                hintText="Select search types"
                value={this.getSelectedOptions(searchOptions)}
                multiple
                style={{ width: '250px', marginLeft: '20px', marginRight: '20px' }}
                onChange={this.setSearchTypes}
              >
                {
                  searchOptions.map(item => (
                    <MenuItem
                      key={item.key}
                      insetChildren={true}
                      checked={this.state[item.stateKey]}
                      value={item.key}
                      primaryText={item.label}
                    />
                  ))
                }
              </SelectField>
            </div>
            <SelectField
              id={'select_search_fields'}
              hintText="Select fields to search"
              value={this.state.searchType}
              multiple
              style={{ width: '300px' }}
              onChange={this.setSearchFields}
            >
              {
                searchFieldOptions.map(item => (
                  <MenuItem
                    key={item}
                    insetChildren={true}
                    checked={this.isSearchFieldSelected(item)}
                    value={item}
                    primaryText={searchFieldLabels[item]}
                  />
                ))
              }
            </SelectField>
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
  closeAlertDialog: PropTypes.func.isRequired,
  saveSettings: PropTypes.func.isRequired,
  savedSettings: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  manifest: getProjectManifest(state),
  savedSettings: getSetting(state, SEARCH_SETTINGS_KEY),
});

const mapDispatchToProps = {
  openAlertDialog: (alertMessage, loading, buttonText = null, callback = null) => openAlertDialog(alertMessage, loading, buttonText, callback),
  closeAlertDialog: () => closeAlertDialog(),
  saveSettings: (value) => setSetting(SEARCH_SETTINGS_KEY, value),
};

export default connect(mapStateToProps, mapDispatchToProps)(AlignmentSearchDialogContainer);
