import { connect } from 'react-redux'
import React, { Component } from 'react';
//icons
import RightArrow from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import DownArrow from 'material-ui/svg-icons/hardware/keyboard-arrow-down';
//components
import { Card } from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import MergeConflictsCheck from '../../components/projectValidation/MergeConflictsCheck'
//actions
import * as ProjectValidationActions from '../../actions/ProjectValidationActions';


class MergeConflictsCheckContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mergeConflictSettings: {},
        };
        this.onCheck = this.onCheck.bind(this);
        this.mergeConflictCards = this.mergeConflictCards.bind(this);
        this.openMergeCard = this.openMergeCard.bind(this);
    }
    onCheck(e, mergeConflictIndex, versionIndex) {
        let otherVersion = Number(! + versionIndex);
        let newState = JSON.parse(JSON.stringify(this.state.mergeConflictSettings));
        if (!newState[mergeConflictIndex]) {
            newState[mergeConflictIndex] = {};
            newState[mergeConflictIndex][versionIndex] = true;
            newState[mergeConflictIndex][otherVersion] = false;
            return this.setState({
                mergeConflictSettings: newState
            });
        }
        newState[mergeConflictIndex][versionIndex] = !this.state.mergeConflictSettings[mergeConflictIndex][versionIndex];
        newState[mergeConflictIndex][otherVersion] = this.state.mergeConflictSettings[mergeConflictIndex][versionIndex];
        this.setState({
            mergeConflictSettings: newState
        });
    }
    mergeConflictCards(conflictObject) {
        let conflicts = conflictObject.conflicts;
        let conflictCards = [];
        for (let mergeConflictIndex in conflicts) {
            let mergeConflictObject = this.state.mergeConflictSettings[mergeConflictIndex] || {};
            let versionCards = [];
            let conflict = conflicts[mergeConflictIndex];
            let chapter = conflict[mergeConflictIndex].chapter;
            let verses = conflict[mergeConflictIndex].verses;
            for (let version in conflict) {
                let checked = mergeConflictObject[version];
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
            let borderBottom = mergeConflictObject.open ? 'none' : '1px solid black';
            conflictCards.push(
                <div key={`${mergeConflictIndex}`} style={{ borderBottom: borderBottom, paddingBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', }}>
                        <div style={{ padding: '15px 15px 0px 15px' }}>
                            <div style={{ fontWeight: 'bold', paddingBottom: 5 }}>Merge Conflict #{Number(mergeConflictIndex) + 1}</div>
                            <div>This is a merge conflict for chapter {chapter}, verse {verses}.</div>
                        </div>
                        {mergeConflictObject.open ?
                            <div
                                style={{ cursor:'pointer', display:'flex', justifyContent: 'center', alignItems:'center', height: 40, width: 40, borderRadius: '50%', border: '2px solid black', margin: '15px 15px 0px auto' }}
                                onClick={() => this.openMergeCard(mergeConflictIndex, false)}>
                                <RightArrow style={{ height: 60, width: 60}} />
                            </div>
                            :
                            <div
                                style={{cursor:'pointer', display:'flex', justifyContent: 'center', alignItems:'center', height: 40, width: 40, borderRadius: '50%', border: '2px solid black', margin: '15px 15px 0px auto' }}
                                onClick={() => this.openMergeCard(mergeConflictIndex, true)}>
                                <DownArrow style={{ height: 60, width: 60}} />
                            </div>
                        }
                    </div>
                    {mergeConflictObject.open ? versionCards : null}
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
        let mergeConflictSettings = JSON.parse(JSON.stringify(this.state.mergeConflictSettings))
        if (mergeConflictSettings[mergeConflictIndex] === undefined){
            mergeConflictSettings[mergeConflictIndex] = {};
        }
        mergeConflictSettings[mergeConflictIndex].open = open;
        this.setState({
            mergeConflictSettings: mergeConflictSettings
        })
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


const mapStateToProps = (state, ownProps) => {
    return {
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MergeConflictsCheckContainer)