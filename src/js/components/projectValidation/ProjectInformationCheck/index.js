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

class ProjectInformationCheck extends Component {
  componentWillMount() {
    let {
      translators,
      checkers,
      project,
      target_language
    } = this.props.reducers.projectDetailsReducer.manifest;

    this.props.actions.setBookIDInProjectInformationReducer(project.id ? project.id : '');
    this.props.actions.setLanguageIdInProjectInformationReducer(target_language.id ? target_language.id : '');
    this.props.actions.setLanguageNameInProjectInformationReducer(target_language.name ? target_language.name : '');
    this.props.actions.setLanguageDirectionInProjectInformationReducer(target_language.direction ? target_language.direction : '');
    this.props.actions.setContributorsInProjectInformationReducer(translators && translators.length > 0 ? translators : []);
    this.props.actions.setCheckersInProjectInformationReducer(checkers && checkers.length > 0 ? checkers : []);
  }

  componentDidMount() {
    this.props.actions.changeProjectValidationInstructions(
      <div>
        <p>
          Some project information may be missing.
          Please review and fill out all of the required fields.
        </p><br /><br />
        <h4>Attention:</h4>
        <p>
          Those listed as contributors or checkers will be made publicly available.
        </p>
      </div>
    )
  }

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
      return index != selectedIndex;
    });

    this.props.actions.setContributorsInProjectInformationReducer(newContributorsArray);
  }

  removeChecker(selectedIndex) {
    let { checkers } = this.props.reducers.projectInformationCheckReducer;
    let newCheckersArray = checkers.filter((element, index) => {
      return index != selectedIndex;
    });

    this.props.actions.setCheckersInProjectInformationReducer(newCheckersArray);
  }

  render() {
    const {
      bookId,
      languageId,
      languageName,
      languageDirection,
      contributors,
      checkers
    } = this.props.reducers.projectInformationCheckReducer

    return (
     <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        Project Information
        <Card
          style={{ width: '100%', height: '100%' }}
          containerStyle={{ overflowY: 'auto', overflowX: 'hidden', height: '100%' }}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <span style={{ color: '#800020', margin: '10px' }}>* Required</span><br />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start' }}>
            <BookDropdownMenu
              bookId={bookId}
              updateBookId={(bookId) => this.props.actions.setBookIDInProjectInformationReducer(bookId)}
            />
            <LanguageDirectionDropdownMenu
              languageDirection={languageDirection}
              updateLanguageDirection={(languageDirection) => this.props.actions.setLanguageDirectionInProjectInformationReducer(languageDirection)}
            />
          </div><br />
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start' }}>
            <LanguageIdTextBox
                languageId={languageId}
                updateLanguageId={(languageId) => this.props.actions.setLanguageIdInProjectInformationReducer(languageId)}
              />
              <LanguageNameTextBox
                languageName={languageName}
                updateLanguageName={(languageName) => this.props.actions.setLanguageNameInProjectInformationReducer(languageName)}
              />
          </div><br />
          <div style={{ display: 'flex' }}>
            <ContributorsArea 
              contributors={contributors}
              addContributor={this.addContributor.bind(this)}
              removeContributor={this.removeContributor.bind(this)}
              updateContributorName={(contributorName, index) => this.props.actions.updateContributorName(contributorName, index)}
            />
            <CheckersArea
              checkers={checkers}
              addChecker={this.addChecker.bind(this)}
              removeChecker={this.removeChecker.bind(this)}
              updateCheckerName={(checkerName, index) => this.props.actions.updateCheckerName(checkerName, index)}
            />
          </div>
        </Card>
      </div>
    );
  }
}

ProjectInformationCheck.propTypes = {
  actions: PropTypes.object.isRequired,
  reducers: PropTypes.object.isRequired
}

export default ProjectInformationCheck;
