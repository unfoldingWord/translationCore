import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProjectValidationContentWrapper from '../ProjectValidationContentWrapper';

class MissingVersesCheck extends Component {
    componentDidMount() {
        this.props.toggleNextDisabled(false);
    }
    generateVerseCards(missingVersesObject, bookName) {
        let verseCards = [];
        Object.keys(missingVersesObject).forEach((chapterIndex) => {
            let chapterObject = missingVersesObject[chapterIndex];
            if(isNaN(chapterIndex)) return;
            Object.keys(chapterObject).forEach((verseNumber) => {
                verseCards.push(
                    <div style={{fontSize:18, margin:'5px 0px'}} key={`${chapterIndex}_${chapterObject[verseNumber]}`}>
                    {bookName} {chapterIndex}:{chapterObject[verseNumber]}
                    </div>
                );
            });
        });
        return verseCards;
    }
    render() {
        let {verses, bookName} = this.props.reducers.missingVersesReducer;
        const {translate} = this.props;
        const instructions = (
          <div>
            {translate('project_validation.missing_verses_instructions', {
              tstudio: translate('_.translation_studio'),
              autographa: translate('_.autographa')
            })}
          </div>
        );

        return (
          <ProjectValidationContentWrapper translate={translate}
                                           instructions={instructions}>
            <div style={{display:'flex', flexDirection:'column', marginLeft:20, overflowY: 'auto', height: '100%'}}>
              <div style={{ textAlign: 'left', fontSize: 30, marginBottom:10 }}>
                {translate('missing_verses')}
              </div>
              {this.generateVerseCards(verses, bookName)}
            </div>
          </ProjectValidationContentWrapper>

        );
    }
}

MissingVersesCheck.propTypes = {
  translate: PropTypes.func.isRequired,
  reducers: PropTypes.any.isRequired,
  toggleNextDisabled: PropTypes.func.isRequired
};

export default MissingVersesCheck;
