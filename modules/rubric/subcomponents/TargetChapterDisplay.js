///TargetChapterDisplay.js//

const api = window.ModuleApi;
const React = api.React;
const style = require('../css/style.js');

/**
 * @description - This class defines the view for the TargetChapterDisplay Component
 */

class TargetChapterDisplay extends React.Component {
  constructor() {
    super();
    this.state = {
    }
  }

  getTargetChapter(){
    var chapter = this.props.getTargetChapter();
    var value = [];
    for(var key in chapter) {
    value.push(" " + key + ". " + chapter[key]);
    }
    return value;
  }

  render() {
    return (
      <div style={style.targetChapterLayout}>
        <div style={style.chapterHeader}>
          <span style={style.bookName}>{this.props.book}</span>
          {" Chapter " + this.props.currentChapter}
        </div>
        {this.getTargetChapter()}
      </div>
    );
  }
}




module.exports = TargetChapterDisplay;
