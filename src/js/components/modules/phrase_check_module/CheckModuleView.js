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

  // componentWillMount() {
  //   super.componentWillMount();
  //   CheckStore.addChangeListener(this.emitListener.bind(this));
  // }


  //
  // emitListener() {
  //   super.refreshCurrentCheck();
  //   this.setState({
  //     currentVerse: this.state.currentCheck.scripture
  //   })
  // }


  render() {
    if(super.getCurrentCheck()){
      return (
        <Grid>
            <Row className="show-grid">
              <Col md={12}>
                <ScriptureDisplay
                  scripture={'This is where the target language verse will be displayed during the checking process for the phrase checker'}
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
