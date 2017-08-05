import usfmParser from 'usfm-js';
const regex = /<<<<<<<\s?\w+:\w+([\s\S]*?)=======([\s\S]*?)>>>>>>>/g;

/**
 * Seaches usfm data with regex and returns all merge conflicts found separated by string.
 * Each element in the array represents a different version of the conflict.
 * The versions are split by pair of two naturally. 
 * 
 * @example ["1 this is the first version", "1 This is the second version"] - represents one verse conflict
 * @param {string} usfmData - usfm string to be searched for merge conflicts
 * @returns {[string]}
 */
export function getMergeConflicts(usfmData) {
    let allMergeConflictsFoundArray = [];
    let regexMatchedMergeConflicts;
    while ((regexMatchedMergeConflicts = regex.exec(usfmData)) !== null) {
        // This is necessary to avoid infinite loops with zero-width allMergeConflictsFoundArray
        if (regexMatchedMergeConflicts.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        //removes unneeded full match in first index
        regexMatchedMergeConflicts.shift();

        regexMatchedMergeConflicts.forEach((match, groupIndex) => {
            allMergeConflictsFoundArray.push(match);
        });
    }
    /*
    * If there is an odd amount of total versions at least one version
    * is not matched with a corresponding version with different history
    */ 
    if (allMergeConflictsFoundArray.length % 2 !== 0) return console.error('Problem parsing merge conflicts');
    return allMergeConflictsFoundArray;
}

/**
 * Parsing the merge conflict version text in an object more easily consumable for the displaying container
 * @param {string} versionText - The verse string with the number being the first character
 * @param {string} usfmData - The selected usfm file being parsed
 */
export function parseMergeConflictVersion(versionText, usfmData) {
    /**
     * Parsing usfm string to get verse numbers
     * @type {{1:"Verse one", 2:"Verse 1"}}
     */
    let parsedTextObject = usfmParser.toJSON(versionText.trim());
    /**@example {['1', '2', '3']} */
    let verseNumbersArray = Object.keys(parsedTextObject);
    let verses = `${verseNumbersArray[0]}-${verseNumbersArray[verseNumbersArray.length - 1]}`;
    let entireUSFMObjectParsed = usfmParser.toJSON(usfmData);
    let chapter;
    //Determining the chaper the verse string is coming from
    for (var chapterNum in entireUSFMObjectParsed) {
        if (!parseInt(chapterNum)) continue;
        let chapterObject = entireUSFMObjectParsed[chapterNum];
        for (var verseNum in chapterObject) {
            let verseObject = chapterObject[verseNum];
            if (verseObject.includes(parsedTextObject[verseNumbersArray[0]])) {
                chapter = chapterNum;
            }
        }
    }
    return {
        chapter,
        verses,
        text: parsedTextObject
    }
}