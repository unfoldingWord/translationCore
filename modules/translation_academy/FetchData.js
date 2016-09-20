/*
 * Events emitted:
 * 	translationAcademyLoaded:
 * 		params:
 * 			sections: an object where keys are section filenames, and values are section text
 * 		listeners:
 * 			TranslationNotesChecker FetchData: waits for translation academy to load so it can use
 * 			the section titles as its group headers
 */

const api = window.ModuleApi;

const TranslationAcademyScraper = require('./TranslationAcademyScraper');

function fetchData(params, progress, callback) {

	TranslationAcademyScraper.getFullTranslationAcademySectionList(function(sectionList) {
		fetchAllSections(sectionList, progress, callback)
	});
}

function fetchAllSections(sectionList, progress, callback) {
	// Start an asynchronous promise for each TA section
	var promises = [];
	for(var sectionName in TranslationAcademyScraper.sectionList) {
		var promise = new Promise((resolve, reject) => {
			// Save section text in TranslationAcademyScraper.sectionList
			TranslationAcademyScraper.getSection(sectionName, resolve);
		});
		promises.push(promise);
	}
	// When all sections are fetched, put them in CheckStore and call the callback
	Promise.all(promises).then(value => {
		var sectionList = TranslationAcademyScraper.sectionList;
		// TODO: eventually should save sections to json file
		api.putDataInCheckStore('TranslationAcademy', 'sectionList', sectionList);
		progress(100);
		callback();
	}, reason => {
		callback('Translation Academy failed to fetch section text.');
	});
}

module.exports = fetchData;
