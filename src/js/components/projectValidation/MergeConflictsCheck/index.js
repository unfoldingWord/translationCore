import React, { Component } from 'react';
import PropTypes from 'prop-types';
//components
import { Card } from 'material-ui/Card';
import MergeConflictsCard from './MergeConflictsCard';


class MergeConflictsCheck extends Component {
  constructor(props) {
    super(props);
    this.onCheck = this.onCheck.bind(this);
    this.mergeConflictCards = this.mergeConflictCards.bind(this);
    this.openMergeCard = this.openMergeCard.bind(this);
  }

  componentDidMount() {
    this.props.actions.changeProjectValidationInstructions(
      <div>
        <div>Some merge conflicts were found inside of your project.</div>
        <div>Please review and resolve these conflicts before continuing.</div>
      </div>
    )
    if (!this.allVersionsSelected()) this.props.actions.toggleNextDisabled(true);
  }

  /**Determine if the user has selected all merge conlficts history which will need to be merged */
  allVersionsSelected() {
    let allMergeConflictsHandled = true;
    let mergeConflictsObject = this.props.reducers.projectValidationReducer.projectValidationStepsArray[2];
    for (var conflict of mergeConflictsObject.conflicts) {
      let mergeHistorySelected = false
      for (var version of conflict) {
        //if current check is selected or the previous one was
        mergeHistorySelected = version.checked || mergeHistorySelected;
      }
      //All merge conflicts have been handled previously and for the current conflict
      allMergeConflictsHandled = allMergeConflictsHandled && mergeHistorySelected;
    }
    return allMergeConflictsHandled;
  }

  onCheck(e, mergeConflictIndex, versionIndex) {
    let otherVersion = Number(! + versionIndex); // i.e. 0 -> 1 and 1 -> 0
    let mergeConflictObject = this.props.reducers.projectValidationReducer.projectValidationStepsArray[2];
    let newObject = Object.assign({}, mergeConflictObject); //Replicating state
    let currentCheckStatus = newObject.conflicts[mergeConflictIndex][versionIndex].checked;
    newObject.conflicts[mergeConflictIndex][versionIndex].checked = !currentCheckStatus;
    //The user can only select one merge conlfict to merge with for now.
    newObject.conflicts[mergeConflictIndex][otherVersion].checked = currentCheckStatus;
    this.props.actions.updateStepData(2, newObject)
    this.props.actions.toggleNextDisabled(!this.allVersionsSelected());
  }

  mergeConflictCards(conflict) {
    let conflicts = conflict.conflicts;
    let conflictCards = [];
    for (let mergeConflictIndex in conflicts) {
      let versions = [];
      let conflict = conflicts[mergeConflictIndex];
      let chapter = conflict[mergeConflictIndex].chapter;
      let verses = conflict[mergeConflictIndex].verses;
      for (let versionIndex in conflict) {
        if (isNaN(versionIndex)) continue;
        let checked = conflicts[mergeConflictIndex][versionIndex].checked;
        versions.push({
          index: versionIndex,
          textSectionData: this.textObjectSection(conflict[versionIndex].text),
          checked: checked
        })
      }
      conflictCards.push(
        <MergeConflictsCard
          key={`${mergeConflictIndex}`}
          chapter={chapter}
          verses={verses}
          mergeConflictIndex={mergeConflictIndex}
          conflict={conflict}
          versions={versions}
          openMergeCard={this.openMergeCard}
          onCheck={this.onCheck} />
      )
    }
    return conflictCards;
  }

  textObjectSection(textObject) {
    let verses = [];
    for (var verseNum in textObject) {
      let verse = textObject[verseNum];
      verses.push({
        verseNum:verseNum,
        verse:verse
      })
    }
    return verses;
  }

  openMergeCard(mergeConflictIndex, open) {
    let mergeConflictObject = this.props.reducers.projectValidationReducer.projectValidationStepsArray[2];
    let newObject = Object.assign({}, mergeConflictObject); //Replicating state in new object
    newObject.conflicts[mergeConflictIndex].open = open;
    this.props.actions.updateStepData(2, newObject)
  }

  render() {
    let mergeConflictObject = this.props.reducers.projectValidationReducer.projectValidationStepsArray[2];
    return (
      <Card style={{ width: '100%', height: '100%' }}
        containerStyle={{ overflowY: 'auto', height: '100%' }}>
        {this.mergeConflictCards(mergeConflictObject)}
      </Card>
    );
  }
}

MergeConflictsCheck.propTypes = {
  actions: PropTypes.shape({
    updateStepData: PropTypes.func.isRequired,
    toggleNextDisabled: PropTypes.func.isRequired,
    changeProjectValidationInstructions: PropTypes.func.isRequired,
  }),
  reducers: PropTypes.shape({
    projectValidationReducer: PropTypes.object.isRequired
  })
}

export default MergeConflictsCheck;