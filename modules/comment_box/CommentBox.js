
const api = window.ModuleApi;
const React = api.React;
const RB = api.ReactBootstrap;
const {Button, FormControl, FormGroup, ControlLabel} = RB;

const NAMESPACE = 'CommentBox';

class CommentBox extends React.Component {
  constructor() {
    super();
    this.state = {
      comment: ""
    };
  }

  handleComment(e){
    this.value = e.target.value;
    this.setState({comment: this.value});
  }

  handleSubmit(e) {
    api.getDataFromCheckStore(NAMESPACE)['currentChanges'] = this.state.comment;
    console.log(this.state.comment);
  }

  render() {
    return (
      <div>
        <FormGroup>
          <ControlLabel>Comment:</ControlLabel>
          <FormControl componentClass="textarea" style={{width: "100%", height: "100px", marginBottom:"10px"}} onChange={this.handleComment.bind(this)} />
          <Button bsStyle="success" style={{width: "100%"}} onClick={this.handleSubmit.bind(this)}>Submit</Button>
        </FormGroup>
      </div>
    );
  }
}

module.exports = CommentBox;
