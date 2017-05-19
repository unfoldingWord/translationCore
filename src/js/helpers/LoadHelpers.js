import Path from 'path-extra';
import * as fs from 'fs-extra';
import ManifestGenerator from '../components/core/create_project/ProjectManifest';
import BooksOfBible from '../components/core/BooksOfBible';
import usfm from 'usfm-parser';

const PACKAGE_SUBMODULE_LOCATION = Path.join(window.__base, 'tC_apps');
const DEFAULT_SAVE = Path.join(Path.homedir(), 'translationCore');

/**
 *
 * @param {string} projectBook - Book abbreviation
 */
export function isOldTestament (projectBook) {
    var passedBook = false;
    for (var book in BooksOfBible) {
        if (book == projectBook) passedBook = true;
        if (BooksOfBible[book] == "Malachi" && passedBook) {
            return true;
        }
    }
    return false;
}

/**
 *
 * @param {string} path - Directorty of the file to load, not the file name.
 * @param {string} file - The file name to load.
 */
export function loadFile(path, file) {
    try {
        var manifest = fs.readJsonSync(Path.join(path, file));
        return manifest;
    }
    catch (e) {
        return null
    }
}

/**
 * @description - Generates and saves a translationCore manifest file
 * @param {string} projectSaveLocation - Filepath of where the translationCore manifest file will
 * be saved. Must be an ABSOLUTE PATH
 * @param {object} data - The translationCore manifest data to be saved
 * @param {object} tsManifest - The translationStudio manifest data loaded from a translation
 * studio project
 */
export function saveManifest (projectSaveLocation, link, oldManifest, currentUser) {
    var data = {
        user: [currentUser],
        repo: link
    }
    var manifest;
    try {
        var manifestLocation = Path.join(projectSaveLocation, 'manifest.json');
        if (oldManifest.package_version == '3') {
            //some older versions of ts-manifest have to be tweaked to work
            manifest = this.fixManifestVerThree(oldManifest);
        } else {
            manifest = ManifestGenerator(data, oldManifest);
        }
        fs.outputJsonSync(manifestLocation, manifest);
    }
    catch (err) {
        console.error(err);
    }
    return manifest;
}

/**
 * @desription - Uses the tc-standard format for projects to make package_version 3 compatible
 * @param {object} oldManifest - The name of an employee.
 */
export function fixManifestVerThree (oldManifest) {
    var newManifest = {};
    try {
        for (var oldElements in oldManifest) {
            newManifest[oldElements] = oldManifest[oldElements];
        }
        newManifest.finished_chunks = oldManifest.finished_frames;
        newManifest.ts_project = {};
        newManifest.ts_project.id = oldManifest.project_id;
        newManifest.ts_project.name = this.convertToFullBookName(oldManifest.project_id);
        for (var el in oldManifest.source_translations) {
            newManifest.source_translations = oldManifest.source_translations[el];
            var parameters = el.split("-");
            newManifest.source_translations.language_id = parameters[1];
            newManifest.source_translations.resource_id = parameters[2];
            break;
        }
    } catch (e) {
        console.error(e);
    }
    return newManifest;
}

/**
 *
 * @param {string} bookAbbr - The book abbreviation to convert
 */
export function convertToFullBookName (bookAbbr) {
    if (!bookAbbr) return;
    return BooksOfBible[bookAbbr.toString().toLowerCase()];
}

/**
 * @description Formats and saves manifest according to tC standards,
 * if not already done so
 *
 * @param {string} projectPath - Path in which the project is being loaded from
 * @param {string} projectLink - Link given to load project if taken from online
 * @param {object} manifest - Default manifest given in order to load a non-usfm project
 */
export function setUpManifest(projectPath, projectLink, manifest, currentUser) {
    const verifiedManifest = verifyChunks(projectPath, manifest);
    let newManifest = saveManifest(projectPath, projectLink, verifiedManifest, currentUser);
    return newManifest;
}

