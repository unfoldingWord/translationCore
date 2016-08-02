
const api = window.ModuleApi;
const React = api.React;
const RB = api.ReactBootstrap;
const {Button, FormGroup, Panel} = RB;
const style = require('./style');

const NAMESPACE = 'CommentBox';

class CommentBox extends React.Component {
  constructor() {
    super();
    this.state = {
      open: false,
      comment: ""
    };
  }

  handleComment(e){
    this.value = e.target.value;
    this.setState({comment: this.value});
  }

  handleSubmit(e) {
    api.getDataFromCheckStore(NAMESPACE)['currentChanges'] = this.state.comment;
    this.setState({open: false});
    this.setState({comment: ""});
  }

  render() {
    return (
      <div style={style.width}>
        <Button bsStyle="primary"
          onClick={ ()=> this.setState({ open: !this.state.open })} style={style.width}>
            Comment
        </Button>
        <Panel collapsible expanded={this.state.open} style={style.panelBackgroundColor}>
          <div style={style.background}>
            <div style={style.paper}>
              <div style={style.sideline}></div>
                <div style={style.paperContent}>
                  <textarea autofocus style={style.textarea} value={this.state.comment}
                    onChange={this.handleComment.bind(this)} />
                </div>
            </div>
          </div>
          <Button bsStyle="success" onClick={this.handleSubmit.bind(this)}
            style={style.width}>Submit</Button>
        </Panel>
      </div>
    );
  }
}

module.exports = CommentBox;
