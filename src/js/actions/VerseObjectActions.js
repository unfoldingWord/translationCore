/**
 * @description returns a flat array of VerseObjects (currently needed for rendering UGNT since words may be nested in milestones)
 * @param {Object|Array} verse - verseObjects that need to be flattened.
 * @return {array} wordlist - flat array of VerseObjects
 */
export const getWordListForVerse = (verse) => {
  let words = [];
  if (verse.verseObjects) {
    flattenVerseObjects(verse.verseObjects, words);
  } else { // already a flat word list
    words = verse;
  }
  return words;
};

/**
 * @description flatten verse objects from nested format to flat array
 * @param {array} verse - source array of nested verseObjects
 * @param {array} words - output array that will be filled with flattened verseObjects
 */
const flattenVerseObjects = (verse, words) => {
  for (let object of verse) {
    if (object) {
      if (object.type === 'word') {
        object.strong = object.strong || object.strongs;
        words.push(object);
      } else if (object.type === 'milestone') { // get children of milestone
        // add content attibute to children
        const newObject = addContentAttributeToChildren(object.children, object);
        flattenVerseObjects(newObject, words);
      } else {
        words.push(object);
      }
    }
  }
};

const addContentAttributeToChildren = (childrens, parentObject, grandParentContent) => {
  return childrens.map((child) => {
    if (child.children) {
      child = addContentAttributeToChildren(child.children, child, parentObject.content);
    } else if (!child.content && parentObject.content) {
      const childrenContent = [parentObject.content];
      if (grandParentContent) childrenContent.push(grandParentContent);
      child.content = childrenContent;
    }
    return child;
  });
};
