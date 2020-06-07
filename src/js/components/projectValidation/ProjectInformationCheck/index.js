import React, { Component } from 'react';
import PropTypes from 'prop-types';
// components
import { Card } from 'material-ui/Card';
import ReactDOMServer from 'react-dom/server';
import ProjectValidationContentWrapper from '../ProjectValidationContentWrapper';
import { getIsOverwritePermitted } from '../../../selectors';
import BookDropdownMenu from './BookDropdownMenu';
import TextPrompt from './TextPrompt';
import LanguageIdTextBox from './LanguageIdTextBox';
import LanguageNameTextBox from './LanguageNameTextBox';
import LanguageDirectionDropdownMenu from './LanguageDirectionDropdownMenu';
import ProjectFontDropdownMenu from './ProjectFontDropdownMenu';
import ContributorsArea from './ContributorsArea';
import CheckersArea from './CheckersArea';

class ProjectInformationCheck extends Component {
  constructor() {
    super();
    this.state = {
      contributorsRequiredFieldMessage: false,
      checkersRequiredFieldMessage: false,
      showOverwriteButton: false,
    };
  }

  addContributor() {
    let { contributors } = this.props.reducers.projectInformationCheckReducer;

    // if an empty text field has been created then dont add a new one until it is filled.
    if (contributors.includes('')) {
      this.setState({ contributorsRequiredFieldMessage: true });
    } else {
      // avoiding editing the original reference of the array
      const newContributors = contributors.slice();
      newContributors.unshift('');
      this.props.actions.setContributorsInProjectInformationReducer(newContributors);
    }
  }

  addChecker() {
    let { checkers } = this.props.reducers.projectInformationCheckReducer;

    // if an empty text field has been created then dont add a new one until it is filled.
    if (checkers.includes('')) {
      this.setState({ checkersRequiredFieldMessage: true });
    } else {
      // avoiding editing the original reference of the array
      const newCheckers = checkers.slice();
      newCheckers.unshift('');
      this.props.actions.setCheckersInProjectInformationReducer(newCheckers);
    }
  }

  removeContributor(selectedIndex) {
    const { contributors } = this.props.reducers.projectInformationCheckReducer;
    const newContributorsArray = contributors.filter((element, index) => index !== selectedIndex);
    this.setState({ contributorsRequiredFieldMessage: false });
    this.props.actions.setContributorsInProjectInformationReducer(newContributorsArray);
  }

  removeChecker(selectedIndex) {
    const { checkers } = this.props.reducers.projectInformationCheckReducer;
    const newCheckersArray = checkers.filter((element, index) => index !== selectedIndex);
    this.setState({ checkersRequiredFieldMessage: false });
    this.props.actions.setCheckersInProjectInformationReducer(newCheckersArray);
  }

  displayOverwriteButton(enable) {
    if (this.state.showOverwriteButton !== enable) {
      this.setState({ showOverwriteButton: enable });
      this.props.actions.displayOverwriteButton(enable);
    }
  }

  shouldComponentUpdate(nextProps) {
    let changed = this.changed(nextProps,'bookId');
    changed = changed || this.changed(nextProps,'languageId');
    changed = changed || this.changed(nextProps,'languageName');
    changed = changed || this.changed(nextProps,'languageDirection');
    changed = changed || this.changed(nextProps,'contributors');
    changed = changed || this.changed(nextProps,'checkers');
    changed = changed || this.changed(nextProps,'resourceId');
    changed = changed || this.changed(nextProps,'nickname');
    return changed;
  }

  changed(nextProps, property) {
    let oldProp = this.props.reducers.projectInformationCheckReducer[property];
    let newProp = nextProps.reducers.projectInformationCheckReducer[property];

    if (property === 'checkers' || property === 'contributors') {
      oldProp = false;
    } newProp = true;
    return oldProp !== newProp;
  }

