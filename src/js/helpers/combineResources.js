/**
 * Extract resources from languages.
 * @param {object} languages - Resources organized by languages.
 * @returns {array} - Array of the available resources organized by languages
 */
export const languagesObjectToResourcesArray = (languages) => {
  let result = [];

  Object.keys(languages).forEach((key) => {
    const resourcesInLanguages = languages[key];
    result = result.concat(resourcesInLanguages);
  });

  return result;
};

/**
 * Extract resources from each language and combine them into an array.
 * @param {array} resources - List of languages with their respective resources.
 * @returns {array} array of all the resources from the languages.
 */
export const extractAllResources = (resources) => {
  let allAvailableResources = [];

  resources.forEach(resource => {
    allAvailableResources = allAvailableResources.concat(resource.resources);
  });

  return allAvailableResources;
};

/**
 * Store resources in an object by languages
 * @param {array} resources - List of languages with their respective resources.
 * @returns {object} - An object where the resources for a language are organized.
 */
export const createLanguagesObjectFromResources = (resources) => {
  const result = {};

  resources.forEach(({ languageId, resources }) => {
    result[languageId] = resources;
  });

  return result;
};
