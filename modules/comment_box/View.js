//View.js//

const api = window.ModuleApi;
const React = api.React;
const style = require('./style');

const NAMESPACE = 'CommentBox';

class CommentBox extends React.Component {
  constructor() {
    super();
    this.state = {
      comment: ""
    };
  }

  componentWillMount() {
    if (typeof this.props.val == "string") {
      this.setState({comment: this.props.val});
      api.getDataFromCheckStore(NAMESPACE)['currentChanges'] = this.props.val;
    }
  }

  componentWillReceiveProps(nextProps) {
    if (typeof nextProps.val == "string") {
      this.setState({comment: nextProps.val});
      api.getDataFromCheckStore(NAMESPACE)['currentChanges'] = nextProps.val;
    }
  }

  handleComment(e) {
    this.setState({comment: e.target.value});
    api.getDataFromCheckStore(NAMESPACE)['currentChanges'] = e.target.value;
  }

  // these next two functions will be used through a ref
  getComment() {
    return api.getDataFromCheckStore(NAMESPACE, 'currentChanges');
  }

  setComment(comment = "") {
    debugger;
    this.setState({comment: comment});
    api.putDataInCheckStore(NAMESPACE, "currentChanges", comment);
  }

  render() {
    return (
      <div style={style.paper}>
        <div style={style.sideline}></div>
        <div style={style.paperContent}>
          <textarea autofocus style={style.textarea} placeholder="Notes" value={this.state.comment}
                    onChange={this.handleComment.bind(this)} />
        </div>
      </div>
    );
  }
}

module.exports = {
    name: "CommentBox",
    view: CommentBox
}
