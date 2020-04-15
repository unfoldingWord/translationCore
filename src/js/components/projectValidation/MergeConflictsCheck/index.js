import React, { Component } from 'react';
import PropTypes from 'prop-types';
//components
import { Card } from 'material-ui/Card';
import ProjectValidationContentWrapper from '../ProjectValidationContentWrapper';
import MergeConflictsCard from './MergeConflictsCard';

class MergeConflictsCheck extends Component {
  constructor(props) {
    super(props);
    this.mergeConflictCards = this.mergeConflictCards.bind(this);
    this.openCard = this.openCard.bind(this);
    this.onCheck = this.onCheck.bind(this);
    this.state = { conflictCards: {} };
  }

  mergeConflictCards(mergeConflictCheckObject) {
    const { translate } = this.props;
    let allConflictsArray = mergeConflictCheckObject.conflicts;
    let conflictCards = [];

    for (let currentConflictIndex in allConflictsArray) {
      if (!allConflictsArray.hasOwnProperty(currentConflictIndex)) {
        continue;
      }

      let versions = [];
      let currentConflictObject = allConflictsArray[currentConflictIndex];
      let { chapter } = currentConflictObject[0];
      let { verses } = currentConflictObject[0];

      for (let versionIndex in currentConflictObject) {
        if (!currentConflictObject.hasOwnProperty(versionIndex)) {
          continue;
        }

        if (isNaN(versionIndex)) {
          continue;
        }
        versions.push({
          index: versionIndex,
          textData: currentConflictObject[versionIndex].text,
          checked: currentConflictObject[versionIndex].checked,
        });
      }

      let card = this.state.conflictCards[currentConflictIndex];

      conflictCards.push(
        <MergeConflictsCard
          translate={translate}
          key={`${currentConflictIndex}`}
          chapter={chapter}
          verses={verses}
          mergeConflictIndex={currentConflictIndex}
          versions={versions}
          open={card ? card.open : false}
          onCheck={this.onCheck}
          openCard={this.openCard}
        />,
      );
    }
    return conflictCards;
  }

  openCard(index, open) {
    let conflictCards = JSON.parse(JSON.stringify(this.state.conflictCards));

    if (!conflictCards[index]) {
      conflictCards[index] = {};
    }
    conflictCards[index].open = open;
    this.setState({ conflictCards });
  }

  onCheck(mergeConflictIndex, versionIndex, checked) {
    this.props.updateVersionSelection(mergeConflictIndex, versionIndex, checked);
  }

  render() {
    let mergeConflictObject = this.props.reducers.mergeConflictReducer;
    const { translate } = this.props;
    const instructions = (
      <div>
        {translate('project_validation.merge_conflicts_found')}
      </div>
    );

    return (
      <ProjectValidationContentWrapper translate={translate}
        instructions={instructions}>
        <div style={{ width: '100%', height: '100%' }}>
          {translate('project_validation.merge_conflicts')}
          <Card style={{ width: '100%', height: '100%' }}
            containerStyle={{ overflowY: 'auto', height: '100%' }}>
            {this.mergeConflictCards(mergeConflictObject)}
          </Card>
        </div>
      </ProjectValidationContentWrapper>
    );
  }
}

MergeConflictsCheck.propTypes = {
  updateVersionSelection: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
  reducers: PropTypes.shape({ mergeConflictReducer: PropTypes.object.isRequired }),
};

export default MergeConflictsCheck;
