import React, { Component } from 'react';
import PropTypes from 'prop-types';
// components
import { Card } from 'material-ui/Card';
import BookDropdownMenu from './BookDropdownMenu';
import LanguageIdTextBox from './LanguageIdTextBox';
import LanguageNameTextBox from './LanguageNameTextBox';
import LanguageDirectionDropdownMenu from './LanguageDirectionDropdownMenu';
import ContributorsArea from './ContributorsArea';
import CheckersArea from './CheckersArea';
import ProjectValidationContentWrapper from '../ProjectValidationContentWrapper';

class ProjectInformationCheck extends Component {

  addContributor() {
    let { contributors } = this.props.reducers.projectInformationCheckReducer;
    contributors.unshift('');

    this.props.actions.setContributorsInProjectInformationReducer(contributors);
  }

  addChecker() {
    let { checkers } = this.props.reducers.projectInformationCheckReducer;
    checkers.unshift('');

    this.props.actions.setCheckersInProjectInformationReducer(checkers);
  }

  removeContributor(selectedIndex) {
    let { contributors } = this.props.reducers.projectInformationCheckReducer;
    let newContributorsArray = contributors.filter((element, index) => {
      return index !== selectedIndex;
    });

    this.props.actions.setContributorsInProjectInformationReducer(newContributorsArray);
  }

  removeChecker(selectedIndex) {
    let { checkers } = this.props.reducers.projectInformationCheckReducer;
    let newCheckersArray = checkers.filter((element, index) => {
      return index !== selectedIndex;
    });

    this.props.actions.setCheckersInProjectInformationReducer(newCheckersArray);
  }

  shouldComponentUpdate(nextProps) {
    let changed = this.changed(nextProps,'bookId');
    changed = changed || this.changed(nextProps,'languageId');
    changed = changed || this.changed(nextProps,'languageName');
    changed = changed || this.changed(nextProps,'languageDirection');
    changed = changed || this.changed(nextProps,'contributors');
    changed = changed || this.changed(nextProps,'checkers');
    return changed;
  }

  changed(nextProps, property) {
    const oldProp = this.props.reducers.projectInformationCheckReducer[property];
    const newProp = nextProps.reducers.projectInformationCheckReducer[property];
    return oldProp !== newProp;
  }

  render() {
    const {
      bookId,
      languageId,
      languageName,
      languageDirection,
      contributors,
      checkers
    } = this.props.reducers.projectInformationCheckReducer;
    const {translate} = this.props;
    const instructions = (
      <div>
        <p>
          {translate('home.project.validate.information_instructions')}
        </p><br /><br />
        <h4>{translate('attention_header')}</h4>
        <p>
          {translate('home.project.validate.publicly_available_notice')}
        </p>
      </div>
    );

    return (
      <ProjectValidationContentWrapper translate={translate}
                                       instructions={instructions}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {translate('home.project.project_information')}
          <Card
            style={{ width: '100%', height: '100%' }}
            containerStyle={{ overflowY: 'auto', overflowX: 'hidden', height: '100%' }}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{ color: '#cd0033', margin: '10px 10px 0px' }}>* {translate('required')}</span>
            </div>
            <table style={{ display: 'flex', justifyContent: 'center', marginLeft: '-15px' }}>
              <tbody>
              <tr>
                <td>
                  <BookDropdownMenu
                    translate={translate}
                    bookId={bookId}
                    updateBookId={(bookId) => this.props.actions.setBookIDInProjectInformationReducer(bookId)}
                  />
                </td>
                <td style={{ padding: '0px 0px 0px 120px' }}>
                  <LanguageDirectionDropdownMenu
                    translate={translate}
                    languageDirection={languageDirection}
                    updateLanguageDirection={(languageDirection) => this.props.actions.setLanguageDirectionInProjectInformationReducer(languageDirection)}
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <LanguageNameTextBox
                    translate={translate}
                    languageName={languageName}
                    languageId={languageId}
                    updateLanguageName={(languageName) => this.props.actions.setLanguageNameInProjectInformationReducer(languageName)}
                    updateLanguageId={(languageId) => this.props.actions.setLanguageIdInProjectInformationReducer(languageId)}
                    updateLanguageAll={(languageId, languageName, languageDirection) => this.props.actions.setAllLanguageInfoInProjectInformationReducer(languageId, languageName, languageDirection)}
                  />
                </td>
                <td style={{ padding: '0px 0px 0px 120px' }}>
                  <LanguageIdTextBox
                    translate={translate}
                    languageId={languageId}
                    updateLanguageName={(languageName) => this.props.actions.setLanguageNameInProjectInformationReducer(languageName)}
                    updateLanguageId={(languageId) => this.props.actions.setLanguageIdInProjectInformationReducer(languageId)}
                    updateLanguageAll={(languageId, languageName, languageDirection) => this.props.actions.setAllLanguageInfoInProjectInformationReducer(languageId, languageName, languageDirection)}
                  />
                </td>
              </tr>
              </tbody>
            </table>
            <div style={{ display: 'flex', marginLeft: '-40px' }}>
              <ContributorsArea
                translate={translate}
                contributors={contributors}
                addContributor={this.addContributor.bind(this)}
                removeContributor={this.removeContributor.bind(this)}
                updateContributorName={(contributorName, index) => this.props.actions.updateContributorName(contributorName, index)}
              />
              <CheckersArea
                translate={translate}
                checkers={checkers}
                addChecker={this.addChecker.bind(this)}
                removeChecker={this.removeChecker.bind(this)}
                updateCheckerName={(checkerName, index) => this.props.actions.updateCheckerName(checkerName, index)}
              />
            </div>
          </Card>
        </div>
      </ProjectValidationContentWrapper>
    );
  }
}

ProjectInformationCheck.propTypes = {
  translate: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  reducers: PropTypes.object.isRequired
};

export default ProjectInformationCheck;
