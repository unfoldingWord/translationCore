import Repo, { isMatched, readGitDir } from "../Repo";
import path from "path-extra";
import fs from "fs-extra";

jest.unmock("fs-extra");

describe("static methods", () => {
  it("should return the project name of a git.door43.org link", () => {
    let url = "https://git.door43.org/richmahn/en_tit_ulb.git";
    let projectName = Repo.parseRemoteUrl(url);
    expect(projectName).toEqual({
      "full_name": "richmahn/en_tit_ulb",
      "host": "https://git.door43.org/",
      "name": "en_tit_ulb",
      "owner": "richmahn"
    });
  });

  it("check if the directory is isDirty", async () => {
    const dir = path.join(__dirname, "../../../../"); // use this repo as a benchmark
    let exceptionThrown = false;
    let data = null;
    try {
      const repo = new Repo(dir);
      data = await repo.isDirty();
    } catch (e) {
      exceptionThrown = true;
    }
    expect(exceptionThrown).toBeFalsy();
    expect(typeof data).toEqual("boolean");
  });

  it("lists files in a directory", async () => {
    const readPath = path.normalize(__dirname);
    const files = await readGitDir(readPath);
    expect(files.length > 0).toBeTruthy();
    for (const f of files) {
      const abs_path = path.join(__dirname, f);
      // must be relative
      expect(f).not.toEqual(expect.stringContaining(__dirname));
      // must not be dir
      expect(fs.statSync(abs_path).isDirectory()).toBeFalsy();
      // must not be the input path
      expect(abs_path).not.toEqual(readPath);
    }
  });

  it("check if the directory is a git repo", async () => {
    const dir = path.join(__dirname, "../../../../"); // use this repo as a benchmark
    expect(await Repo.isRepo(dir)).toEqual(true);
    expect(await Repo.isRepo("missing")).toEqual(false);
  });

  it("checks if a string matches expressions", () => {
    const result = isMatched("/path/to/contextId.json", [".*/contextId.json"]);
    expect(result).toBeTruthy();
  });

  it("checks if a string matches path", () => {
    const result = isMatched("/path/to/contextId.json", ["/path/to/contextId.json"]);
    expect(result).toBeTruthy();
  });

  it("checks if a string does not match an expression", () => {
    const result = isMatched("/path/to/contextId.json", ["/something.json"]);
    expect(result).not.toBeTruthy();
  });
});

describe("sanitize remote url", () => {
  it("should return the git.door43.org for a live.door43.org link", () => {
    let url = "https://live.door43.org/u/richmahn/en_tit_ulb/120df21085/";
    let gitUrl = Repo.sanitizeRemoteUrl(url);
    let expectedUrl = "https://git.door43.org/richmahn/en_tit_ulb.git";
    expect(gitUrl).toBe(expectedUrl);
  });

  it("should return the git.door43.org for a www.door43.org link", () => {
    let url = "https://www.door43.org/u/richmahn/en_tit_ulb/120df21085/";
    let gitUrl = Repo.sanitizeRemoteUrl(url);
    let expectedUrl = "https://git.door43.org/richmahn/en_tit_ulb.git";
    expect(gitUrl).toBe(expectedUrl);
  });

  it("should return the git.door43.org for a door43.org link", () => {
    let url = "https://www.door43.org/u/richmahn/en_tit_ulb/";
    let gitUrl = Repo.sanitizeRemoteUrl(url);
    let expectedUrl = "https://git.door43.org/richmahn/en_tit_ulb.git";
    expect(gitUrl).toEqual(expectedUrl);
  });

  it("should return the git.door43.org for a git.door43.org link", () => {
    let url = "   https://git.door43.org/richmahn/en_tit_ulb   ";
    let gitUrl = Repo.sanitizeRemoteUrl(url);
    let expectedUrl = "https://git.door43.org/richmahn/en_tit_ulb.git";
    expect(gitUrl).toEqual(expectedUrl);
  });

  it("should return an empty string for a bad link", () => {
    let url = "https://bad.door43.org/u/richmahn/en_tit_ulb";
    let gitUrl = Repo.sanitizeRemoteUrl(url);
    let expectedUrl = null;
    expect(gitUrl).toEqual(expectedUrl);
  });

  it("should return an empty string for an invalid project link", () => {
    let url = "https://git.door43.org/richmahn/en_tit_ulb/stuff";
    let gitUrl = Repo.sanitizeRemoteUrl(url);
    let expectedUrl = null;
    expect(gitUrl).toEqual(expectedUrl);
  });
});
