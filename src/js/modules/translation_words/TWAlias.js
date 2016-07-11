/**
 * @author Evan "He who googles the things" Wiederspan
 * @description This functi
 *
 *
 *
 *
 *
*/

function TWAlias(files = [], progCallback = () => {}) {
  var numDone = 0;
  const numToDo = files.length;
  for (let file in files) {
    
  }



  function finished() {
    progCallback(++numDone / numToDo);
  }
}

module.exports = TWAlias;
