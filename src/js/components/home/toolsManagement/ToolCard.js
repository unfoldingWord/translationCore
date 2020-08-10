import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Card, CardHeader } from 'material-ui';
import { Glyphicon } from 'react-bootstrap';
import { connect } from 'react-redux';
import _ from 'lodash';
// helpers
import * as ToolCardHelpers from '../../../helpers/ToolCardHelpers';
import { getTranslation } from '../../../helpers/localizationHelpers';
import { getGatewayLanguageList, hasValidOL } from '../../../helpers/gatewayLanguageHelpers';
import { isToolUsingCurrentOriginalLanguage } from '../../../helpers/originalLanguageResourcesHelpers';
// components
import Hint from '../../Hint';
import {
  getProjectBookId,
  getSetting,
  getCurrentToolName,
} from '../../../selectors';
import {
  WORD_ALIGNMENT, TRANSLATION_WORDS, TRANSLATION_NOTES,
} from '../../../common/constants';
import ToolCardBoxes from './ToolCardBoxes';
import ToolCardProgress from './ToolCardProgress';
import GlDropDownList from './GlDropDownList';
import ToolCardNotificationBadges from './ToolCardNotificationBadges';

class ToolCard extends Component {
  constructor(props) {
    super(props);
    this.selectionChange = this.selectionChange.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.onLaunchClick = this.onLaunchClick.bind(this);
    this.doClickAction = this.doClickAction.bind(this);
    this.loadProgress = _.debounce(this.loadProgress.bind(this), 200);
    this.state = {
      showDescription: false,
      progress: 0,
      selectedCategoriesChanged: false,
      glSelectedChanged: false,
      selectedGL: '',
      gatewayLanguageList: null,
      sourceContentUpdateCount: -1,
    };
  }

  componentWillMount() {
    let { glSelected: selectedGL } = this.props;
    const gatewayLanguageList = this.updateGlList();

    // if there is only one gateway Language then select it as the GL for the tool card.
    if (gatewayLanguageList.length === 1) {
      selectedGL = gatewayLanguageList[0].code;
    }
    this.selectionChange(selectedGL);
    this.setState({ selectedGL });
  }

  componentDidMount() {
    this.loadProgress();
  }

  componentDidUpdate(prevProps) {
    const glSelectedChanged = prevProps.glSelected !== this.props.glSelected;

    if (glSelectedChanged) {
      this.setState({ glSelectedChanged });
    }

    if (!_.isEqual(prevProps.selectedCategories, this.props.selectedCategories)) {
      this.setState({ selectedCategoriesChanged: true });
      this.loadProgress();
    }

    if (this.props.sourceContentUpdateCount !== this.state.sourceContentUpdateCount) {
      this.updateGlList();
    }
  }

  updateGlList() {
    let {
      tool,
      bookId,
      sourceContentUpdateCount,
    } = this.props;
    const gatewayLanguageList = getGatewayLanguageList(bookId, tool.name);
    this.setState({ gatewayLanguageList, sourceContentUpdateCount }); // this GL list correlates with this update count
    return gatewayLanguageList;
  }

  loadProgress() {
    const { tool, actions } = this.props;
    const { progress } = this.state;

    setTimeout(() => {
      const results = {};
      // TODO: This is an antipattern. Should update the state and use the prop coming from the state instead of assigning the result to an argument.
      actions.getProjectProgressForTools(tool.name, results);
      const toolProgress = results.progress;

      if (progress !== toolProgress) {
        this.setState({ progress: toolProgress ? toolProgress : 0 });
      }
    }, 0);
  }

  selectionChange(selectedGL) {
    if (selectedGL && selectedGL.trim()) {
      this.props.actions.setProjectToolGL(this.props.tool.name, selectedGL);
      this.setState({ selectedGL });
      this.loadProgress();
    }
  }

