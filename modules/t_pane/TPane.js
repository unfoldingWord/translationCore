/**
  * @author Ian Hoegen
  * @description This component displays the Original Language, Gateway Language,
  *              and the Target Language. It takes it's input from uploads.
******************************************************************************/

const api = window.ModuleApi;
const React = api.React;

const Row = api.ReactBootstrap.Row;
const Well = api.ReactBootstrap.Well;
const Pane = require('./Pane');
const NAMESPACE = "TPane";

// string constants
const TARGET_LANGUAGE_ERROR = "Unable to load target language from CheckStore",
  ORIGINAL_LANGUAGE_ERROR = "Unable to load original language from CheckStore",
  GATEWAY_LANGUAGE_ERROR = "Unable to load gateway language from CheckStore";

class TPane extends React.Component {
  constructor() {
    super();
    var originalLanguage = api.getDataFromCheckStore(NAMESPACE, 'parsedGreek');
    var targetLanguage = api.getDataFromCommon('targetLanguage');
    var gatewayLanguage = api.getDataFromCommon('gatewayLanguage');
    var targetLanguageDirection = api.getDataFromCommon('params').direction;
    this.state = {
      "originalLanguage": !originalLanguage ? "" : originalLanguage,
      "targetLanguage": !targetLanguage ? "" : targetLanguage,
      "gatewayLanguage": !gatewayLanguage ? "" : gatewayLanguage,
      "tlDirection": targetLanguageDirection
    };

    this.updateOriginalLanguage = this.updateOriginalLanguage.bind(this);
    this.updateGatewayLanguage = this.updateGatewayLanguage.bind(this);
    this.updateTargetLanguage = this.updateTargetLanguage.bind(this);
  }

  componentWillMount() {
    api.registerEventListener("updateOriginalLanguage", this.updateOriginalLanguage);
    api.registerEventListener("updateTargetLanguage", this.updateTargetLanguage);
    api.registerEventListener("updateGatewayLanguage", this.updateGatewayLanguage);
  }

  componentWillUnmount() {
    api.removeEventListener("updateOriginalLanguage", this.updateOriginalLanguage);
    api.removeEventListener("updateTargetLanguage", this.updateTargetLanguage);
    api.removeEventListener("updateGatewayLanguage", this.updateGatewayLanguage);
  }

  shouldComponentUpdate(nextProps, nextState) {
    // Stops TPane from re-rendering when the check module changes state
    return nextState !== this.state;
  }

  updateTargetLanguage() {
    var targetLanguage = api.getDataFromCommon("targetLanguage");
    if (targetLanguage) {
      this.setState({
        targetLanguage: targetLanguage
      });
    }
    else {
      console.error(TARGET_LANGUAGE_ERROR);
    }
  }

  updateOriginalLanguage() {
    var originalLanguage = api.getDataFromCommon("originalLanguage");
    if (originalLanguage) {
      this.setState({
        originalLanguage: originalLanguage
      });
    }
    else {
      console.error(ORIGINAL_LANGUAGE_ERROR);
    }
  }

  updateGatewayLanguage() {
    var gatewayLanguage = api.getDataFromCommon("gatewayLanguage");
    if (gatewayLanguage) {
      this.setState({
        gatewayLanguage: gatewayLanguage
      });
    }
    else {
      console.error(GATEWAY_LANGUAGE_ERROR);
    }
  }

  render() {
    return (
      <Well style={{margin: '5px 0 5px 0'}}>
        <h3 style={{width: '100%', marginTop: '-8px'}}>Scriptural Context</h3>
        <Row>
          {/* Original Language */}
          <Pane greek={true}
                content={this.state.originalLanguage}
                dir={'ltr'} />
          {/* Gateway Language */}
          <Pane content={this.state.gatewayLanguage}
                dir={'ltr'} />
          {/* Target Langauge */}
          <Pane last={true}
                content={this.state.targetLanguage}
                dir={this.state.tlDirection} />
        </Row>
      </Well>
    );
  }
}

module.exports = TPane;
