import React, { Component } from 'react';
import PropTypes from 'prop-types';
//components
import { Card } from 'material-ui/Card';
import MergeConflictsCard from './MergeConflictsCard';


class MergeConflictsCheck extends Component {
  constructor(props) {
    super(props);
    this.mergeConflictCards = this.mergeConflictCards.bind(this);
    this.openCard = this.openCard.bind(this);
    this.onCheck = this.onCheck.bind(this);
    this.state = {
      conflictCards: {}
    };
  }

  componentDidMount() {
    this.props.actions.changeProjectValidationInstructions(
      <div>
        <div>Some merge conflicts were found inside of your project.</div>
        <div>Please review and resolve these conflicts before continuing.</div>
      </div>
    );
  }

  mergeConflictCards(mergeConflictCheckObject) {
    let allConflictsArray = mergeConflictCheckObject.conflicts;
    let conflictCards = [];
    for (let currentConflictIndex in allConflictsArray) {
      let versions = [];
      let currentConflictObject = allConflictsArray[currentConflictIndex];
      let { chapter } = currentConflictObject[0];
      let { verses } = currentConflictObject[0];
      for (let versionIndex in currentConflictObject) {
        if (isNaN(versionIndex)) continue;
        versions.push({
          index: versionIndex,
          textData: currentConflictObject[versionIndex].text,
          checked: currentConflictObject[versionIndex].checked
        });
      }
      let card = this.state.conflictCards[currentConflictIndex];
      conflictCards.push(
        <MergeConflictsCard
          key={`${currentConflictIndex}`}
          chapter={chapter}
          verses={verses}
          mergeConflictIndex={currentConflictIndex}
          versions={versions}
          open={card ? card.open : false}
          onCheck={this.onCheck}
          openCard={this.openCard}
        />
      );
    }
    return conflictCards;
  }

  openCard(index, open) {
    let conflictCards = JSON.parse(JSON.stringify(this.state.conflictCards));
    if (!conflictCards[index]) conflictCards[index] = {};
    conflictCards[index].open = open;
    this.setState({ conflictCards });
  }

  onCheck(mergeConflictIndex, versionIndex, checked) {
    this.props.actions.updateVersionSelection(mergeConflictIndex, versionIndex, checked);
  }

  render() {
    let mergeConflictObject = this.props.reducers.mergeConflictReducer;
    return (
      <div style={{ width: '100%', height: '100%' }}>
        Merge Conflicts
        <Card style={{ width: '100%', height: '100%' }}
          containerStyle={{ overflowY: 'auto', height: '100%' }}>
          {this.mergeConflictCards(mergeConflictObject)}
        </Card>
      </div>
    );
  }
}

MergeConflictsCheck.propTypes = {
  actions: PropTypes.shape({
    toggleNextDisabled: PropTypes.func.isRequired,
    changeProjectValidationInstructions: PropTypes.func.isRequired,
    updateVersionSelection: PropTypes.func.isRequired
  }),
  reducers: PropTypes.shape({
    projectValidationReducer: PropTypes.object.isRequired,
    mergeConflictReducer: PropTypes.object.isRequired
  })
};

export default MergeConflictsCheck;