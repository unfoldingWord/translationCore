/**
 * @description: This file builds the books to be displayed
 * @author: Ian Hoegen
 ******************************************************************************/
 const React = require('react');

 const BookTitle = require('./BookTitle');
 const Chapter = require('./Chapter');
 const Verse = require('./Verse');

 const Book = React.createClass({
   render: function() {
     var chapterArray = [];
     var title = "";
     if (this.props.input !== undefined) {
       if (this.props.input.hasOwnProperty('title')) {
         title = this.props.input.title;
       }
     }
     for (var key in this.props.input) {
       if (this.props.input.hasOwnProperty(key) && key !== 'title') {
         var chapterNum = parseInt(key);
         var arrayOfVerses = [];
         for (var verse in this.props.input[key]) {
           if (this.props.input[key].hasOwnProperty(verse)) {
             var verseId = key + ':' + verse;
             var verseText = this.props.input[key][verse];
             arrayOfVerses.push(
              <Verse key={verseId} verseNumber={verse} verseText={verseText} />
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
 });

 module.exports = Book;