  getLaunchDisableMessage(id, developerMode, translate, name, selectedCategories) {
    const toolsWithCategories = [TRANSLATION_WORDS , TRANSLATION_NOTES];
    let launchDisableMessage = ToolCardHelpers.getToolCardLaunchStatus(this.state.selectedGL, id, developerMode, translate);

    if (!launchDisableMessage) { // if no errors, make sure we have original language
      const olBookPath = hasValidOL(id);

      if (!olBookPath) {
        launchDisableMessage = translate('tools.book_not_supported');
      }
    }

    if (!launchDisableMessage && !developerMode) { // if no errors and not developer mode , make sure we have a gateway language
      const { gatewayLanguageList } = this.state;
      launchDisableMessage = (gatewayLanguageList && gatewayLanguageList.length) ? null : translate('tools.book_not_supported');
    }

    if (!launchDisableMessage && (toolsWithCategories.includes(name) && selectedCategories.length === 0)) {
      launchDisableMessage = translate('tools.no_checks_selected');
    }

    return launchDisableMessage;
  }

  /**
   * Handles selecting the tool
   */
  handleSelect() {
    const { onSelect, tool } = this.props;
    onSelect(tool.name);
  }

  onLaunchClick() {
    const {
      tool,
      translate,
      isToolUsingCurrentOriginalLanguage,
      actions: {
        openOptionDialog,
        closeAlertDialog,
      },
    } = this.props;
    const newSelectedToolName = tool.name;

    if (newSelectedToolName === TRANSLATION_NOTES) {
      const isCurrentOL = isToolUsingCurrentOriginalLanguage(newSelectedToolName);

      if (!isCurrentOL) {
        const continueButtonText = translate('buttons.continue_button');
        const cancelButtonText = translate('buttons.cancel_button');

        openOptionDialog(translate('tools.tN_version_warning'), (result) => {
          closeAlertDialog();

          if (result === continueButtonText) {
            this.doClickAction();
          }
        }, cancelButtonText, continueButtonText);
        return;
      }
    }

    this.doClickAction();
  }

  doClickAction() {
    const {
      isOLBookVersionMissing,
      toggleHomeView,
      currentToolName,
      tool,
      actions: { warnOnInvalidations },
    } = this.props;
    const { selectedCategoriesChanged, glSelectedChanged } = this.state;
    const newCurrentToolName = tool.name;

    if (isOLBookVersionMissing) {
      // Show dialog with option to download missing resource
      this.props.onMissingResource();
    } else if (currentToolName && !glSelectedChanged && !selectedCategoriesChanged && (currentToolName === newCurrentToolName)) {
      // Show tool (Without loading tool data)
      toggleHomeView(false);
      warnOnInvalidations(newCurrentToolName);
    } else {
      // Load tool data then show tool
      this.handleSelect();
    }
  }

