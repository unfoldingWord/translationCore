import ResourceApi from "./ResourceAPI";
import ProjectAPI from "./ProjectAPI";
import fs from "fs-extra";
import path from "path-extra";

/**
 * Copies translation helps to a project as needed.
 * @param {string} gatewayLanguage - the gateway language code
 * @param {string} toolName - the name of the tool for which helps will be copied
 * @param {string} projectDir - path to the project directory
 */
export function copyTranslationHelpsToProject(
  gatewayLanguage, toolName, projectDir) {
  const project = new ProjectAPI(projectDir);
  const resources = ResourceApi.default();
  const helpDir = resources.getLatestTranslationHelp(gatewayLanguage, toolName);

  if (helpDir) {
    // list help categories
    const categories = fs.readdirSync(helpDir).filter(file => {
      return fs.lstatSync(path.join(helpDir, file)).isDirectory();
    });

    for(const category of categories) {
      if(!project.isToolCategoryLoaded(category)) {
        // copy un-loaded category
        const categoryDir = path.join(helpDir, category);

        // TODO: copy category into the project
      }
    }
  }
}

export function loadProjectTranslationHelps(projectDir) {
  // TODO: read the translation helps from the project and return the data
  // the data will be given to an action later on.
}
