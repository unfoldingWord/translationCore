/**
 * @description: This file builds the books to be displayed
 * @author: Ian Hoegen
 ******************************************************************************/
 const React = require('react');

 var Verse = React.createClass({
   render: function() {
     return (
    <p key={this.props.id}>
      <strong>{this.props.verseNumber} </strong>
      {this.props.verseText}
    </p>
  );
   }
 });
 var Chapter = React.createClass({
   render: function() {
     return (
    <div>
        <h5 key={this.props.chapterNum}>
        <strong>Chapter {this.props.chapterNum}</strong></h5>
        <div>{this.props.arrayOfVerses}</div>
    </div>
  );
   }
 });
 var BookTitle = React.createClass({
   render: function() {
     return (
    <h4>{this.props.title} </h4>
  );
   }
 });
 var Book = React.createClass({
   render: function() {
     var chapterArray = [];
     for (var key in this.props.input) {
       if (this.props.input.hasOwnProperty(key) && key !== 'title') {
         var chapterNum = parseInt(key);
         var arrayOfVerses = [];
         for (var verse in this.props.input[key]) {
           if (this.props.input[key].hasOwnProperty(verse)) {
             var verseId = key + ':' + verse;
             var verseText = this.props.input[key][verse];
             arrayOfVerses.push(
              <Verse id={verseId} verseNumber={verse} verseText={verseText} />
            );
           }
         }
         chapterArray.push(
            <Chapter chapterNum={chapterNum} arrayOfVerses={arrayOfVerses}/>
          );
       }
     }
     return (
        <div>
        <BookTitle title = {this.props.input.title} />
          {chapterArray}
          </div>
      );
   }
 });

 module.exports = Book;
