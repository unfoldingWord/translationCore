import React, { Component } from 'react';
import PropTypes from 'prop-types';
//icons
import RightArrow from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import DownArrow from 'material-ui/svg-icons/hardware/keyboard-arrow-down';
//components
import { Card } from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import MergeConflictsCheck from './MergeConflictsCheck.js';


class MergeConflictsCheckContainer extends Component {
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
      for (var version of conflict){
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

  mergeConflictCards(conflictObject) {
    let conflicts = conflictObject.conflicts;
    let conflictCards = [];
    for (let mergeConflictIndex in conflicts) {
      let versionCards = [];
      let conflict = conflicts[mergeConflictIndex];
      let chapter = conflict[mergeConflictIndex].chapter;
      let verses = conflict[mergeConflictIndex].verses;
      for (let version in conflict) {
        if (isNaN(version)) continue;
        let checked = conflicts[mergeConflictIndex][version].checked;
        versionCards.push(
          <div key={`${mergeConflictIndex}-${version}`} style={{ borderBottom: '1px solid black' }}>
            <div style={{ padding: 15 }}>
              <RadioButton
                checked={checked}
                label={`Version ${Number(version) + 1}`}
                onCheck={(e) => this.onCheck(e, mergeConflictIndex, version)}
              />
              {this.textObjectSection(conflict[version].text)}
            </div>
          </div>
        )
      }
      let borderBottom = conflict.open ? 'none' : '1px solid black';
      conflictCards.push(
        <div key={`${mergeConflictIndex}`} style={{ borderBottom: borderBottom, paddingBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', }}>
            <div style={{ padding: '15px 15px 0px 15px' }}>
              <div style={{ fontWeight: 'bold', paddingBottom: 5 }}>Merge Conflict #{Number(mergeConflictIndex) + 1}</div>
              <div>This is a merge conflict for chapter {chapter}, verse {verses}.</div>
            </div>
            {conflict.open ?
              <div
                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', height: 40, width: 40, borderRadius: '50%', border: '2px solid black', margin: '15px 15px 0px auto' }}
                onClick={() => this.openMergeCard(mergeConflictIndex, false)}>
                <RightArrow style={{ height: 60, width: 60 }} />
              </div>
              :
              <div
                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', height: 40, width: 40, borderRadius: '50%', border: '2px solid black', margin: '15px 15px 0px auto' }}
                onClick={() => this.openMergeCard(mergeConflictIndex, true)}>
                <DownArrow style={{ height: 60, width: 60 }} />
              </div>
            }
          </div>
          {conflict.open ? versionCards : null}
        </div>
      )
    }
    return conflictCards;
  }

  textObjectSection(textObject) {
    let verses = [];
    for (var verseNum in textObject) {
      let verse = textObject[verseNum];
      verses.push(
        <div style={{ fontSize: 14 }} key={verseNum}>
          <b>{verseNum}</b>: {verse}
        </div>
      )
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
    let conflictCards = this.mergeConflictCards(mergeConflictObject)
    return (
      <Card style={{ width: '100%', height: '100%' }}
        containerStyle={{ overflowY: 'auto', height: '100%' }}>
        <MergeConflictsCheck conflictCards={conflictCards} {...this.props} />
      </Card>
    );
  }
}

MergeConflictsCheckContainer.propTypes = {
  actions: {
    updateStepData: PropTypes.func.isRequired,
    toggleNextDisabled: PropTypes.func.isRequired,
    changeProjectValidationInstructions: PropTypes.func.isRequired,
  },
  reducers:{
    projectValidationReducer:PropTypes.object.isRequired
  }
}

export default MergeConflictsCheckContainer;