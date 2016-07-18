
const api = window.ModuleApi;

const TranslationAcademyScraper = require('./TranslationAcademyScraper');

function fetchData(params, progress, callback) {
	TranslationAcademyScraper.getTranslationAcademySectionList(null, 
		function(data) {
			api.putDataInCheckStore("TranslationAcademy", "sectionList", data);
			callback();
		}
	);

}

module.exports = fetchData;