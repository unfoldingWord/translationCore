
const api = window.ModuleApi;

module.exports = function(params, progress, onComplete) {
  api.putDataInCheckStore('CommentBox', 'currentChanges', '');
  progress(100);
  onComplete();
};
