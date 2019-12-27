import { tNotesCategories } from 'tsv-groupdata-parser';
import {
  toolCardCategories,
  TRANSLATION_WORDS,
} from '../common/constants';

export function hasAllNeededData(toolName, parentCategory, subcategories, lookupNames) {
  return !!lookupNames[parentCategory] && subcategories.length > 0 && (tNotesCategories[parentCategory] || toolName === TRANSLATION_WORDS);
}

export function sortSubcategories(subcategories) {
  return subcategories.sort((a, b) => {
    a = a.name;
    b = b.name;

    if (a < b) {
      return -1;
    } else if (a > b) {
      return 1;
    }
    return 0;
  });
}

/**
 * turn group object of category objects into set of objects
 */
export function flattenNotesCategories() {
  let lookupNames = {};

  Object.keys(toolCardCategories).forEach(item => {
    lookupNames[item] = 'tool_card_categories.' + item;
  });
  return lookupNames;
}
