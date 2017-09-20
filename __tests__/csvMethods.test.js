/* eslint-env jest */

import fs from 'fs-extra';
import * as csvMethods from '../src/js/utils/csvMethods';

const data = [{a: 'a,a', b: 'b,b'}, {a: 1, b: 2}];
const expected = "a,b\n\"a,a\",\"b,b\"\n1,2\n";
const filePath = '__tests__/output/test.csv';

test('generate csv string from array of objects with the same keys', () => {
    return csvMethods.generateCSVString(data, (err, csvString) => {
        expect(csvString).toEqual(expected);
    });
});

test('generate csv file from array of objects with the same keys', () => {
    return csvMethods.generateCSVFile(data, filePath).then(() => {
        const csvString = fs.readFileSync(filePath, 'utf8');
        expect(csvString).toEqual(expected);
        fs.removeSync(filePath);
    });
});
