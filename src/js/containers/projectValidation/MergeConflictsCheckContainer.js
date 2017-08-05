import { connect } from 'react-redux'
import React, { Component } from 'react';
import MergeConflictsCheck from '../../components/projectValidation/MergeConflictsCheck'
import * as ProjectValidationActions from '../../actions/ProjectValidationActions';

class MergeConflictsCheckContainer extends Component {
    mergeConflictCards(conflictObject) {
        let conflicts = conflictObject.conflicts;
        let cards = [];
        var conflictsCount = 0;
        for (var conflict of conflicts) {
            cards.push(
                <div key={conflict[conflictsCount].text}>
                    <div>
                        <div style={{ fontWeight: 'bold' }}>Merge Conflict #{conflictsCount + 1}</div>
                        <div>This is a merge conflict for chapter {conflict[0].chapter}, verse(s) {conflict[0].verses}.</div>
                    </div>
                    <div style={{ fontSize: 14, }}>
                        {conflict[0].text}
                    </div>
                </div>
            )
            conflictsCount++;
        }
        return cards;
    }

    render() {
        let mergeConflictObject = this.props.reducers.projectValidationReducer.projectValidationStepsArray[2];
        let conflictCards = this.mergeConflictCards(mergeConflictObject)
        return (
            <div>
                <MergeConflictsCheck conflictCards={conflictCards} {...this.props} />
            </div>
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