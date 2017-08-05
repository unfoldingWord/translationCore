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
        let cards = [];
        var conflictsCount = 0;
        for (var conflictIndex in conflicts) {
            let conflict = conflicts[conflictIndex];
            let chapter = conflict[conflictsCount].chapter;
            let verses = conflict[conflictsCount].verses;
            cards.push(
                <div key={`${chapter}-${verses}-${conflictsCount}`}>
                    <div style={{ padding:'15px 15px 0px 15px' }}>
                        <div style={{ fontWeight: 'bold', paddingBottom: 5 }}>Merge Conflict #{conflictsCount + 1}</div>
                        <div>This is a merge conflict for chapter {chapter}, verse {verses}.</div>
                    </div>
                    <div style={{ padding: 15 }}>
                        <RadioButton
                            checked={this.state.mergeConflictSelections[`${chapter}-${verses}-0`]}
                            value={conflictsCount}
                            label={'Version 1'}
                            onCheck={(e) => this.onCheck(e, `${chapter}-${verses}-0`, `${chapter}-${verses}-1`)}
                        />
                        {this.textObjectSection(conflict[conflictsCount].textObject)}
                    </div>
                    <div style={{ borderTop: '1px solid black', padding: 15, borderBottom: '1px solid black' }}>
                        <RadioButton
                            checked={this.state.mergeConflictSelections[`${chapter}-${verses}-1`]}
                            value={conflictsCount}
                            label={'Version 2'}
                            onCheck={(e) => this.onCheck(e, `${chapter}-${verses}-1`, `${chapter}-${verses}-0`)}
                        />
                        {this.textObjectSection(conflict[conflictsCount].textObject)}
                    </div>
                </div>
            )
            conflictsCount++;
        }
        return cards;
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
                containerStyle={{overflowY:'auto', height:'100%'}}>
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