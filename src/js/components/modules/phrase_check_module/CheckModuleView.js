const RB = require('react-bootstrap');
const {Grid, Row, Col} = RB;
const React = require('react');
const ScriptureDisplay = require('./subcomponents/ScriptureDisplay');
const ConfirmDisplay = require('./subcomponents/ConfirmDisplay');
const FlagDisplay = require('./subcomponents/FlagDisplay');
const Menu = require('./subcomponents/Menu');
const AbstractCheckModule = require('../../AbstractCheckModule');
const CheckActions = require('../../../actions/CheckActions.js');
const CheckStore = require('../../../stores/CheckStore.js')
const Fetcher = require('./FetchData.js');


class PhraseChecker extends AbstractCheckModule{
  constructor(){
    super();

    this.setSelectedText = this.setSelectedText.bind(this);
    this.setFlagState = this.setFlagState.bind(this);
    this.appendReturnObject = this.appendReturnObject.bind(this);
    this.updateCheck = this.updateCheck.bind(this);
    this.onComplete = this.onComplete.bind(this);
  }
  setSelectedText(e){
    this.setState({selectedText: e});
    CheckActions.changeCheckProperty("selectedText", e);
  }
  setFlagState(e){
    CheckActions.changeCheckProperty("checkStatus", e);
  }
  // setNote(e){
  //   this.setState({note: e});
  // }
  // setRef(e){
  //   this.setState({ref: e});
  // }
  // setProgress(e){
  //   this.setState({progress: e});
  //   if(this.state.progress >= 100){
  //     this.setState({isLoading: false});
  //   }
  // }
  // onParserCompletion(object){
  //     console.log(object);
  //     this.setState({chapterData: object});
  // }
  componentWillMount(){
    this.setState({
      toCheck: CheckStore.getCurrentCheck().phrase,
      note: CheckStore.getCurrentCheck().note,
      ref: "",
      tlVerse: "This is selectable placeholder text. Eventually the target language text will appear here",
      selectedText: "",
      flagState: "",
    });
    CheckStore.addChangeListener(this.updateCheck);

    /*
    * Incoming rule breaking! This is just to have a working prototype
    */

    Fetcher('eph', () => {}, this.onComplete)
  }
  onComplete(book){
    this.setState({
      data: book
    });
  }
  updateCheck(){
    this.setState({
      toCheck: super.getCurrentCheck().phrase,
      note: super.getCurrentCheck().note
    });
  }
  appendReturnObject(){
    var object = this.state.returnObject;
    object.push(
      {
        ref: this.state.ref,
        selectedText: this.state.selectedText,
        flag: this.state.flagState,
        note: this.state.note
      }
    );
  }
  render() {
    return (
      <Grid>
          <Row className="show-grid">
            <Col md={12}>
              <ScriptureDisplay
                scripture={this.state.tlVerse}
                setSelectedText={this.setSelectedText}
                currentVerse={this.state.ref}
                ref="ScriptureDisplay"
              />
            </Col>
          </Row>
          <Row className="show-grid">
            <Col md={5} className="confirm-area">
              <ConfirmDisplay
                phraseInfo={this.state.note}
                phrase={this.state.toCheck}
                selectedText={this.state.selectedText}
              />
            </Col>
            <Col md={6}>
              <FlagDisplay
                setFlagState={this.setFlagState}
              />
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Menu verses={this.state.chapterData}
                        setNote={this.setNote}
                        setRef={this.setRef}/>
            </Col>
          </Row>
      </Grid>
    );
  }
}

module.exports = PhraseChecker;