/**
 * @description Stores the project path loaded into the default tC folder
 * location. If the project is exists in the default save location and it is
 * loaded from some place else, user will be prompted to overwrite it. Which results
 * in a deletion of the non-tC folder loaction project.
 *
 * @param {string} projectPath - Path in which the project is being loaded from
 */
 export function correctSaveLocation(projectPath) {
   const parsedPath = Path.parse(projectPath);
   const tCProjectsSaveLocation = Path.join(DEFAULT_SAVE, parsedPath.name);

   if (!fs.existsSync(projectPath)) {
     return false;
   }
   if (fs.existsSync(tCProjectsSaveLocation)) {
     return tCProjectsSaveLocation;
   } else {
     let newPath = tCProjectsSaveLocation
     if (checkIfUSFMFileOrProject(projectPath) !== false) {
       newPath = Path.join(tCProjectsSaveLocation, parsedPath.name);
     }
     fs.copySync(projectPath, newPath);
     return tCProjectsSaveLocation;
   }
 }

/**
 * @description Sets up the folder in the tC save location for a USFM project
 *
 * @param {string} usfmFilePath - Path of the usfm file that has been loaded
 * @param {string} projectSaveLocation - Folder path containing the usfm file loaded
 */
export function setUpUSFMProject(usfmFilePath, projectSaveLocation) {
    const parsedPath = Path.parse(usfmFilePath);
    const saveFile = Path.join(projectSaveLocation, parsedPath.base);
    const usfmData = fs.readFileSync(usfmFilePath).toString();
    return usfmData
}


/**
 * @description Sets up a USFM project manifest according to tC standards.
 *
 * @param {object} parsedUSFM - The object containing usfm parsed by chapters
 * @param {string} direction - Direction of the book being read for the project target language
 * @param {objet} user - The current user loaded
 */
export function setUpDefaultUSFMManifest(parsedUSFM, direction, user) {
    const name = user ? user.username : 'Unknown';
    const defaultManifest = {
        "source_translations": [
            {
                "language_id": "en",
                "resource_id": "ulb",
                "checking_level": "",
                "date_modified": new Date(),
                "version": ""
            }
        ],
        tcInitialized: true,
        target_language: {
            direction: direction,
            id: "",
            name: name
        },
        project_id: parsedUSFM.book,
        ts_project: {
            id: parsedUSFM.book,
            name: convertToFullBookName(parsedUSFM.book)
        }
    }
    return defaultManifest;
}

/**
 * @description Parses the usfm file using usfm-parse library.
 *
 * @param {string} projectPath - Path in which the USFM project is being loaded from
 */
export function getParsedUSFM(usfmData) {
    try {
        let parsedUSFM = usfm.toJSON(usfmData);
        parsedUSFM.book = parsedUSFM.headers['id'].split(" ")[0].toLowerCase();
        return parsedUSFM;
    } catch (e) {
        console.error(e);
    }
}

/**
 * @description Check if project is ephesians or titus, or if user is in developer mode.
 *
 * @param {object} manifest - Manifest specified for tC load, already formatted.
 */
export function checkIfValidBetaProject(manifest) {
    if (manifest && manifest.project) return manifest.project.id == "eph" || manifest.project.id == "tit";
    else if (manifest && manifest.ts_project) return manifest.ts_project.id == "eph" || manifest.ts_project.id == "tit";
}


/**
 * @description Formats a default manifest according to tC standards
 *
 * @param {string} path - Path in which the project is being loaded from, also should contain
 * the target language.
 * @param {object} manifest - Manifest specified for tC load, already formatted.
 */
