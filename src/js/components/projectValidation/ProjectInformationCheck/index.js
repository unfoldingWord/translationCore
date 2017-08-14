import React, { Component } from 'react';
import PropTypes from 'prop-types';
// components
import { Card } from 'material-ui/Card';
import BookDropdownMenu from './BookDropdownMenu';
import LanguageTextBox from './LanguageTextBox';
import TextDirectionTextBox from './TextDirectionTextBox';
import ContributorsArea from './ContributorsArea';
import CheckersArea from './CheckersArea';

class ProjectInformationCheck extends Component {
  constructor(props) {
    super(props);
    this.state = {
      projectContributors: [],
      projectCheckers: []
    }
    this.addContributor = this.addContributor.bind(this);
    this.addChecker = this.addChecker.bind(this);
    this.removeContributor = this.removeContributor.bind(this);
    this.removeChecker = this.removeChecker.bind(this);
  }

  componentWillMount() {
    let { translators, checkers } = this.props.reducers.projectDetailsReducer.manifest;
    this.setState({
      projectContributors: translators,
      projectCheckers: checkers
    });
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
    let newContributors = this.state.projectContributors;
    newContributors.unshift('');
    this.setState({
      projectContributors: newContributors
    })
  }

  addChecker() {
    let newCheckers = this.state.projectCheckers;
    newCheckers.unshift('');
    this.setState({
      projectCheckers: newCheckers
    })
  }

  removeContributor(selectedIndex) {
    let newContributors = this.state.projectContributors.filter((element, index) => {
      return index != selectedIndex;
    });
    this.setState({
      projectContributors: newContributors
    })
  }

  removeChecker(selectedIndex) {
    let newCheckers = this.state.projectCheckers.filter((element, index) => {
      return index != selectedIndex;
    });
    this.setState({
      projectCheckers: newCheckers
    })
  }

  render() {
    console.log(this.state.projectContributors)
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
            <BookDropdownMenu bookIdValue={""} />
            <LanguageTextBox languageValue={""} />
            <TextDirectionTextBox textDirectionValue={""} />
          </div><br />
          <div style={{ display: 'flex' }}>
            <ContributorsArea 
              contributors={this.state.projectContributors}
              addContributor={this.addContributor}
              removeContributor={this.removeContributor}
            />
            <CheckersArea
              checkers={this.state.projectCheckers}
              addChecker={this.addChecker}
              removeChecker={this.removeChecker}
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
