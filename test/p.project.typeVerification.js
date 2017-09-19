import { describe, it } from 'mocha';
import { expect } from 'chai';
import fs from 'fs-extra';
//helpers
import * as ProjectSelectionHelpers from '../src/js/helpers/ProjectSelectionHelpers';
//projects
const OBS_project_1 = window.__base + 'test/fixtures/project/projectVerification/obs_project_1';
const OBS_project_2 = window.__base + 'test/fixtures/project/projectVerification/obs_project_2';
const multibook_project_1 = window.__base + 'test/fixtures/project/projectVerification/multibook_project_1';
const multibook_project_2 = window.__base + 'test/fixtures/project/projectVerification/multibook_project_2';
const en_ta_project = window.__base + 'test/fixtures/project/projectVerification/en_ta';
const en_tw_project = window.__base + 'test/fixtures/project/projectVerification/en_tw';
const en_tn_project = window.__base + 'test/fixtures/project/projectVerification/en_tn';

describe('ProjectSelectionHelpers.testResourceByType', () => {
  it('should detect project as translationNotes', function (done) {
    let errMessage = ProjectSelectionHelpers.testResourceByType(en_tn_project, 'tn');
    expect(errMessage).to.be.true;
    done();
  });
  it('should detect project as translationAcademy', function (done) {
    let errMessage = ProjectSelectionHelpers.testResourceByType(en_ta_project, 'ta');
    expect(errMessage).to.be.true;
    done();
  });
  it('should detect project as translationWords', function (done) {
    let errMessage = ProjectSelectionHelpers.testResourceByType(en_tw_project, 'tw');
    expect(errMessage).to.be.true;
    done();
  });

  it('should not detect project as translationNotes if it isnt', function (done) {
    let errMessage = ProjectSelectionHelpers.testResourceByType(en_ta_project, 'tn');
    expect(errMessage).to.be.false;
    done();
  });
  it('should not detect project as translationAcademy if it isnt', function (done) {
    let errMessage = ProjectSelectionHelpers.testResourceByType(en_tn_project, 'ta');
    expect(errMessage).to.be.false;
    done();
  });
  it('should not detect project as translationWords if it isnt', function (done) {
    let errMessage = ProjectSelectionHelpers.testResourceByType(en_ta_project, 'tw');
    expect(errMessage).to.be.false;
    done();
  });
});

describe('ProjectSelectionHelpers.generalMultiBookProjectSearch', () => {
  it('should detect project as having multiple books', function (done) {
    let numberOfUSFMBooksInProjects = ProjectSelectionHelpers.generalMultiBookProjectSearch(multibook_project_1);
    expect(numberOfUSFMBooksInProjects).to.be.greaterThan(1);
    done();
  });
  it('should detect project as having multiple books', function (done) {
    let numberOfUSFMBooksInProjects = ProjectSelectionHelpers.generalMultiBookProjectSearch(multibook_project_2);
    expect(numberOfUSFMBooksInProjects).to.be.greaterThan(1);
    done();
  });
});

