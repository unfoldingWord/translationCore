/**
 * @author Ian Hoegen
 * @description This component displays the Original Language, Gateway Language,
 *              and the Target Language. It takes it's input from uploads.
 ******************************************************************************/
 const React = require('react');

 const Grid = require('react-bootstrap/lib/Grid.js');
 const Row = require('react-bootstrap/lib/Row.js');

 const CoreStore = require('../../stores/CoreStore.js');

 const Pane = require('./Pane');

 const TPane = React.createClass({
   getInitialState: function() {
     return ({
       ol: "",
       tl: "",
       gl: ""
     });
   },
   componentWillMount: function() {
     CoreStore.addChangeListener(this.updateOriginalLanguage);
     CoreStore.addChangeListener(this.updateTargetLanguage);
     CoreStore.addChangeListener(this.updateGatewayLanguage);
   },
   updateTargetLanguage: function() {
     this.setState({
       tl: CoreStore.getTargetLanugage()
     });
   },
   updateOriginalLanguage: function() {
     this.setState({
       ol: CoreStore.getOriginalLanugage()
     });
   },
   updateGatewayLanguage: function() {
     this.setState({
       gl: CoreStore.getGatewayLanguage()
     });
   },
   render: function() {
     return (
      <Grid>
        <Row>
          <Pane title="Original Language" content={this.state.ol}/>
          <Pane title="Gateway Language" content={this.state.gl}/>
          <Pane title="Target Language" content={this.state.tl}/>
        </Row>
      </Grid>
  );
   }
 });
 module.exports = TPane;
