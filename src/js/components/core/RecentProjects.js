function addToRecent(path) {
  var previousProjects = localStorage.getItem('previousProjects');
  previousProjects = previousProjects ? JSON.parse(previousProjects) : [];
  if (!previousProjects.includes(path)) previousProjects.push(path);
  localStorage.setItem('previousProjects', JSON.stringify(previousProjects));
}

exports.add = addToRecent;
