//View.js//

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
  
  componentWillMount() {
    if (typeof this.props.val == "string") {
      this.setState({comment: this.props.val});
      api.getDataFromCheckStore(NAMESPACE)['currentChanges'] = this.state.comment;
    } 
  }

  componentWillReceiveProps(nextProps) {
    if (typeof nextProps.val == "string") {
      this.setState({comment: nextProps.val});
      api.getDataFromCheckStore(NAMESPACE)['currentChanges'] = this.state.comment;
    } 
  }

  handleComment(e) {
    this.setState({comment: e.target.value});
  }

  handleSubmit(e) {
    api.getDataFromCheckStore(NAMESPACE)['currentChanges'] = this.state.comment;
    this.setState({open: false, comment: ""});
  }
  // these next two functions will be used through a ref
  getComment() {
    return api.getDataFromCheckStore(NAMESPACE, 'currentChanges');
  }

  setComment(comment = "") {
    this.setState({comment: comment});
    api.putDataInCheckStore(NAMESPACE, "currentChanges", comment);
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

module.exports = {
    name: "CommentBox",
    view: CommentBox
}