  /**
   * limit string length
   * @param {String} text
   * @param {Int} len
   */
  limitStringLength(text, len) {
    if (text && (text.length > len)) {
      return text.substr(0, len);
    }
    return text;
  }

  render() {
    const {
      bookId,
      resourceId,
      nickname,
      languageId,
      languageName,
      languageDirection,
      contributors,
      checkers,
      projectFont,
    } = this.props.reducers.projectInformationCheckReducer;
    const { projectSaveLocation } = this.props.reducers.projectDetailsReducer;
    const { developerMode } = this.props.reducers.settingsReducer.currentSettings;
    const { translate } = this.props;
    const overWritePermitted = getIsOverwritePermitted(this.props.reducers);
    const instructions = (
      <div>
        <p>
          {translate('project_validation.project_information_missing')}
        </p><br /><br />
        <h4>{translate('project_validation.attention')}</h4>
        <p>
          {translate('project_validation.publicly_available')}
        </p>
      </div>
    );
    const maxResourceIdLength = 4;

    /**
     * checks resourceId for warnings, if there is a warning it will be translated
     * @param text
     * @return {*}
     */
    function getResourceIdWarning(text) {
      const duplicateWarning = this.props.actions.getDuplicateProjectWarning(text, languageId, bookId, projectSaveLocation);
      this.props.actions.displayOverwriteButton(overWritePermitted && !!duplicateWarning);
      let warning = this.props.actions.getResourceIdWarning(text);

      if (!warning) { // if valid resource, check for conflicting projects
        warning = duplicateWarning;
      }

      if (warning) {
        warning = translate(warning);
      }
      return warning;
    }

    /**
     * gets the info hint.  The complication is that if there is html in the string, translate() will return as
     *  a react element (object) that is not displayable as hint, so we need to convert to simple html and remove
     *  the <span></span> wrapper
     * @return {*}
     */
    function getResourceInfoHint() {
      const infoText = translate('project_validation.resource_id.info');

      if (typeof infoText !== 'string') { // if translate wrapped as react element
        let html = ReactDOMServer.renderToStaticMarkup(infoText);

        if (html) {
          // remove span wrapper if present
          let parts = html.split('<span>');
          html = parts[0] || parts[1];
          parts = html.split('</span>');
          html = parts[0];
          return html;
        }
      }
      return infoText;
    }

    return (
      <ProjectValidationContentWrapper translate={translate}
        instructions={instructions}>
        {translate('project_information')}
        <Card
          id="project-information-card"
          style={{ width: '100%', height: '100%' }}
          containerStyle={{
            overflowY: 'auto', overflowX: 'hidden', height: '100%',
          }}
        >
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: '#cd0033', margin: '10px 10px 0px' }}>* {translate('required')}</span>
          </div>
          <div style={{ width: '100%' }}>
            <div className={'project-details-table'}>
              <div className={'project-details-left-column project-details-column'}>
                <LanguageNameTextBox
                  id={'Language-Name-TextBox-AutoComplete'}
                  className={'project-details-item language-name-textbox select-field'}
                  translate={translate}
                  languageName={languageName}
                  languageId={languageId}
                  updateLanguageName={(languageName) => this.props.actions.setLanguageNameInProjectInformationReducer(languageName)}
                  updateLanguageId={(languageId) => this.props.actions.setLanguageIdInProjectInformationReducer(languageId)}
                  updateLanguageSettings={(languageId, languageName, languageDirection) => this.props.actions.setAllLanguageInfoInProjectInformationReducer(languageId, languageName, languageDirection)}
                />
              </div>
              <div className={'project-details-right-column project-details-column'}>
                <TextPrompt
                  id={'resource_id'}
                  className={'project-details-item text-prompt'}
                  getErrorMessage={(text) => getResourceIdWarning.call(this, text)}
                  text={resourceId}
                  title={translate('projects.resource_id')}
                  updateText={(resourceId) => this.props.actions.setResourceIDInProjectInformationReducer(this.limitStringLength(resourceId, maxResourceIdLength))}
                  required={true}
                  infoText={getResourceInfoHint()}
                />
              </div>
              <div className={'project-details-left-column project-details-column'}>
                <LanguageIdTextBox
                  id={'Language-Id-TextBox-AutoComplete'}
                  className={'project-details-item language-id-textbox select-field'}
                  translate={translate}
                  languageId={languageId}
                  updateLanguageName={(languageName) => this.props.actions.setLanguageNameInProjectInformationReducer(languageName)}
                  updateLanguageId={(languageId) => this.props.actions.setLanguageIdInProjectInformationReducer(languageId)}
                  updateLanguageSettings={(languageId, languageName, languageDirection) => this.props.actions.setAllLanguageInfoInProjectInformationReducer(languageId, languageName, languageDirection)}
                />
              </div>
              <div className={'project-details-right-column project-details-column'}>
                <TextPrompt
                  id={'nickname'}
                  className={'project-details-item text-prompt'}
                  getErrorMessage={() => null}
                  text={nickname}
                  title={translate('projects.nickname')}
                  updateText={(nickname) => this.props.actions.setNicknameInProjectInformationReducer(nickname)}
                  required={false}
                  infoText={''}
                />
              </div>
              <div className={'project-details-left-column project-details-column'}>
                <LanguageDirectionDropdownMenu
                  id={'language-direction-SelectField'}
                  className={'project-details-item language-dirction-select select-field'}
                  translate={translate}
                  languageDirection={languageDirection}
                  updateLanguageDirection={(languageDirection) => this.props.actions.setLanguageDirectionInProjectInformationReducer(languageDirection)}
                />
              </div>
              <div className={'project-details-right-column project-details-column'}>
                <BookDropdownMenu
                  id={'book-dropdown-menu-selectField'}
                  className={'project-details-item book-dropdown-menu-select select-field'}
                  translate={translate}
                  bookId={bookId}
                  updateBookId={(bookId) => this.props.actions.setBookIDInProjectInformationReducer(bookId, true)}
                  developerMode={developerMode}
                />
              </div>
              <div className={'project-details-left-column project-details-column'}>
                <ProjectFontDropdownMenu
                  id={'project-font-SelectField'}
                  className={'project-details-item project-font-select select-field'}
                  translate={translate}
                  projectFont={projectFont}
                  updateProjectFont={(projectFont) => this.props.actions.updateProjectFont(projectFont)}
                />
              </div>
              <div className={'project-details-right-column project-details-column'}>

