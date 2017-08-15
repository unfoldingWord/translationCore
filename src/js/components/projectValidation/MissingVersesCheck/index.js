import React, { Component } from 'react';
const MISSING_VERSE_NAMESPACE = 'missingVersesCheck';

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
        let verseCards = [];
        Object.keys(missingVersesObject).forEach((chapterIndex) => {
            let chapterObject = missingVersesObject[chapterIndex];
            if(isNaN(chapterIndex)) return;
            let {bookName} = missingVersesObject;
            Object.keys(chapterObject).forEach((verseNumber) => {
                verseCards.push(
                    <div style={{fontSize:18}} key={`${chapterIndex}_${chapterObject[verseNumber]}`}>
                    {bookName} {chapterIndex} : {chapterObject[verseNumber]}
                    </div>
                )
            })
        })
        return verseCards;
    }
    render() {
        let missingVersesObject = this.props.reducers.projectValidationReducer.projectValidationStepsObject[MISSING_VERSE_NAMESPACE];
        return (
            <div style={{display:'flex', flexDirection:'column', marginLeft:20}}>
                <div style={{ textAlign: 'left', fontSize: 30, marginBottom:10 }}>
                    Missing Verses
            </div>
                {this.generateVerseCards(missingVersesObject.verses)}
            </div>
        );
    }
}

export default MissingVersesCheck;