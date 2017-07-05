require('../src/js/pages/index');
var workingProjectURL = 'https://git.door43.org/royalsix/id_-co_text_reg';
var missingVerseProjectURL = 'https://git.door43.org/royalsix/bes_tit_text_reg.git';
var mergeConflictProjectURL = 'https://git.door43.org/royalsix/ceb_2ti_text_ulb_L2.git';
function getProjects() {
    return new Promise((resolve, reject) => {
        loadOnline(workingProjectURL, ()=>{
            loadOnline(missingVerseProjectURL, ()=>{
                loadOnline(mergeConflictProjectURL, resolve);
            });
        });
    });
}
getProjects();