export function getParams(path, manifest) {
    const isArray = (a) => {
        return (!!a) && (a.constructor === Array);
    }
    if (manifest.package_version == '3') {
        manifest = fixManifestVerThree(manifest);
    }
    if (manifest.finished_chunks && manifest.finished_chunks.length == 0) {
        return null;
    }
    const ogPath = Path.join(window.__base, 'static', 'taggedULB');
    let params = {
        'originalLanguagePath': ogPath
    }
    const UDBPath = Path.join(window.__base, 'static', 'taggedUDB');
    params.targetLanguagePath = path;
    params.gatewayLanguageUDBPath = UDBPath;
    try {
        if (manifest.ts_project) {
            params.bookAbbr = manifest.ts_project.id;
        }
        else if (manifest.project) {
            params.bookAbbr = manifest.project.id;
        }
        else {
            params.bookAbbr = manifest.project_id;
        }
        if (isArray(manifest.source_translations)) {
            if (manifest.source_translations.length == 0) params.gatewayLanguage = "Unknown";
            else params.gatewayLanguage = manifest.source_translations[0].language_id;
        } else {
            params.gatewayLanguage = manifest.source_translations.language_id;
        }
        params.direction = manifest.target_language ? manifest.target_language.direction : null;
        if (isOldTestament(params.bookAbbr)) {
            params.originalLanguage = "hebrew";
        } else {
            params.originalLanguage = "greek";
        }
    } catch (e) {
        console.error(e);
    }
    return params;
}

/**
 * @description Formated the target language accoring to tC standards
 * @param {object} parsedUSFM - The object containing usfm parsed by chapters
 */
export function formatTargetLanguage(parsedUSFM) {
    let targetLanguage = {};
    targetLanguage.title = parsedUSFM.book;
    const chapters = parsedUSFM.chapters;
    for (let ch in chapters) {
        targetLanguage[chapters[ch].number] = {};
        const verses = chapters[ch].verses;
        for (let v in verses) {
            const verseText = verses[v].text.trim();
            targetLanguage[chapters[ch].number][verses[v].number] = verseText;
        }
    }
    if (parsedUSFM.headers) {
        const parsedHeaders = parsedUSFM.headers;
        if (parsedHeaders['mt1']) {
            targetLanguage.title = parsedHeaders['mt1'];
        } else if (parsedHeaders['id']) {
            targetLanguage.title = BooksOfBible[parsedHeaders['id'].toLowerCase()];
        }
    }
    return targetLanguage;
}

/**
 * @description Checks if the folder/file specified is a usfm project
 *
 * @param {string} projectPath - Path in which the project is being loaded from
 */
export function checkIfUSFMFileOrProject(projectPath) {
    try {
        fs.readFileSync(projectPath);
        const ext = projectPath.split(".")[1];
        if (ext == "usfm" || ext == "sfm") return projectPath;
    } catch (e) {
        try {
            let dir = fs.readdirSync(projectPath);
            for (let i in dir) {
                const ext = dir[i].split(".")[1];
                if (ext == "usfm" || ext == "sfm") return Path.join(projectPath, dir[i]);
            }
            return false;
        } catch (err) {
            return false;
        }
    }
}

/**
 * @description Verifies that the manifest given has an accurate count of finished chunks.
 *
 * @param {string} projectPath - Path in which the project is being loaded from
 * @param {object} manifest - Manifest specified for tC load, already formatted.
 */
export function verifyChunks(projectPath, manifest) {
    if (!projectPath || !manifest) return null;
    const chunkChapters = fs.readdirSync(projectPath);
    let finishedChunks = [];
    for (const chapter in chunkChapters) {
        if (!isNaN(chunkChapters[chapter])) {
            const chunkVerses = fs.readdirSync(projectPath + '/' + chunkChapters[chapter]);
            for (let chunk in chunkVerses) {
                const currentChunk = chunkVerses[chunk].replace(/(?:\(.*\))?\.txt/g, '');
                const chunkString = chunkChapters[chapter].trim() + '-' + currentChunk.trim();
                if (!finishedChunks.includes(chunkString)) {
                    finishedChunks.push(chunkString);
                }
            }
        }
    }
    manifest.finished_chunks = finishedChunks;
    manifest.tcInitialized = true;
    return manifest;
}


/**
 * @description creates an array that has the data of each included tool and 'subtool'
 *
 * @param {object} dataObject - Package json of the tool being loaded,
 * meta data of what the tool needs to load.
 * @param {string} moduleFolderName - Folder path of the tool being loaded.
 */
