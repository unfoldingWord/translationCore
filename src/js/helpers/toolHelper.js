import path from "path-extra";
import fs from "fs-extra";

/**
 * Legacy wrapper to load all tools in the app
 * @returns {Promise<void>}
 */
export const loadAllTools = async () => {
  return loadToolsInDir(path.join(__dirname, "../../../tC_apps"));
};

/**
 * Loads all of the tools found in a directory
 * @ {string} dir - the directory containing tools to load
 * @returns {Array}
 */
export const loadToolsInDir = async toolsDir => {
  const tools = [];

  const toolsExist = await fs.pathExists(toolsDir);
  if(!toolsExist) {
    console.warn(`No tools found in missing directory ${toolsDir}`);
    return [];
  }

  const files = await fs.readdir(toolsDir);
  for(const f of files) {
    const toolPath = path.join(toolsDir, f);
    const stat = await fs.stat(toolPath);
    if(stat.isDirectory()) {
      try {
        const tool = await loadTool(toolPath);
        tools.push(tool);
      } catch (e) {
        console.error(`Failed to load tool "${f}"`, e);
      }
    }
  }

  return tools;
};

/**
 * Loads a tool from a directory.
 * This validates and loads the tool.
 * @param {string} toolDir - path to the tool directory
 * @return the tool object.
 */
export const loadTool = async toolDir => {
  const basename = path.basename(toolDir);
  const packagePath = path.join(toolDir, "package.json");
  const badgePath = path.join(toolDir, "badge.png");

  // Validate package files
  const validatePaths = [packagePath, badgePath];
  for(const p of validatePaths) {
    const exists = await fs.pathExists(p);
    if (!exists) {
      throw new Error(`Error loading tool "${basename}". Missing ${p}`);
    }
  }

  // load the actual tool
  const meta = await fs.readJson(packagePath);
  let tool = null;
  try {
    tool = require(path.join(toolDir, meta.main)).default;
  } catch (e) {
    throw new Error(`Error loading tool "${basename}"`, e);
  }

  // patch in some extra props
  tool.badge = badgePath;
  tool.version = meta.version;
  tool.title = meta.title;
  tool.description = meta.description;
  tool.path = toolDir;
  return tool;
};
