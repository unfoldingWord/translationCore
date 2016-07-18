//FetchData.js//

const api = window.ModuleApi;
const Door43DataFetcher = require("./Door43DataFetcher");

function fetchData(params, progressCallback, callback) {
	var bookData;
    var Door43Fetcher = new Door43DataFetcher();
    Door43Fetcher.getBook(params.bookAbbr, function(done, total) {
        progressCallback((done / total) * 0.5);}, function(error, data) {
            if (error) {
                console.log('Door43Fetcher throwing error');
                callback(error);
            }
        else {
            bookData = Door43Fetcher.getULBFromBook(data);

            //Check to see if we need to populate the TPane
            var gatewayLanguage = api.getDataFromCommon('gatewayLanguage');
            if (!gatewayLanguage) {
                var newBookData = {};
                newBookData[params.bookAbbr] = {};
                for (var chapter of bookData.chapters) {
                    newBookData[params.bookAbbr][chapter.num.toString()] = {};
                    for (var verse of chapter.verses) {
                        newBookData[params.bookAbbr][chapter.num.toString()][verse.num.toString()] = verse.text;
                    }
                }
                // console.dir(newBookData);
                newBookData[params.bookAbbr].title = "2Timothy";
                api.putDataInCommon('gatewayLanguage', newBookData[params.bookAbbr]);
            }
            callback();
        }
    });
}

module.exports = fetchData;