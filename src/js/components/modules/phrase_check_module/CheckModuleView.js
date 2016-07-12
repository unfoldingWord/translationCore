const RB = require('react-bootstrap');
const {Grid, Row, Col} = RB;
const React = require('react');
const ScriptureDisplay = require('./subcomponents/ScriptureDisplay');
const ConfirmDisplay = require('./subcomponents/ConfirmDisplay');
const FlagDisplay = require('./subcomponents/FlagDisplay');
const AbstractCheckModule = require('../../AbstractCheckModule');
const CheckActions = require('../../../actions/CheckActions.js');


class PhraseChecker extends AbstractCheckModule{
  constructor(){
    super();

  }

  // componentWillMount() {
  //   super.componentWillMount();
  //   CheckStore.addChangeListener(this.emitListener);
  //   this.setState({
  //       currentChapter: null,
  //       currentVerse: null,
  //       currentBook: null
  //   });
  //
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
                  scripture={'this is some test stuff blah blah blah'}
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
                  phraseInfo={super.getCurrentCheck().note}
                  phrase={super.getCurrentCheck().phrase}
                />
              </Col>
              <Col md={6}>
                <FlagDisplay
                  setFlagState={CheckActions.changeCheckProperty}
                />
              </Col>
            </Row>
        </Grid>
      );
    }else{return(<div></div>)}
  }
}

module.exports = PhraseChecker;
