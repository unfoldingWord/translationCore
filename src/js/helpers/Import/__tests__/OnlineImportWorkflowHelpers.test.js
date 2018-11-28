/* eslint-env jest */
import path from "path-extra";

jest.mock("fs-extra");
import fs from "fs-extra";
import ospath from "ospath";
import {
  generateImportPath,
  verifyThisIsTCoreOrTStudioProject
} from "../OnlineImportWorkflowHelpers";

describe("OnlineImportWorkflowHelpers.generateImportPath", function() {

  beforeEach(() => {
    const destDir = path.join(ospath.home(), "translationCore", "imports",
      "sample_project");
    fs.ensureDirSync(destDir);
  });

  test("should succeed on valid URL", async () => {
    const url = "https://git.door43.org/klappy/bhadrawahi_tit.git";
    let importPath = await generateImportPath(url);
    expect(importPath).
      toEqual(
        expect.stringMatching(/.*translationCore\/imports\/bhadrawahi_tit/));
  });

  test("should throw error if already exists", async () => {
    const url = "https://git.door43.org/klappy/sample_project.git";
    await expect(generateImportPath(url)).
      rejects.
      toEqual(new Error("Project sample_project has already been imported."));
  });

  test("null link should show error", async () => {
    await expect(generateImportPath(null)).
      rejects.
      toEqual(new Error("The URL null does not reference a valid project"));
  });

  test("should handle missing .git", async () => {
    const url = "https://git.door43.org/klappy/bhadrawahi_tit";
    let importPath = await generateImportPath(url);
    expect(importPath).
      toEqual(
        expect.stringMatching(/.*translationCore\/imports\/bhadrawahi_tit/));
  });

});

describe("OnlineImportWorkflowHelpers.generateImportPath", function() {

  it("should import a ts-desktop generated project", async () => {
    const projectPath = "/project/path";
    const manifest = {
      generator: {
        name: "ts-desktop"
      }
    };
    fs.writeJSONSync(path.join(projectPath, "manifest.json"), manifest);
    expect(verifyThisIsTCoreOrTStudioProject(projectPath)).toBeTruthy();
  });

  it("should import a ts-android generated project", async () => {
    const projectPath = "/project/path";
    const manifest = {
      generator: {
        name: "ts-android"
      }
    };
    fs.writeJSONSync(path.join(projectPath, "manifest.json"), manifest);
    expect(verifyThisIsTCoreOrTStudioProject(projectPath)).toBeTruthy();
  });

  it("should import a tc-desktop generated project", async () => {
    const projectPath = "/project/path";
    const manifest = {
      generator: {
        name: "tc-desktop"
      }
    };
    fs.writeJSONSync(path.join(projectPath, "manifest.json"), manifest);
    expect(verifyThisIsTCoreOrTStudioProject(projectPath)).toBeTruthy();
  });

  it("should import a tcInitialized project", async () => {
    const projectPath = "/project/path";
    const manifest = {
      tcInitialized: true
    };
    fs.writeJSONSync(path.join(projectPath, "manifest.json"), manifest);
    expect(verifyThisIsTCoreOrTStudioProject(projectPath)).toBeTruthy();
  });

  it("should import a tc_version project", async () => {
    const projectPath = "/project/path";
    const manifest = {
      tc_version: 5
    };
    fs.writeJSONSync(path.join(projectPath, "manifest.json"), manifest);
    expect(verifyThisIsTCoreOrTStudioProject(projectPath)).toBeTruthy();
  });

  it("should not import a project with missing keys", async () => {
    const projectPath = "/project/path";
    const manifest = {};
    fs.writeJSONSync(path.join(projectPath, "manifest.json"), manifest);
    expect(verifyThisIsTCoreOrTStudioProject(projectPath)).not.toBeTruthy();
  });

  it("should not import a project with unknown generator", async () => {
    const projectPath = "/project/path";
    const manifest = {
      generator: {
        name: "my-app"
      }
    };
    fs.writeJSONSync(path.join(projectPath, "manifest.json"), manifest);
    expect(verifyThisIsTCoreOrTStudioProject(projectPath)).not.toBeTruthy();
  });

  it("should not import a project with missing manifest", async () => {
    const projectPath = "/project/path";
    expect(verifyThisIsTCoreOrTStudioProject(projectPath)).not.toBeTruthy();
  });

  it("should import a project with a tc-manifest.json", async () => {
    const projectPath = "/project/path";
    fs.writeJSONSync(path.join(projectPath, "tc-manifest.json"), {});
    expect(verifyThisIsTCoreOrTStudioProject(projectPath)).toBeTruthy();
  });
});