              </div>
              <div className={'project-details-left-column project-details-column'}>
                <ContributorsArea
                  id={'contributor-area'}
                  className={'project-details-item contributor-area'}
                  translate={translate}
                  contributors={contributors}
                  addContributor={this.addContributor.bind(this)}
                  removeContributor={this.removeContributor.bind(this)}
                  contributorsRequiredFieldMessage={this.state.contributorsRequiredFieldMessage}
                  updateContributorName={(contributorName, index) => {
                    this.setState({ contributorsRequiredFieldMessage: false });
                    this.props.actions.updateContributorName(contributorName, index);
                  }}
                />
              </div>
              <div className={'project-details-right-column project-details-column'}>
                <CheckersArea
                  id={'checkers-area'}
                  className={'project-details-item checkers-area'}
                  translate={translate}
                  checkers={checkers}
                  addChecker={this.addChecker.bind(this)}
                  removeChecker={this.removeChecker.bind(this)}
                  checkersRequiredFieldMessage={this.state.checkersRequiredFieldMessage}
                  updateCheckerName={(checkerName, index) => {
                    this.setState({ checkersRequiredFieldMessage: false });
                    this.props.actions.updateCheckerName(checkerName, index);
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      </ProjectValidationContentWrapper>
    );
  }
}

ProjectInformationCheck.propTypes = {
  translate: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  reducers: PropTypes.object.isRequired,
};

export default ProjectInformationCheck;
