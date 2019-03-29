import React, {Component} from 'react';
import PropTypes from 'prop-types';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {Card, CardHeader} from 'material-ui';
import {Glyphicon} from 'react-bootstrap';
// helpers
import * as ToolCardHelpers from '../../../helpers/ToolCardHelpers';
import {getTranslation} from '../../../helpers/localizationHelpers';
// components
import ToolCardBoxes from './ToolCardBoxes';
import Hint from '../../Hint';
import ToolCardProgress from './ToolCardProgress';
import GlDropDownList from './GlDropDownList.js';
import ToolCardNotificationBadges from './ToolCardNotificationBadges';
import {getGatewayLanguageList, hasValidOL} from "../../../helpers/gatewayLanguageHelpers";
import {
  getProjectBookId, getSetting,
  getToolGatewayLanguage
} from "../../../selectors";
import { connect } from "react-redux";
import _ from "lodash";

class ToolCard extends Component {
  constructor(props) {
    super(props);
    this.selectionChange = this.selectionChange.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.loadProgress = _.debounce(this.loadProgress.bind(this), 200);
    this.state = {
      showDescription: false,
      progress: 0
    };
  }

  loadProgress() {
    const {tool, selectedCategories} = this.props;
    const {progress} = this.state;

    if(tool.api.methodExists("getProgress")) {
      setTimeout(() => {
        const toolProgress = tool.api.trigger("getProgress", selectedCategories);
        if(progress !== toolProgress) {
          this.setState({
            progress: toolProgress ? toolProgress : 0
          });
        }
      }, 0);
    }
  }

  componentDidMount() {
    this.loadProgress();
  }

  componentDidUpdate(prevProps) {
    if(!_.isEqual(prevProps.selectedCategories, this.props.selectedCategories)) {
      this.loadProgress();
    }
  }

  componentWillMount() {
    const {store} = this.context;
    const name = this.props.tool.name;
    const gatewayLanguage = getToolGatewayLanguage(store.getState(), name);
    this.selectionChange(gatewayLanguage);
    this.setState({
      selectedGL: gatewayLanguage
    });
  }

  selectionChange(selectedGL) {
    if (selectedGL && selectedGL.trim()) {
      this.props.actions.setProjectToolGL(this.props.tool.name, selectedGL);
      this.setState({selectedGL});
    }
  }

  getLaunchDisableMessage(id, developerMode, translate, name, selectedCategories) {
    let launchDisableMessage = ToolCardHelpers.getToolCardLaunchStatus(this.state.selectedGL, id, developerMode, translate);
    if (!launchDisableMessage) { // if no errors, make sure we have original language
      const olBookPath = hasValidOL(id);
      if (!olBookPath) {
        launchDisableMessage = translate('tools.book_not_supported');
      }
    }
    if (!launchDisableMessage && !developerMode) { // if no errors and not developer mode , make sure we have a gateway language
      const gatewayLanguageList = getGatewayLanguageList(id, name);
      launchDisableMessage = (gatewayLanguageList && gatewayLanguageList.length) ? null : translate('tools.book_not_supported');
    }
    if (!launchDisableMessage && (name === 'translationWords' && selectedCategories.length === 0)) {
      launchDisableMessage = translate('tools.no_checks_selected');
    }
    return launchDisableMessage;
  }

  /**
   * Handles selecting the tool
   */
  handleSelect() {
    const {onSelect, tool} = this.props;
    onSelect(tool.name);
  }

  render() {
    const {
      tool,
      bookId,
      translate,
      developerMode,
      actions: {
        updateCheckSelection,
        showPopover,
        closePopover
      },
      selectedCategories,
      availableCategories
    } = this.props;
    const {progress, selectedGL} = this.state;

    const launchDisableMessage = this.getLaunchDisableMessage(bookId, developerMode, translate, tool.name, selectedCategories);
    let desc_key = null;
    let showCheckBoxes = false;
    switch (tool.name) {
      case 'wordAlignment':
        desc_key = 'tools.alignment_description';
        break;

      case 'translationWords':
        showCheckBoxes = true;
        desc_key = 'tools.tw_part1_description';
        break;

      case 'translationNotes':
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
        <Card style={{margin: "6px 0px 10px"}}>
          <img
            alt={tool.name}
            style={{float: "left", height: "90px", margin: "10px"}}
            src={tool.badge}
          />
          <CardHeader
            title={tool.title}
            titleStyle={{fontWeight: "bold"}}
            subtitle={tool.version}
            style={{display: 'flex', justifyContent: 'space-between'}}>
            <ToolCardNotificationBadges tool={tool} translate={translate} selectedCategories={selectedCategories} />
          </CardHeader><br />
          <ToolCardProgress progress={progress} />
          {showCheckBoxes && <ToolCardBoxes 
            toolName={tool.name} 
            selectedCategories={selectedCategories} 
            availableCategories={availableCategories} 
            onChecked={updateCheckSelection}
            bookId={bookId}
            translate={translate}
            selectedGL={selectedGL}
            showPopover={showPopover}
            closePopover={closePopover}
          />}
          {this.state.showDescription ?
            (<div>
              <span style={{fontWeight: "bold", fontSize: "16px", margin: "0px 10px 10px"}}>{translate('tools.description')}</span>
              <p style={{padding: "10px"}}>
                {descriptionLocalized}
              </p>
            </div>) : (<div />)
          }
          <div style={{display: "flex", justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center'}}>
            <div style={{display: "flex", justifyContent: "space-between"}}>
              <div
                style={{padding: "10px 10px 0px", fontSize: "18px", cursor: "pointer"}}
                onClick={() => this.setState({showDescription: !this.state.showDescription})}
              >
                <span>{this.state.showDescription ? translate('tools.see_less') : translate('tools.see_more')}</span>
                <Glyphicon
                  style={{fontSize: "18px", margin: "0px 0px 0px 6px"}}
                  glyph={this.state.showDescription ? "chevron-up" : "chevron-down"}
                />
              </div>
            </div>
            <GlDropDownList
              translate={translate}
              selectedGL={this.state.selectedGL}
              selectionChange={this.selectionChange}
              bookID={bookId}
              toolName={tool.name}
            />
            <Hint
              position={'left'}
              size='medium'
              label={launchDisableMessage}
              enabled={launchDisableMessage ? true : false}
            >
              <button
                disabled={launchDisableMessage ? true : false}
                className='btn-prime'
                onClick={this.handleSelect}
                style={{width: '90px', margin: '10px'}}
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
    updateCheckSelection: PropTypes.func.isRequired
  }),
  selectedCategories: PropTypes.array.isRequired,
  availableCategories: PropTypes.object.isRequired
};

ToolCard.contextTypes = {
  store: PropTypes.any
};

const mapStateToProps = (state) => ({
  bookId: getProjectBookId(state),
  developerMode: getSetting(state, 'developerMode')
});

export default connect(mapStateToProps)(ToolCard);
