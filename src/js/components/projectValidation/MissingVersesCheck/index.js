import React, { Component } from 'react';

class MissingVersesCheck extends Component {
    componentDidMount() {
        this.props.actions.changeProjectValidationInstructions(
            <div>
                <div>Some verses are missing from your project</div>
                <div>You can fix these in translationStudio or Autographa</div>
            </div>
        )
    }
    generateVerseCards(missingVersesObject) {
        return missingVersesObject.map((verseObject) => {
            return (
                <div>
                    {verseObject.chapter} + verseObject.verse
                </div>
            )
        })
    }
    render() {
        let missingVersesObject = this.props.reducers.projectValidationReducer.projectValidationStepsArray[3];
        return (
            <div>
                <div style={{textAlign:'center', fontSize:30}}>
                    Missing Verses
            </div>
                {this.generateVerseCards(missingVersesObject)}
            </div>
        );
    }
}

export default MissingVersesCheck;