  render() {
    const {
      tool,
      bookId,
      translate,
      developerMode,
      actions: {
        updateCategorySelection,
        updateSubcategorySelection,
      },
      selectedCategories,
      availableCategories,
    } = this.props;
    const {
      progress, selectedGL, gatewayLanguageList,
    } = this.state;
    const launchDisableMessage = this.getLaunchDisableMessage(bookId, developerMode, translate, tool.name, selectedCategories);
    let desc_key = null;
    let showCheckBoxes = false;

    switch (tool.name) {
    case WORD_ALIGNMENT:
      desc_key = 'tools.alignment_description';
      break;

    case TRANSLATION_WORDS:
      showCheckBoxes = true;
      desc_key = 'tools.tw_part1_description';
      break;

    case TRANSLATION_NOTES:
      showCheckBoxes = true;
      break;

    default:
      break;
    }

    let descriptionLocalized = tool.description;

    if (desc_key) {
      descriptionLocalized = getTranslation(translate, desc_key, tool.description);
    }

    return (
      <MuiThemeProvider>
        <Card style={{ margin: '6px 0px 10px' }}>
          <img
            alt={tool.name}
            style={{
              float: 'left', height: '90px', margin: '10px',
            }}
            src={tool.badge}
          />
          <CardHeader
            title={tool.title}
            titleStyle={{ fontWeight: 'bold' }}
            subtitle={tool.version}
            style={{ display: 'flex', justifyContent: 'space-between' }}>
            <ToolCardNotificationBadges tool={tool} translate={translate} selectedCategories={selectedCategories} />
          </CardHeader><br />
          <ToolCardProgress progress={progress} />
          {
            showCheckBoxes &&
            <ToolCardBoxes
              key={selectedGL}
              toolName={tool.name}
              selectedCategories={selectedCategories}
              availableCategories={availableCategories}
              onCategoryChecked={updateCategorySelection}
              onSubcategoryChecked={updateSubcategorySelection}
              bookId={bookId}
              translate={translate}
              selectedGL={selectedGL}
            />
          }
          {this.state.showDescription ?
            (<div>
              <span style={{
                fontWeight: 'bold', fontSize: '16px', margin: '0px 10px 10px',
              }}>{translate('tools.description')}</span>
              <p style={{ padding: '10px' }}>
                {descriptionLocalized}
              </p>
            </div>) : (<div />)
          }
          <div style={{
            display: 'flex', justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div
                style={{
                  padding: '10px 10px 0px', fontSize: '18px', cursor: 'pointer',
                }}
                onClick={() => this.setState({ showDescription: !this.state.showDescription })}
              >
                <span>{this.state.showDescription ? translate('tools.see_less') : translate('tools.see_more')}</span>
                <Glyphicon
                  style={{ fontSize: '18px', margin: '0px 0px 0px 6px' }}
                  glyph={this.state.showDescription ? 'chevron-up' : 'chevron-down'}
                />
              </div>
            </div>
            <GlDropDownList
              translate={translate}
              selectedGL={this.state.selectedGL}
              selectionChange={this.selectionChange}
              gatewayLanguageList={gatewayLanguageList}
            />
            <Hint
              position={'left'}
              size='medium'
              label={launchDisableMessage}
              enabled={!!launchDisableMessage}
            >
              <button
                disabled={!!launchDisableMessage}
                className='btn-prime'
                onClick={this.onLaunchClick}
                style={{ width: '90px', margin: '10px' }}
              >
                {translate('buttons.launch_button')}
              </button>
            </Hint>
          </div>
        </Card>
      </MuiThemeProvider>
    );
  }
}

ToolCard.propTypes = {
  onSelect: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
  bookId: PropTypes.string.isRequired,
  tool: PropTypes.object.isRequired,
  developerMode: PropTypes.bool.isRequired,
  actions: PropTypes.shape({
    getProjectProgressForTools: PropTypes.func.isRequired,
    setProjectToolGL: PropTypes.func.isRequired,
    updateSubcategorySelection: PropTypes.func.isRequired,
    updateCategorySelection: PropTypes.func.isRequired,
    warnOnInvalidations: PropTypes.func.isRequired,
    openOptionDialog: PropTypes.func.isRequired,
    closeAlertDialog: PropTypes.func.isRequired,
  }),
  selectedCategories: PropTypes.array.isRequired,
  availableCategories: PropTypes.object.isRequired,
  isOLBookVersionMissing: PropTypes.bool.isRequired,
  onMissingResource: PropTypes.func.isRequired,
  currentToolName: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
  ]).isRequired,
  toggleHomeView: PropTypes.func.isRequired,
  glSelected: PropTypes.string.isRequired,
  sourceContentUpdateCount: PropTypes.number.isRequired,
  isToolUsingCurrentOriginalLanguage: PropTypes.func.isRequired,
};

ToolCard.contextTypes = { store: PropTypes.any };

const mapStateToProps = (state) => ({
  bookId: getProjectBookId(state),
  developerMode: getSetting(state, 'developerMode'),
  currentToolName: getCurrentToolName(state),
  isToolUsingCurrentOriginalLanguage: (toolName) => (isToolUsingCurrentOriginalLanguage(state, toolName)),
});

export default connect(mapStateToProps)(ToolCard);
