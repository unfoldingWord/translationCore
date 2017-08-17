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
                    <div style={{fontSize:18, margin:'5px 0px'}} key={`${chapterIndex}_${chapterObject[verseNumber]}`}>
                    {bookName} {chapterIndex}:{chapterObject[verseNumber]}
                    </div>
                )
            })
        })
        return verseCards;
    }
    render() {
        let {verses} = this.props.reducers.missingVersesReducer;
        return (
            <div style={{display:'flex', flexDirection:'column', marginLeft:20}}>
                <div style={{ textAlign: 'left', fontSize: 30, marginBottom:10 }}>
                    Missing Verses
            </div>
                {this.generateVerseCards(verses)}
            </div>
        );
    }
}

export default MissingVersesCheck;