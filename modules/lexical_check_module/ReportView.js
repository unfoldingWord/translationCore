const React = require('react');

module.exports = function(chap, verse) {
  if (verse == 0) {
    if (chap == 0) {
      return (<div>{"Main report lexical check"}</div>);
    }
    else {
      return (<div>{`Main lexical check for chapter ${chap}`}</div>);
    }
  }
  else {
    return (<div>{`Lexical check for ${chap}-${verse}`}</div>);
  }
}
