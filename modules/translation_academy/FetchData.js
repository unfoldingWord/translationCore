
const api = window.ModuleApi;

const TranslationAcademyScraper = require('./TranslationAcademyScraper');

function fetchData(params, progress, callback) {
	TranslationAcademyScraper.getTranslationAcademySectionList(null, function(sectionList) {
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
		callback(getSectionFileNamesToTitles(sectionList), null);
	}, reason => {
		callback(null, 'Translation Academy failed to fetch.');
	});
}

// Returns an object where the keys are section filenames and the values are titles
function getSectionFileNamesToTitles(sectionList) {
	var sectionFileNamesToTitles = {};
	for(var sectionFileName in sectionList) {
		var titleKeyAndValue = sectionList[sectionFileName]['file'].match(/title: .*/)[0];
		var title = titleKeyAndValue.substr(titleKeyAndValue.indexOf(':') + 1);
		sectionFileNamesToTitles[sectionFileName] = title;
	}
	return sectionFileNamesToTitles;
}

module.exports = fetchData;