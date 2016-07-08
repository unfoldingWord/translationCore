// TranslationWordsWorkerScript.js //

/**
 * @description This is a script that a webworker uses to find all occurences 
 * of a work within a Book of Bible formatted in json
 */


/**
 * @description This is the entry function that will tell the webworker what to search for 
 * and what to search in
 * @param {object} e - This is the parameter passed in, with a .data field
 */
 onmessage = function(e) {
 	var word = e.data.word;
 	var book = e.data.book;
 	var returnValue = [];
 	for (var chapter in book.chapters) {
 		for (var verse in chapter.verses) {
 			var index = verse.text.indexOf(word);
 			while(index != -1) {
 				returnValue.push({
 					"verse": verse.num,
 					"chapter": chapter.num,
 					"status": "UNCHECKED"
 				});
 				index = verse.text.indexOf(word, index + 1);
 			}
 		}
 	}
 	postMessage({"checks": returnValue, "word": e.data.word});
 }