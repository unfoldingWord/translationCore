const RB = require('react-bootstrap');
const {Grid, Row, Col} = RB;
const React = require('react');
const ScriptureDisplay = require('./subcomponents/ScriptureDisplay');
const ConfirmDisplay = require('./subcomponents/ConfirmDisplay');
const FlagDisplay = require('./subcomponents/FlagDisplay');
const AbstractCheckModule = require('../AbstractCheckModule');
const CheckActions = require('../../../actions/CheckActions.js');
const TranslationAcademyDisplay = require ('../../TranslationAcademyDisplay');

class PhraseChecker extends AbstractCheckModule{
  constructor(){
    super();

  }

  render() {
    if(super.getCurrentCheck()){
      return (
        <Grid>
            <Row className="show-grid">
              <Col md={12}>
                <ScriptureDisplay
                  scripture={'PABLO, apóstol de Jesucristo por la voluntad de Dios, á los santos y fieles en Cristo Jesús que están en Efeso:'}
                  setSelectedText={CheckActions.changeCheckProperty}
                  currentVerse={super.getCurrentCheck().book
                                + " " + super.getCurrentCheck().chapter
                                + ":" + super.getCurrentCheck().verse}
                  ref="ScriptureDisplay"
                />
              </Col>
            </Row>
            <Row className="show-grid">
              <Col md={6} className="confirm-area">
                <ConfirmDisplay
                  phraseInfo={super.getCurrentCheck().phraseInfo}
                  phrase={super.getCurrentCheck().phrase}
                />
              </Col>
              <Col md={6}>
                <FlagDisplay
                  setFlagState={CheckActions.changeCheckProperty}
                />
              </Col>
            </Row>
            <br />
            <Row classname="show-grid">
              <Col md={12}>
                <TranslationAcademyDisplay sectionName={super.getCurrentCheck().group} />
              </Col>
            </Row>
        </Grid>
      );
    }else{return(<div></div>)}
  }
}

module.exports = PhraseChecker;