export function createCheckArray(dataObject, moduleFolderName) {
    let modulePaths = [];
    try {
        if (!dataObject.name || !dataObject.version || !dataObject.title || !dataObject.main) {
            return;
        } else {
            modulePaths.push({ name: dataObject.name, location: moduleFolderName });
            for (let childFolderName in dataObject.include) {
                //If a developer hasn't defined their module in the corret way, this'll probably throw an error
                if (Array.isArray(dataObject.include)) {
                    modulePaths.push({
                        name: dataObject.include[childFolderName],
                        location: Path.join(PACKAGE_SUBMODULE_LOCATION, dataObject.include[childFolderName])
                    });
                } else {
                    modulePaths.push({
                        name: childFolderName,
                        location: Path.join(PACKAGE_SUBMODULE_LOCATION, childFolderName)
                    });
                }
            }
            return modulePaths;
        }
    } catch (e) {
        console.error(e)
    }
}
/**
 * This method reads in all the chunks of a project, and determines if there are any missing verses
 * @param {String} book - Full name of the book
 * @param {String} projectSaveLocation - The current save location of the project
 * @returns {Boolean} True if there is any missing verses, false if the project does not contain any
 */
export function checkMissingVerses(book, projectSaveLocation) {
    let chapterArray = [];
    let hash = {}
    let chapters = fs.readdirSync(projectSaveLocation);
    for (let chapter of chapters) {
        let intRepresentation = parseInt(chapter);
        if (!isNaN(intRepresentation)) {
            chapterArray[intRepresentation] = chapter;
        }
    }
    if (expectedVerses[book]) {
        if (expectedVerses[book].length !== chapterArray.length-1) {
            return true;
        }
    }
    for (let i = 1; i < chapterArray.length; i++) {
        if (!chapterArray[i]) {
            return true;
        }
        hash[i] = [];
        let verses = fs.readdirSync(Path.join(projectSaveLocation, chapterArray[i]));
        for (let chunk in verses) {
            let chunkContents = fs.readFileSync(Path.join(projectSaveLocation, chapterArray[i], verses[chunk])).toString();
            chunkContents = chunkContents.replace(/\\c \d+/g, '').trim();
            let splitChunks = chunkContents.split('\\v');
            for (let verse in splitChunks) {
                let current = splitChunks[verse].trim();
                let currentVerse = current.match(/^\d+/);
                hash[i][currentVerse] = current.replace(/\d/g, "").trim();
            }
        }
        if (expectedVerses[book]) {
            if (expectedVerses[book][i] !== hash[i].length-1) {
                return true;
            }
        }
        for (let j = 1; j < hash[i].length; j++ ) {
            if (!hash[i][j] || hash[i][j] === "") {
                return true;
            }
        }
    }
    return false;
}

const expectedVerses = {
    "Ephesians" : {
        length: 6,
        1: 23,
        2: 22,
        3: 21, 
        4: 32,
        5: 33,
        6: 24
    },
    "Titus": {
        length: 3,
        1: 16,
        2: 15,
        3: 15
    }
}
/**
 * This method reads in all the chunks of a project, and determines if there is any merge conflicts.
 * @param {Array} projectChunks - An array of finished chunks, as defined by the manfest
 * @param {String} projectPath - The current save location of the project
 * @returns {Boolean} True if there is any merge conflicts, false if the project does not contain any
 */
export function findMergeConflicts(projectChunks, projectPath) {
    for (let chapterVerse in projectChunks) {
        let splitID = projectChunks[chapterVerse].split('-');
        let chapter = splitID[0];
        let verse = splitID[1];
        let filePath = Path.join(projectPath, chapter, verse + ".txt");
        let fileContents = fs.readFileSync(filePath).toString();
        if (~fileContents.indexOf('<<<<<<<')) {
            return true;
        }
    }
    return false;
}

export function migrateAppsToDotApps(projectPath) {
    let projectDir = fs.readdirSync(projectPath);
    if (projectDir.includes('apps') && projectDir.includes('.apps')) {
        fs.removeSync(Path.join(projectPath, '.apps'))
    }
    if (projectDir.includes('apps')) {
        fs.renameSync(Path.join(projectPath, 'apps'), Path.join(projectPath, '.apps'));
    }
}