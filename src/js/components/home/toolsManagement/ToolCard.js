import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Hint from '../../Hint';
import * as LanguageHelpers from '../../../helpers/LanguageHelpers';
import * as ToolCardHelpers from '../../../helpers/ToolCardHelpers';
import { getTranslation } from '../../../helpers/localizationHelpers';

// components
import { Card, CardHeader } from 'material-ui';
import { Glyphicon } from 'react-bootstrap';
import ToolCardProgress from './ToolCardProgress';
import GlDropDownList from './GlDropDownList.js';

export default class ToolCard extends Component {
  constructor(props) {
    super(props);
    this.selectionChange = this.selectionChange.bind(this);
    this.state = {
      showDescription: false
    };
  }

  selectionChange(selectedGL){
    this.props.actions.setProjectToolGL(this.props.metadata.name, selectedGL);
    this.setState({selectedGL});
  }

  componentWillMount() {
    const name = this.props.metadata.name;
    this.props.actions.getProjectProgressForTools(name);
    if (! this.props.currentProjectToolsSelectedGL[name]) {
      this.selectionChange(LanguageHelpers.DEFAULT_GATEWAY_LANGUAGE);
    } else {
      this.setState({selectedGL: this.props.currentProjectToolsSelectedGL[name]});
    }
  }

  render() {
    const { metadata: {
              title,
              version,
              description,
              badgeImagePath,
              folderName,
              name
            },
            manifest: {
              project: { id }
            },
            loggedInUser,
            currentProjectToolsProgress,
            translate,
            developerMode
          } = this.props;
    const progress = currentProjectToolsProgress[name] ? currentProjectToolsProgress[name] : 0;
    const launchStatus = ToolCardHelpers.getToolCardLaunchStatus(name, this.state.selectedGL, id, developerMode, translate);
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
        <Card style={{ margin: "6px 0px 10px" }}>
          <img
            style={{ float: "left", height: "90px", margin: "10px" }}
            src={badgeImagePath}
          />
          <CardHeader
            title={title}
            titleStyle={{ fontWeight: "bold" }}
            subtitle={version}
          /><br />
          <ToolCardProgress progress={progress} />
          {this.state.showDescription ?
            (<div>
              <span style={{ fontWeight: "bold", fontSize: "16px", margin: "0px 10px 10px" }}>{translate('tools.description')}</span>
              <p style={{ padding: "10px" }}>
              {descriptionLocalized}
              </p>
            </div>) : (<div />)
          }
          <div style={{ display: "flex", justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div
                style={{ padding: "10px 10px 0px", fontSize: "18px", cursor: "pointer" }}
                onClick={() => this.setState({ showDescription: !this.state.showDescription})}
              >
                <span>{this.state.showDescription ? translate('tools.see_less') : translate('tools.see_more')}</span>
                <Glyphicon
                  style={{ fontSize: "18px", margin: "0px 0px 0px 6px" }}
                  glyph={this.state.showDescription ? "chevron-up" : "chevron-down"}
                />
              </div>
            </div>
            <GlDropDownList
              translate={translate}
              selectedGL={this.state.selectedGL}
              selectionChange={this.selectionChange}
              bookID={id}
            />
            <Hint
                position={'left'}
                size='medium'
                label={launchStatus}
                enabled={launchStatus?true:false}
            >
              <button
                disabled={launchStatus?true:false}
                className='btn-prime'
                onClick={() => {this.props.actions.launchTool(folderName, loggedInUser, name)}}
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
  developerMode: PropTypes.bool.isRequired
};
