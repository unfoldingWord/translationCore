export const languageResourcesObjectToFlattenArray = (languages) => {
  let result = [];

  Object.keys(languages).forEach((key) => {
    const resourcesInLanguages = languages[key];
    result = result.concat(resourcesInLanguages);
  });

  return result;
};

export const extractAllResources = (resources) => {
  let allAvailableResources = [];

  resources.forEach(resource => {
    allAvailableResources = allAvailableResources.concat(resource.resources);
  });

  return allAvailableResources;
};

/**
 * Creates an object where the resources for a language are organized.
 * @param {array} resources - List of languages data containing the resources for that language.
 * @returns An object where the resources for a language are organized.
 */
export const createLanguagesObjectFromResources = (resources) => {
  const result = {};

  resources.forEach(({ languageId, resources }) => {
    result[languageId] = resources;
  });

  return result;
};
