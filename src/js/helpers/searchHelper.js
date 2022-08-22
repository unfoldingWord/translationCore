import path from 'path-extra';
import fs from 'fs-extra';
import xre from 'xregexp';
import { normalizer } from 'string-punctuation-tokenizer';

const startWordRegex = '(?<=[\\s,.:;"\']|^)';
const endWordRegex = '(?=[\\s,.:;"\']|$)';

export function getSortedKeys(alignments, langID) {
  let keys = Object.keys(alignments);

  keys = keys.sort(function (a, b) {
    return a.localeCompare(b, langID, { sensitivity: 'base' });
  });

  return keys;
}

export function getCount(alignments) {
  const keys = Object.keys(alignments);
  let count = 0;

  for (const key of keys) {
    const alignments_ = alignments[key];
    count += alignments_.length;
  }
  return count;
}

export function indexAlignments(alignments) {
  const lemmaAlignments = {};
  const targetAlignments = {};
  const sourceAlignments = {};
  const sourceKeys = Object.keys(alignments);

  for (const sourceKey of sourceKeys) {
    if (!sourceAlignments[sourceKey]) {
      sourceAlignments[sourceKey] = [];
    }

    const targetAlignments_ = alignments[sourceKey];
    const targetKeys = Object.keys(targetAlignments_);

    for (const targetKey of targetKeys) {
      const targetAlignment = targetAlignments_[targetKey];
      const sourceLemma = targetAlignment.sourceLemma;

      if (!lemmaAlignments[sourceLemma]) {
        lemmaAlignments[sourceLemma] = [];
      }
      lemmaAlignments[sourceLemma].push(targetAlignment);
      const targetText = targetAlignment.targetText;

      if (!targetAlignments[targetText]) {
        targetAlignments[targetText] = [];
      }

      targetAlignments[targetText].push(targetAlignment);
      sourceAlignments[sourceKey].push(targetAlignment);
    }
  }
  return {
    lemmaAlignments,
    targetAlignments,
    sourceAlignments,
  };
}

export function regexSearch(keys, search, flags) {
  const found = [];
  const regex = xre(search, flags);

  for (const key of keys) {
    const results = regex.test(key);

    if (results) {
      found.push(key);
    }
  }

  return found;
}

/**
 * build regex search string
 * @param {string} search
 * @param {boolean} fullWord
 * @param caseInsensitive
 * @returns {boolean} {{search: string, flags: string}}
 */
export function buildSearchRegex(search, fullWord, caseInsensitive) {
  let flags = 'u'; // enable unicode support
  search = xre.escape(normalizer(search)); // escape any special character we are trying to match

  if (search.includes('\\?') || search.includes('\\*')) { // check for wildcard characters
    search = search.replaceAll('\\?', '\\S{1}');
    search = search.replaceAll('\\*', '\\S*');
  }

  if (fullWord) {
    search = `${startWordRegex}${search}${endWordRegex}`;
  }

  if (caseInsensitive) {
    flags += 'i';
  }

  return { search, flags };
}

export function loadAlignments(jsonPath) {
  try {
    const alignments = fs.readJsonSync(jsonPath);
    const baseName = path.parse(jsonPath).name;
    const [targetLang, descriptor, origLang] = baseName.split('_');

    const {
      lemmaAlignments,
      targetAlignments,
      sourceAlignments,
    } = indexAlignments(alignments);
    const lemmaKeys = getSortedKeys(lemmaAlignments, origLang);
    const sourceKeys = getSortedKeys(sourceAlignments, origLang);
    const targetKeys = getSortedKeys(targetAlignments, targetLang);
    const target = { keys: targetKeys, alignments: targetAlignments };
    const source = { keys: sourceKeys, alignments: sourceAlignments };
    const lemma = { keys: lemmaKeys, alignments: lemmaAlignments };
    return {
      alignments,
      targetLang,
      descriptor,
      origLang,
      target,
      lemma,
      source,
    };
  } catch (e) {
    console.warn(`loadAlignments() - could not read ${jsonPath}`);
  }
  return null;
}

export function searchAlignmentsSub(search, flags, keys, alignments) {
  const foundKeys = regexSearch(keys, search, flags);
  const foundAlignments = [];

  for (const key of foundKeys) {
    const alignments_ = alignments[key];
    Array.prototype.push.apply(foundAlignments, alignments_);
  }
  return foundAlignments;
}

export function searchAlignments(search_, fullWord, caseInsensitive, keys, alignments) {
  const { search, flags } = buildSearchRegex(search_, fullWord, caseInsensitive);
  const foundAlignments = searchAlignmentsSub(search, flags, keys, alignments);
  return foundAlignments;
}

export function searchAlignmentsAndAppend(search, flags, config, searchData, found) {
  const found_ = searchAlignmentsSub(search, flags, searchData.keys, searchData.alignments);

  if (found_.length) {
    for (const item of found_) {
      const duplicate = found.includes(item); // ignore duplicates

      if (!duplicate) {
        found.push(item);
      }
    }
  }
}

export function multiSearchAlignments(alignmentData, search_, config) {
  const { search, flags } = buildSearchRegex(search_, config.fullWord, config.caseInsensitive);

  const found = [];

  if (config.searchTarget) {
    searchAlignmentsAndAppend(search, flags, config, alignmentData.target, found);
  }

  if (config.searchLemma) {
    searchAlignmentsAndAppend(search, flags, config, alignmentData.lemma, found);
  }

  if (config.searchSource) {
    searchAlignmentsAndAppend(search, flags, config, alignmentData.source, found);
  }
  return found;
}
