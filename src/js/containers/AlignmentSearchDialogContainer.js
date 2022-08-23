/* eslint-disable react/display-name,object-curly-newline */
import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import path from 'path-extra';
import { TextField } from 'material-ui';
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
        const columnStyles = {
          cellStyle: {
            fontSize: '16px',
            fontFamily: 'Ezra, Noto Sans',
          },
        };
        return (
          <MaterialTable
            columns={[
              { title: 'Source Text', field: 'sourceText', ...columnStyles },
              { title: 'Source Lemma', field: 'sourceLemma', ...columnStyles },
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
              searchFieldStyle: { fontSize: '16px' },
            }}
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
