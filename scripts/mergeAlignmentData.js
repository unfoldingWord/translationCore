/**
 * Syntax: node scripts/mergeAlignmentData.js
 *
 * to debug: node --inspect-brk scripts/mergeAlignmentData.js
 */
require('babel-polyfill'); // required for async/await
const path = require('path-extra');
const fs = require('fs-extra');
const ospath = require('ospath');
const skipExisting = true;

const mergeAlignments = () => {
  // const files = [
  //   'en_ult_Door43-Catalog_el-x-koine_alignmentsIndex2_master_35552.json'
  // ];
  const alignmentsPath = path.join(ospath.home(), 'translationCore/alignmentData');
  let errors = false;
  const alignments = {};

  try {
    let files = fs.readdirSync(alignmentsPath);

    for (const file of files) {
      if (path.parse(file).ext !== '.json') {
        continue; // skip files not json
      }

      const filePath = path.join(alignmentsPath, file);
      const [ languageID, bible, owner, origLang, , tag] = file.split('_');

      const csvFilename = `${languageID}_${bible}_${owner}_${origLang}_${tag}_alignments.tsv`;
      const csvFilePath = path.join(alignmentsPath, csvFilename);

      if (skipExisting && fs.existsSync(csvFilePath)) {
        console.log(`Skipping over existing CSV ${csvFilename}`);
        continue;
      }

      if (fs.existsSync(filePath)) {
        console.log(`Processing ${file}`);
        const data = fs.readJsonSync(filePath);
        const alignments_ = data.alignments;

        if (!alignments_.length) {
          continue; // skip empty alignments
        }

        for (const alignment_ of alignments_) {
          const {
            sourceText,
            sourceLemma,
            strong,
            morph,
            targetText,
          } = alignment_;

          if (!alignments[sourceText]) {
            alignments[sourceText] = {};
          }

          let group = alignments[sourceText];

          if (!group[targetText]) {
            group[targetText] = {};
          }

          group = group[targetText];
          group.refs = alignment_.refs;
          group.strong = alignment_.strong;
          group.morph = alignment_.morph;
          group.sourceLemma = alignment_.sourceLemma;
        }

        // unravel
        const alignmentArray = [];
        const sourceTexts = Object.keys(alignments).sort();

        for (const sourceText of sourceTexts) {
          if (!sourceText) {
            continue;
          }

          const sourceGroup = alignments[sourceText];
          const targetTexts = Object.keys(sourceGroup).sort();

          for (const targetText of targetTexts) {
            const targetData = sourceGroup[targetText];
            const alignment = {
              sourceText,
              targetText,
              ...targetData,
            };
            delete alignment.refs;

            for (const ref of targetData.refs) {
              alignmentArray.push({
                ...alignment,
                ref,
              });
            }
          }
        }

        // console.log(alignmentArray);
        writeCsv(csvFilePath, alignmentArray);
      } else {
        console.error(`file not found ${filePath}`);
        errors = true;
      }
    }
  } catch (e) {
    console.error(`fault`, e);
    errors = true;
  }

  if (errors) {
    console.error('mergeAlignments() - Errors on trimming resources:\n' + errors);
    return 1; // error
  }
  console.log('mergeAlignments() - Updating Succeeded!!!');
  return 0; // no error
};

/**
 *
 * @param filename
 * @param list
 */
function writeCsv(filename, list) {
  const csvLines = [];
  let line = null;
  const cols = Object.keys(list[0]);

  // write header
  csvLines.push(cols.join('\t'));

  for (const item of list) {
    line = [];

    for (const col of cols) {
      line.push(item[col] + '');
    }
    csvLines.push(line.join('\t'));
  }
  fs.writeFileSync(filename, csvLines.join('\n') + '\n', 'utf8');
}

/**
 * iterate through process arguments and separate out flags and other parameters
 * @return {{flags: [], otherParameters: []}}
 */
function separateParams() {
  const flags = [];
  const otherParameters = [];

  for (let i = 2, l = process.argv.length; i < l; i++) {
    const param = process.argv[i];

    if (param.substr(0, 1) === '-') { // see if flag
      flags.push(param);
    } else {
      otherParameters.push(param);
    }
  }
  return { flags, otherParameters };
}

/**
 * see if flag is in flags
 * @param {Array} flags
 * @param {String} flag - flag to match
 * @return {Boolean}
 */
function findFlag(flags, flag) {
  const found = flags.find((item) => (item === flag));
  return !!found;
}

// run as main
if (require.main === module) {
  const { flags, otherParameters } = separateParams();

  // if (otherParameters.length < 2) {
  //   console.error('Syntax: node scripts/resources/minimalResources.js [flags] <path to resources> <language> [language...]');
  //   return 1;
  // }
  //
  // const resourcesPath = otherParameters[0];
  // const languages = otherParameters.slice(1);
  //
  // if (! fs.existsSync(resourcesPath)) {
  //   console.error('Directory does not exist: ' + resourcesPath);
  //   process.exitCode = 1; // set exit error code
  //   return;
  // }

  const code = mergeAlignments();
  console.log(`Returning code ${code}`);
  process.exitCode = code; // set exit code, 0 = no error
}
