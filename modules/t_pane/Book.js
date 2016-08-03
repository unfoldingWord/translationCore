/**
 * @description: This file builds the books to be displayed
 * @author: Ian Hoegen
 ******************************************************************************/
 // const React = require('react');

const api = window.ModuleApi;

 const BookTitle = require('./BookTitle');
 const Chapter = require('./Chapter');
 const Verse = require('./Verse');

const React = api.React;

class Book extends React.Component {
  constructor() {
    super();
    this.goToVerseListener = this.goToVerseListener.bind(this);
  }

  componentWillMount() {
    api.registerEventListener('goToVerse', this.goToVerseListener);
  }

  componentWillUnmount() {
    api.removeEventListener('goToVerse', this.goToVerseListener);
  }

  goToVerseListener(params) {
    var verseComp = this.refs[params.chapterNumber.toString() + ":" + params.verseNumber.toString()];
    var element = api.findDOMNode(verseComp);
    if (element) {
      element.scrollIntoView();
    }
  }

  render() {
    debugger;
    var chapterArray = [];
    var title = "";

    var list = this.props.input;
    if (typeof(list) === 'object') {
      var keysSorted = Object.keys(list);
      keysSorted.sort();
    }

    if (this.props.input !== undefined) {
      if (this.props.input.hasOwnProperty('title')) {
        title = this.props.input.title;   
      }
    }
    for (var key in keysSorted) {
      var objectKey = keysSorted[key];
      if (this.props.input.hasOwnProperty(objectKey) && objectKey !== 'title') {
        var chapterNum = parseInt(objectKey);
        var arrayOfVerses = [];
        for (var verse in this.props.input[objectKey]) {
          if (this.props.input[objectKey].hasOwnProperty(verse)) {
            var verseId = objectKey + ':' + verse;
            var verseText = this.props.input[objectKey][verse];
            arrayOfVerses.push(
              <Verse 
                key={verseId} 
                greek={this.props.greek} 
                chapterNumber={chapterNum} 
                verseNumber={verse} 
                verseText={verseText}
                ref={chapterNum + ":" + verse}
              />
            );
          }
        }
        chapterArray.push(
          <Chapter key = {chapterNum}
            chapterNum = {chapterNum}
            arrayOfVerses = {arrayOfVerses}/>
        );
      }
    }
    return (
      <div>
        <BookTitle title ={title} />
          {chapterArray}
      </div>
    );
  }
}


 module.exports = Book;
