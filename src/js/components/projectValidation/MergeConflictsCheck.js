import React, { Component } from 'react';

class MergeConflictsCheck extends Component {
    componentDidMount() {
        this.props.actions.changeProjectValidationInstructions(
            <div>
                <div>Some merge conflicts were found inside of your project.</div>
                <div>Please review and resolve these conflicts before continuing.</div>
            </div>
        )
    }

    render() {
        return (
            <div>
                {this.props.conflictCards}
            </div>
        );
    }
}

export default MergeConflictsCheck;