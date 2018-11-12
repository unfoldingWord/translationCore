import React, {Component} from 'react';
import PropTypes from 'prop-types';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {Card, CardHeader} from 'material-ui';
import {Glyphicon} from 'react-bootstrap';
// helpers
import * as gatewayLanguageHelpers from '../../../helpers/gatewayLanguageHelpers';
import * as ToolCardHelpers from '../../../helpers/ToolCardHelpers';
import {getTranslation} from '../../../helpers/localizationHelpers';
// components
import ToolCardBoxes from './ToolCardBoxes';
import Hint from '../../Hint';
import ToolCardProgress from './ToolCardProgress';
import GlDropDownList from './GlDropDownList.js';
import ToolCardNotificationBadges from './ToolCardNotificationBadges';
import {getGatewayLanguageList, hasValidOL} from "../../../helpers/gatewayLanguageHelpers";

export default class ToolCard extends Component {
  constructor(props) {
    super(props);
    this.selectionChange = this.selectionChange.bind(this);
    this.state = {
      showDescription: false,
      checks: [
        {
          name: 'Key Terms',
          enabled: true
        },
        {
          name: 'Other Terms',
          enabled: false
        },
        {
          name: 'Names',
          enabled: false
        }
      ]
    };
    this.updateCheckSelection = this.updateCheckSelection.bind(this)
  }

  componentWillMount() {
    const name = this.props.metadata.name;
    this.props.actions.getProjectProgressForTools(name);
    if (!this.props.currentProjectToolsSelectedGL[name]) {
      this.selectionChange(gatewayLanguageHelpers.DEFAULT_GATEWAY_LANGUAGE);
    } else {
      this.setState({selectedGL: this.props.currentProjectToolsSelectedGL[name]});
    }
  }

  selectionChange(selectedGL) {
    if (selectedGL && selectedGL.trim()) {
      this.props.actions.setProjectToolGL(this.props.metadata.name, selectedGL);
      this.setState({selectedGL});
    }
  }

  updateCheckSelection(index, value) {
    const newChecks = this.state.checks.splice(0);
    newChecks[index].enabled = value;
    this.setState({
      checks: newChecks
    });
  }

  render() {
    const {metadata: {
      title,
      version,
      description,
      badgeImagePath,
      folderName,
      name
    },
      manifest: {
        project: {id}
      },
      loggedInUser,
      currentProjectToolsProgress,
      translate,
      invalidatedReducer,
      developerMode
    } = this.props;
    const progress = currentProjectToolsProgress[name] ? currentProjectToolsProgress[name] : 0;
    let launchDisableMessage = ToolCardHelpers.getToolCardLaunchStatus(this.state.selectedGL, id, developerMode, translate);
    if (!launchDisableMessage) {
      if (!developerMode) {
        const gatewayLanguageList = getGatewayLanguageList(id, name);
        launchDisableMessage = (gatewayLanguageList && gatewayLanguageList.length) ? null : translate('tools.book_not_supported');
      } else { // developer mode, make sure we have original language
        const olBookPath = hasValidOL(id);
        if (!olBookPath) {
          launchDisableMessage = translate('tools.book_not_supported');
        }
      }
    }
    let desc_key = null;
    switch (name) {
      case 'wordAlignment':
        desc_key = 'tools.alignment_description';
        break;

      case 'translationWords':
        desc_key = 'tools.tw_part1_description';
        break;

      default:
        break;
    }
    let descriptionLocalized = description;
    if (desc_key) {
      descriptionLocalized = getTranslation(translate, desc_key, description);
    }

    return (
      <MuiThemeProvider>
        <Card style={{margin: "6px 0px 10px"}}>
          <img
            style={{float: "left", height: "90px", margin: "10px"}}
            src={badgeImagePath}
          />
          <CardHeader
            title={title}
            titleStyle={{fontWeight: "bold"}}
            subtitle={version}
            style={{display: 'flex', justifyContent: 'space-between'}}>
            <ToolCardNotificationBadges toolName={name} invalidatedReducer={invalidatedReducer} />
          </CardHeader><br />
          <ToolCardProgress progress={progress} />
          <ToolCardBoxes checks={this.state.checks} onChecked={this.updateCheckSelection} />
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
              bookID={id}
              toolName={name}
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
                onClick={() => {this.props.actions.launchTool(folderName, loggedInUser, name)}}
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
  translate: PropTypes.func.isRequired,
  actions: PropTypes.shape({
    getProjectProgressForTools: PropTypes.func.isRequired,
    setProjectToolGL: PropTypes.func.isRequired,
    launchTool: PropTypes.func.isRequired
  }),
  loggedInUser: PropTypes.bool.isRequired,
  currentProjectToolsProgress: PropTypes.object.isRequired,
  currentProjectToolsSelectedGL: PropTypes.object.isRequired,
  metadata: PropTypes.object.isRequired,
  manifest: PropTypes.object.isRequired,
  invalidatedReducer: PropTypes.object.isRequired,
  developerMode: PropTypes.bool.isRequired
};
