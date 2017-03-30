import Path from 'path';
import * as fs from 'fs-extra';
import ManifestGenerator from '../components/core/create_project/ProjectManifest';
import BooksOfBible from '../components/core/BooksOfBible';

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
 * Returns if is ephesians or titus or in developer mode
 * 
 * @param {object} manifest - the manifest to check.
 */
export function checkIfValidBetaProject (manifest) {
    if (manifest && manifest.project) return manifest.project.id == "eph" || manifest.project.id == "tit";
    else if (manifest && manifest.ts_project) return manifest.ts_project.id == "eph" || manifest.ts_project.id == "tit";
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