
const api = window.ModuleApi;

const TranslationAcademyScraper = require('./TranslationAcademyScraper');

function fetchData(params, progress, callback) {
	TranslationAcademyScraper.getTranslationAcademySectionList(null, function(sectionList) {
		fetchAllSections(sectionList, progress, callback)
	});
}

function fetchAllSections(sectionList, progress, callback) {
	var promises = [];
	for(var sectionName in TranslationAcademyScraper.sectionList) {
		var promise = new Promise((resolve, reject) => {
			TranslationAcademyScraper.getSection(sectionName, resolve);
		});
		promises.push(promise);
	}
	Promise.all(promises).then(value => {
		console.log("promises succeeded");
		// TODO: eventually should save sections to json file
		api.putDataInCheckStore("TranslationAcademy", "sectionList", TranslationAcademyScraper.sectionList);
		callback();
	}, reason => {
		console.log("promises failed");
	});
}

module.exports = fetchData;