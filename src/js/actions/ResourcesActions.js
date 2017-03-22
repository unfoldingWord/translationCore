import consts from './CoreActionConsts'

export const addNewBible = (bibleName, bibleData) => ({
  type: consts.ADD_NEW_BIBLE_TO_RESOURCES,
  bibleName,
  bibleData
})

export const addNewResource = (resourceName, resourceData) => ({
  type: consts.ADD_NEW_RESOURCE,
  resourceName,
  resourceData
})
