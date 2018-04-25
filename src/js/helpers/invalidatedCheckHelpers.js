import fs from 'fs-extra';
import path from 'path-extra';

export const loadTotalOfInvalidatedChecksForCurrentProject = (invalidatedFolderPath) => {
  let invalidatedChecksTotal = 0;

  const chapters = fs.readdirSync(invalidatedFolderPath).filter((filename) => filename !== '.DS_Store');

  chapters.forEach((chapter) => {
    const versesPath = path.join(invalidatedFolderPath, chapter);
    const verses = fs.readdirSync(versesPath).filter((filename) => filename !== '.DS_Store');
    verses.forEach((verse) => {
      const versePath = path.join(invalidatedFolderPath, chapter, verse);
      const files = fs.readdirSync(versePath).filter((filename) => filename !== '.DS_Store');
      const sorted = files.sort().reverse(); // sort the files to use latest
      const filePath = path.join(versePath, sorted[0]);
      const invalidatedFile = fs.readJsonSync(filePath);

      if (invalidatedFile.invalidated) invalidatedChecksTotal++;
    });
  });

  return invalidatedChecksTotal;
};

export const getTotalOfEditedVerses = (verseEditFolderPath) => {
  let verseEditsTotal = 0;

  const chapters = fs.readdirSync(verseEditFolderPath).filter((filename) => filename !== '.DS_Store');

  chapters.forEach((chapter) => {
    const versesPath = path.join(verseEditFolderPath, chapter);
    const verses = fs.readdirSync(versesPath).filter((filename) => filename !== '.DS_Store');
    verses.forEach(() => {
     verseEditsTotal++;
    });
  });

  return verseEditsTotal;
};
