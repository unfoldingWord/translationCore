import {describe, it} from 'mocha';
import { expect } from 'chai';
import fs from 'fs-extra';
//helpers
import * as csvMethods from '../src/js/utils/csvMethods';

const data = [{a: 'a,a', b: 'b,b'}, {a: 1, b: 2}];
const expected = "a,b\n\"a,a\",\"b,b\"\n1,2\n";
const filePath = './test/output/test.csv'

describe('csvMethods.generateCSVString', () => {
  it('should generate csv string from array of objects with the same keys', function (done) {
    csvMethods.generateCSVString(data, (err, csvString) => {
      expect(csvString).to.equal(expected);
      done();
    });
  });
})

describe('csvMethods.generateCSVString', () => {
  it('should generate csv file from array of objects with the same keys', function (done) {
    csvMethods.generateCSVFile(data, filePath).then( () => {
      const csvString = fs.readFileSync(filePath, 'utf8');
      expect(csvString).to.equal(expected);
      fs.removeSync(filePath);
      done();
    });
  });
})
