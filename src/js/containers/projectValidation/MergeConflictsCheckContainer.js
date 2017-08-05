import { connect } from 'react-redux'
import React, { Component } from 'react';
import { Card } from 'material-ui/Card';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import MergeConflictsCheck from '../../components/projectValidation/MergeConflictsCheck'
import * as ProjectValidationActions from '../../actions/ProjectValidationActions';

class MergeConflictsCheckContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mergeConflictSelections: {},
        };
        this.onCheck = this.onCheck.bind(this);
        this.mergeConflictCards = this.mergeConflictCards.bind(this);
    }
    onCheck(e, key, otherKey) {
        this.setState({
            mergeConflictSelections: {
                ...this.state.mergeConflictSelections,
                [key]: !this.state.mergeConflictSelections[key],
                [otherKey]: this.state.mergeConflictSelections[key]
            }
        });
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
                let otherVersion = Number(! + version);
                versionCards.push(
                    <div style={{ padding: 15 }} key={`${chapter}-${verses}-${version}`}>
                        <RadioButton
                            checked={this.state.mergeConflictSelections[`${chapter}-${verses}-${version}`]}
                            label={`Version ${Number(version) + 1}`}
                            onCheck={(e) => this.onCheck(e, `${chapter}-${verses}-${version}`, `${chapter}-${verses}-${otherVersion}`)}
                        />
                        {this.textObjectSection(conflict[version].textObject)}
                    </div>
                )
            }
            conflictCards.push(
                <div key={`${chapter}-${verses}`}>
                    <div style={{ padding: '15px 15px 0px 15px' }}>
                        <div style={{ fontWeight: 'bold', paddingBottom: 5 }}>Merge Conflict #{Number(mergeConflictIndex) + 1}</div>
                        <div>This is a merge conflict for chapter {chapter}, verse {verses}.</div>
                    </div>
                    {versionCards}
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