import ResourceApi from "./ResourceAPI";
import ProjectAPI from "./ProjectAPI";
import fs from "fs-extra";
import path from "path-extra";

/**
 * Copies all of a tool's group data into a project.
 * @param {string} gatewayLanguage - the gateway language code
 * @param {string} toolName - the name of the tool for which helps will be copied
 * @param {string} projectDir - path to the project directory
 */
export function copyGroupDataToProject(gatewayLanguage, toolName, projectDir) {
  const project = new ProjectAPI(projectDir);
  const resources = ResourceApi.default();
  const helpDir = resources.getLatestTranslationHelp(gatewayLanguage, toolName);

  if (helpDir) {
    // list help categories
    const categories = fs.readdirSync(helpDir).filter(file => {
      return fs.lstatSync(path.join(helpDir, file)).isDirectory();
    });

    for(const category of categories) {
      if(!project.isCategoryLoaded(toolName, category)) {
        // copy un-loaded category group data into project
        const resourceCategoryDir = path.join(helpDir, category);
        const files = fs.readdirSync(resourceCategoryDir);
        for(const f of files) {
          const dataPath = path.join(resourceCategoryDir, f);
          project.importCategoryGroupData(toolName, dataPath);
        }
        // loading complete
        project.setCategoryLoaded(toolName, category);
      }
    }
  }
}

/**
 * Loads all of a tool's group data from the project.
 * @param {string} toolName - the name of the tool who's helps will be loaded
 * @param {string} projectDir - the absolute path to the project
 * @returns {*}
 */
export function loadLoadProjectGroupData(toolName, projectDir) {
  const project = new ProjectAPI(projectDir);
  return project.getGroupsData(toolName);
}
